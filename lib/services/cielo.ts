import axios from 'axios';

export class CieloService {
  private static readonly SANDBOX_URL = 'https://apisandbox.cieloecommerce.cielo.com.br';

  static async processPayment(paymentData: any, merchantKeys: { publicKey: string, secretKey: string }) {
    console.log('[Cielo] Enviando transação para Sandbox...');

    try {
      // No futuro, a URL de destino será o seu Proxy do VGS
      const response = await axios.post(
        `${this.SANDBOX_URL}/1/sales`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'MerchantId': merchantKeys.publicKey,
            'MerchantKey': merchantKeys.secretKey,
          }
        }
      );

      return {
        success: true,
        provider: 'Cielo',
        transactionId: response.data.Payment.PaymentId,
        status: response.data.Payment.Status,
        rawResponse: response.data
      };

    } catch (error: any) {
      console.error('[Cielo] Erro na transação:', error.response?.data || error.message);
      return {
        success: false,
        provider: 'Cielo',
        error: error.response?.data?.[0]?.Message || 'Erro interno na Cielo'
      };
    }
  }
}
