import { IProvider, ProviderResponse } from './baseProvider';

export class RedeProvider implements IProvider {
  name = 'Rede';

  async execute(amount: number, cardToken: string): Promise<ProviderResponse> {
    console.log(`[Rede] Tentando processar R$ ${amount}...`);
    
    // A Rede será nosso porto seguro: sempre aprova (neste mock)
    return { 
      success: true, 
      transactionId: `rede_${Date.now()}`, 
      providerName: this.name 
    };
  }
}
