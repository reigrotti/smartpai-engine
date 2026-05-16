import axios from 'axios';

export class CieloService {
  private static readonly SANDBOX_URL = 'https://apisandbox.cieloecommerce.cielo.com.br';

  static async processPayment(paymentData: any, merchantKeys: { merchantId: string, merchantKey: string }) {
    console.log('[Cielo] Enviando transação para Sandbox...');

    // Estrutura obrigatória Cielo 3.0
    const payload = {
      "MerchantOrderId": `ROUTIQ-${Date.now()}`,
      "Customer": {
        "Name": paymentData.customerName || "Customer RoutIQ"
      },
      "Payment": {
        "Type": "CreditCard",
        "Amount": paymentData.amount, // Em centavos (ex: 1000 para R$ 10,00)
        "Installments": 1,
        "CreditCard": {
          "CardNumber": paymentData.cardNumber,
          "Holder": "RoutIQ Tester",
          "ExpirationDate": "12/2030",
          "SecurityCode": "123",
          "Brand": "Visa"
        }
      }
    };

    try {
      const response = await axios.post(
        `${this.SANDBOX_URL}/1/sales`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'MerchantId': merchantKeys.merchantId,
            'MerchantKey': merchantKeys.merchantKey,
          }
        }
      );

      return {
        success: true,
        provider: 'Cielo',
        rawResponse: response.data
      };

    } catch (error: any) {
      const details = error.response?.data;
      console.error('[Cielo] Erro na transação:', details || error.message);
      return {
        success: false,
        provider: 'Cielo',
        error: details?.[0]?.Message || 'Erro interno na Cielo'
      };
    }
  }
}