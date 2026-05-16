export interface ProviderResponse {
  success: boolean;
  pspReference?: string;
  error?: string;
  providerName: string;
  isSoftDecline?: boolean; // Gatilho mandatório para o Silent Recovery (Regra de Ouro #4)
}

export interface IProvider {
  name: string;
  execute(
    amount: number, 
    cardToken: string, 
    merchantKeys: { publicKey: string; secretKey: string }
  ): Promise<ProviderResponse>;
}