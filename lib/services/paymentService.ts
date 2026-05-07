import { CieloProvider } from '../providers/cieloProvider';
import { RedeProvider } from '../providers/redeProvider';
import { IProvider, ProviderResponse } from '../providers/baseProvider';
import { prisma } from '../prisma'; 

export interface PaymentRequest {
  merchantId: string;
  amount: number;
  cardToken: string;
}

export class PaymentService {
  private static providers: IProvider[] = [
    new CieloProvider(),
    new RedeProvider()
  ];

  static async process(data: PaymentRequest) {
    console.log(`[Orquestrador] Processando R$ ${data.amount}`);
    let lastError = '';

    for (const provider of this.providers) {
      try {
        const response: ProviderResponse = await provider.execute(data.amount, data.cardToken);

        // Tentativa de gravar no banco
        try {
          await prisma.transaction.create({
            data: {
              amount: data.amount,
              status: response.success ? 'approved' : 'failed',
              provider: response.providerName,
              error: response.error || null,
              merchantId: data.merchantId
            }
          });
        } catch (dbError: any) {
          console.error("Erro ao gravar transação no banco:", dbError.message);
          // Não travamos o fluxo se o banco der erro de log, mas avisamos no console
        }

        if (response.success) {
          return {
            status: 'approved',
            transactionId: response.transactionId,
            provider: response.providerName
          };
        }
        lastError = response.error || 'Erro no provedor';
      } catch (err: any) {
        lastError = err.message;
      }
    }
    throw new Error(`Falha total no orquestrador: ${lastError}`);
  }
}
