import { CieloProvider } from '../providers/cieloProvider';
import { RedeProvider } from '../providers/redeProvider';
import { IProvider, ProviderResponse } from '../providers/baseProvider';

export interface PaymentRequest {
  merchantId: string;
  amount: number;
  cardToken: string;
}

export class PaymentService {
  // Definimos a ordem de prioridade dos provedores
  private static providers: IProvider[] = [
    new CieloProvider(),
    new RedeProvider()
  ];

  static async process(data: PaymentRequest) {
    console.log(`[Orquestrador] Iniciando transação de R$ ${data.amount} para Merchant ${data.merchantId}`);
    
    let lastError = '';

    // Loop de Resiliência: Tenta cada provedor na ordem
    for (const provider of this.providers) {
      try {
        const response: ProviderResponse = await provider.execute(data.amount, data.cardToken);

        if (response.success) {
          console.log(`[Orquestrador] Sucesso via ${response.providerName}!`);
          return {
            status: 'approved',
            transactionId: response.transactionId,
            provider: response.providerName,
            processedAt: new Date().toISOString()
          };
        } else {
          console.warn(`[Orquestrador] Falha no provedor ${provider.name}: ${response.error}`);
          lastError = response.error || 'Erro desconhecido';
          // Continua para o próximo provedor no loop
        }
      } catch (err: any) {
        console.error(`[Orquestrador] Erro crítico em ${provider.name}:`, err.message);
        lastError = err.message;
      }
    }

    // Se sair do loop sem sucesso em nenhum provedor
    throw new Error(`Todos os provedores falharam. Último erro: ${lastError}`);
  }
}
