// Fonte única de dados de integrações (compartilhada entre Integrações e Rotas)

export type IntegrationType = "acquirer" | "payment_method" | "antifraud" | "reconciler"

export interface IntegrationCredentials {
  merchantId?: string
  apiKey?: string
  secretKey?: string
  pixKey?: string
  clientId?: string
  clientSecret?: string
}

export interface EstabelecimentoIntegrationState {
  enabled: boolean
  credentials: IntegrationCredentials
  credentialsConfigured: boolean
}

export interface IntegrationMeta {
  id: string
  name: string
  type: IntegrationType
}

// Metadados das integrações disponíveis na Plinia
export const integrationsMeta: IntegrationMeta[] = [
  { id: "cielo", name: "Cielo", type: "acquirer" },
  { id: "rede", name: "Rede", type: "acquirer" },
  { id: "konduto", name: "Konduto", type: "antifraud" },
  { id: "cybersource", name: "Cybersource", type: "antifraud" },
  { id: "equals", name: "Equals", type: "reconciler" },
  { id: "pix-santander", name: "Pix Santander", type: "payment_method" },
  { id: "pix-itau", name: "Pix Itaú", type: "payment_method" },
]

// Estado de ativação e credenciais por estabelecimento (mockado)
export const initialEstabelecimentoIntegrations: Record<string, Record<string, EstabelecimentoIntegrationState>> = {
  "1": {
    cielo: { enabled: true, credentials: { merchantId: "1234567890", apiKey: "****", secretKey: "****" }, credentialsConfigured: true },
    rede: { enabled: true, credentials: { merchantId: "9876543", apiKey: "****" }, credentialsConfigured: true },
    konduto: { enabled: true, credentials: { merchantId: "kdt-1001", apiKey: "****" }, credentialsConfigured: true },
    cybersource: { enabled: false, credentials: {}, credentialsConfigured: false },
    equals: { enabled: true, credentials: { clientId: "eq-client-1", clientSecret: "****" }, credentialsConfigured: true },
    "pix-santander": { enabled: true, credentials: { clientId: "pix-sant-1", clientSecret: "****", pixKey: "empresa@pix.com" }, credentialsConfigured: true },
    "pix-itau": { enabled: false, credentials: {}, credentialsConfigured: false },
  },
  "2": {
    cielo: { enabled: true, credentials: { merchantId: "2345678901", apiKey: "****", secretKey: "****" }, credentialsConfigured: true },
    rede: { enabled: false, credentials: {}, credentialsConfigured: false },
    konduto: { enabled: false, credentials: {}, credentialsConfigured: false },
    cybersource: { enabled: true, credentials: { merchantId: "cyb-2002", apiKey: "****", secretKey: "****" }, credentialsConfigured: true },
    equals: { enabled: false, credentials: {}, credentialsConfigured: false },
    "pix-santander": { enabled: false, credentials: {}, credentialsConfigured: false },
    "pix-itau": { enabled: true, credentials: { clientId: "pix-itau-2", clientSecret: "****", pixKey: "loja@pix.com" }, credentialsConfigured: true },
  },
  "3": {
    cielo: { enabled: false, credentials: {}, credentialsConfigured: false },
    rede: { enabled: true, credentials: { merchantId: "5432109", apiKey: "****" }, credentialsConfigured: true },
    konduto: { enabled: true, credentials: { merchantId: "kdt-3003", apiKey: "****" }, credentialsConfigured: true },
    cybersource: { enabled: false, credentials: {}, credentialsConfigured: false },
    equals: { enabled: true, credentials: { clientId: "eq-client-3", clientSecret: "****" }, credentialsConfigured: true },
    "pix-santander": { enabled: true, credentials: { clientId: "pix-sant-3", clientSecret: "****", pixKey: "marketplace@pix.com" }, credentialsConfigured: true },
    "pix-itau": { enabled: true, credentials: { clientId: "pix-itau-3", clientSecret: "****", pixKey: "marketplace@pix.com" }, credentialsConfigured: true },
  },
  "4": {
    cielo: { enabled: true, credentials: { merchantId: "3456789012", apiKey: "****", secretKey: "****" }, credentialsConfigured: true },
    rede: { enabled: true, credentials: { merchantId: "6789012", apiKey: "****" }, credentialsConfigured: true },
    konduto: { enabled: false, credentials: {}, credentialsConfigured: false },
    cybersource: { enabled: true, credentials: { merchantId: "cyb-4004", apiKey: "****", secretKey: "****" }, credentialsConfigured: true },
    equals: { enabled: false, credentials: {}, credentialsConfigured: false },
    "pix-santander": { enabled: false, credentials: {}, credentialsConfigured: false },
    "pix-itau": { enabled: false, credentials: {}, credentialsConfigured: false },
  },
}

// Retorna as integrações habilitadas de um estabelecimento, opcionalmente filtradas por tipo
export function getEnabledIntegrations(
  estabelecimentoId: string | null,
  types?: IntegrationType[],
): IntegrationMeta[] {
  if (!estabelecimentoId) return []
  const state = initialEstabelecimentoIntegrations[estabelecimentoId]
  if (!state) return []
  return integrationsMeta.filter((meta) => {
    const enabled = state[meta.id]?.enabled
    if (!enabled) return false
    if (types && !types.includes(meta.type)) return false
    return true
  })
}
