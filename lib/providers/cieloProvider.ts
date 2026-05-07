import { IProvider, ProviderResponse } from './baseProvider';

export class CieloProvider implements IProvider {
  name = 'Cielo';

  async execute(amount: number, cardToken: string): Promise<ProviderResponse> {
    console.log(`[Cielo] Tentando processar R$ ${amount}...`);
    
    // Simulação: Cielo falha se o valor for exatamente 500 (para testarmos o failover depois)
    if (amount === 500) {
      return { success: false, error: 'Instabilidade na Cielo', providerName: this.name };
    }

    return { 
      success: true, 
      transactionId: `cielo_${Date.now()}`, 
      providerName: this.name 
    };
  }
}
