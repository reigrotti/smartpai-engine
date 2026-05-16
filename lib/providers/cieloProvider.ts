import { IProvider, ProviderResponse } from './baseProvider';
import { CieloService } from '../services/cielo'; // Legado funcional

export class CieloProvider implements IProvider {
  name = 'Cielo';

  async execute(
    amount: number, 
    cardToken: string, 
    merchantKeys: { publicKey: string; secretKey: string }
  ): Promise<ProviderResponse> {
    console.log(`[Cielo] Iniciando processamento via API Real...`);
    
    // Regra de Ouro nº 4: Lógica de Sandbox/Demo (Valor final 99 falha na Cielo)
    const isDemoDecline = amount % 100 === 99;

    if (isDemoDecline) {
      console.log(`[Cielo] [DEMO] Forçando Soft Decline para valor final 99.`);
      return {
        success: false,
        error: 'Soft Decline - Transação não autorizada (Demo 99)',
        providerName: this.name,
        isSoftDecline: true // Gatilho mandatório para o Silent Recovery
      };
    }

    try {
      const credentials = {
        merchantId: merchantKeys.publicKey,
        merchantKey: merchantKeys.secretKey
      };

      // Consome o serviço legado forçando tipagem flexível para transição
      const result: any = await CieloService.processPayment({ 
        amount, 
        cardNumber: cardToken,
        customerName: "Reinaldo Teste Sênior"
      }, credentials);

      return {
        success: result.success,
        // Garante a extração do ID da transação independente do formato do legado
        pspReference: result.pspReference || result.externalId || `CIELO-${Date.now()}`,
        error: result.error,
        providerName: this.name,
        isSoftDecline: result.isSoftDecline || false
      };
    } catch (e: any) {
      console.error(`[Cielo] Erro de integração:`, e.message);
      return {
        success: false,
        error: e.message,
        providerName: this.name,
        isSoftDecline: true // Em caso de timeout ou falha de rede, assume soft decline para acionar o failover
      };
    }
  }
}