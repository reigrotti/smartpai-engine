import axios from 'axios';

export class RedeService {
  private static readonly SANDBOX_URL = 'https://api.userede.com.br/desenvolvedores/v1';

  static async processPayment(paymentData: any, merchantKeys: { publicKey: string, secretKey: string }) {
    console.log('[Rede] Enviando transação para Sandbox...');

    try {
      // A Rede utiliza Basic Auth ou Token. Para o MVP, estruturamos o Header:
      const response = await axios.post(
        `${this.SANDBOX_URL}/transactions`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${merchantKeys.secretKey}` // Exemplo de padrão Rede
          }
        }
      );

      return {
        success: true,
        provider: 'Rede',
        transactionId: response.data.tid,
        status: response.data.status,
        rawResponse: response.data
      };

    } catch (error: any) {
      console.error('[Rede] Erro na transação:', error.response?.data || error.message);
      return {
        success: false,
        provider: 'Rede',
        error: error.response?.data?.returnMessage || 'Erro interno na Rede'
      };
    }
  }
}