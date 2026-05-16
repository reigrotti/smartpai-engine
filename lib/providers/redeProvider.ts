import { IProvider, ProviderResponse } from './baseProvider';
import { RedeService } from '../services/rede'; // Importando seu legado funcional

export class RedeProvider implements IProvider {
  name = 'Rede';

  async execute(
    amount: number, 
    cardToken: string, 
    merchantKeys: { publicKey: string; secretKey: string }
  ): Promise<ProviderResponse> {
    console.log(`[Rede] Iniciando processamento via API Real...`);

    try {
      // Consome o serviço legado forçando tipagem flexível para transição
      const result: any = await RedeService.processPayment({
        amount,
        cardNumber: cardToken,
      }, merchantKeys);

      return {
        success: result.success,
        pspReference: result.pspReference || `REDE-${Date.now()}`,
        error: result.error,
        providerName: this.name,
        isSoftDecline: result.isSoftDecline || false
      };
    } catch (e: any) {
      console.error(`[Rede] Erro de integração:`, e.message);
      return {
        success: false,
        error: e.message,
        providerName: this.name,
        isSoftDecline: false // Se a Rede falhar na contingência, encerra a esteira
      };
    }
  }
}