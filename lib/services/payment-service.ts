import { RedeService } from './rede';
import { CieloService } from './cielo';

export class PaymentService {
  static async process(paymentData: any, merchantKeys: { publicKey: string, secret_key: string }) {
    console.log('[PaymentService] Iniciando cascata de roteamento...');

    // 1. TENTATIVA PRIORITÁRIA: REDE
    console.log('[PaymentService] Tentando Adquirente Primária: REDE');
    const redeResponse = await RedeService.processPayment(paymentData, {
      publicKey: merchantKeys.publicKey,
      secretKey: merchantKeys.secret_key
    });
    
    if (redeResponse.success) {
      return { ...redeResponse, fallback: false };
    }

    // 2. FALLBACK AUTOMÁTICO: CIELO (Só entra aqui se a Rede falhar)
    console.warn('[PaymentService] REDE falhou. Acionando FALLBACK: CIELO');
    
    const cieloResponse = await CieloService.processPayment(paymentData, {
      publicKey: merchantKeys.publicKey,
      secretKey: merchantKeys.secret_key
    });
    
    return {
      ...cieloResponse,
      wasRouted: true,
      fallback: true,
      originalError: redeResponse.error
    };
  }
}