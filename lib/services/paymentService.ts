import { prisma } from '../prisma';
import { CieloProvider } from '../providers/cieloProvider';
import { RedeProvider } from '../providers/redeProvider';

export async function processPayment(paymentRequest: any) {
  // 1. Validação de Merchant (SSOT: Multi-tenancy)
  // TODO: Em sprints futuras, migrar para validação via cabeçalho HTTP / Cache para latência sub-2ms
  const merchant = await prisma.merchant.findFirst({
    where: { secretKey: paymentRequest.secretKey }
  });

  if (!merchant) throw new Error("Merchant não autorizado.");

  // 2. Lógica de BIN (SSOT: Regra de Ouro nº 3)
  const cardNumber = String(paymentRequest.cardNumber);
  const bin = cardNumber.charAt(0);
  
  // Instancia dinamicamente a ordem da fila com base no BIN do cartão
  const primaryProvider = bin === '4' ? new CieloProvider() : new RedeProvider();
  const secondaryProvider = bin === '4' ? new RedeProvider() : new CieloProvider();
  
  const queue = [primaryProvider, secondaryProvider];
  let lastError = '';

  console.log(`[RoutIQ] BIN detectado: ${bin}. Rota Primária: ${primaryProvider.name}`);

  // 3. Loop de Contingência (Silent Recovery)
  for (const [index, provider] of queue.entries()) {
    try {
      const response = await provider.execute(paymentRequest.amount, cardNumber, {
        publicKey: merchant.publicKey,
        secretKey: merchant.secretKey
      });

      if (response.success) {
        // Se index > 0, a primeira adquirente falhou e o RoutIQ recuperou a venda
        const isRecovered = index > 0;

        // Persistência robusta no banco Cloud SQL via Prisma Client
        return await prisma.transaction.create({
          data: {
            pspReference: response.pspReference!,
            amount: paymentRequest.amount,
            acquirer: provider.name,
            merchantId: merchant.id,
            status: 'AUTHORIZED',
            recoveredByRoutIQ: isRecovered,
            bin: cardNumber.substring(0, 6),
            // Correção técnica: Envia os objetos puros, o Prisma trata a conversão JSONB interna
            rawAcquirerResponse: response as any,
            shopperData: { name: paymentRequest.customerName || "Não Informado" } as any,
            riskData: { score: 0 } as any
          }
        });
      }

      lastError = response.error || 'Erro na adquirente';
      
      // Regra de Ouro nº 4: Se não for Soft Decline (ex: Hard Decline), mata a fila e encerra
      if (!response.isSoftDecline) {
        console.log(`[RoutIQ] Hard Decline detectado em ${provider.name}. Interrompendo contingência.`);
        break;
      }

    } catch (e: any) {
      lastError = e.message;
      console.error(`[RoutIQ] Falha crítica no provider ${provider.name}:`, e.message);
    }
  }

  throw new Error(`[RoutIQ] Falha total no roteamento. Último erro: ${lastError}`);
}