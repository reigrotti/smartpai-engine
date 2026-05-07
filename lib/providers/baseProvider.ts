export interface ProviderResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
  providerName: string;
}

export interface IProvider {
  name: string;
  execute(amount: number, cardToken: string): Promise<ProviderResponse>;
}
