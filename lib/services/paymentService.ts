import { prisma } from '../prisma';

export interface PaymentRequest {
  merchantId: string;
  amount: number;
  cardToken: string;
}

export class PaymentService {
  static async process(data: PaymentRequest) {
    // Log para debug no console do servidor
    console.log(`[PaymentService] Iniciando processamento: R$ ${data.amount} para Merchant ${data.merchantId}`);
    
    // Por enquanto, simulamos uma aprovação automática
    const success = true; 
    
    if (success) {
      return { 
        status: 'approved', 
        transactionId: `txn_${Date.now()}`,
        processedAt: new Date().toISOString()
      };
    }
    
    throw new Error('Pagamento negado pela adquirente');
  }
}
