"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Building2, 
  QrCode,
  ShieldCheck,
  Scale,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Key,
  Lock,
  Eye,
  EyeOff,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEstabelecimento } from "@/contexts/estabelecimento-context"
import {
  initialEstabelecimentoIntegrations,
  type EstabelecimentoIntegrationState,
  type IntegrationCredentials,
} from "@/lib/integrations-data"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: "active" | "inactive" | "maintenance"
  type: "acquirer" | "payment_method" | "antifraud" | "reconciler"
  apiVersion?: string
  lastSync?: string
  credentialFields: { key: keyof IntegrationCredentials; label: string; type: "text" | "password" }[]
}

// Integrações disponíveis na Plinia
const pliniaIntegrations: Integration[] = [
  {
    id: "cielo",
    name: "Cielo",
    description: "Adquirente líder no mercado brasileiro. Suporta crédito, débito e parcelamento.",
    icon: <Building2 className="h-6 w-6" />,
    status: "active",
    type: "acquirer",
    apiVersion: "v3.1",
    lastSync: "2026-05-23 14:30:00",
    credentialFields: [
      { key: "merchantId", label: "Merchant ID", type: "text" },
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "secretKey", label: "Secret Key", type: "password" },
    ]
  },
  {
    id: "rede",
    name: "Rede",
    description: "Adquirente do Itaú Unibanco. Ampla cobertura e taxas competitivas.",
    icon: <Building2 className="h-6 w-6" />,
    status: "active",
    type: "acquirer",
    apiVersion: "v2.5",
    lastSync: "2026-05-23 14:28:00",
    credentialFields: [
      { key: "merchantId", label: "PV (Ponto de Venda)", type: "text" },
      { key: "apiKey", label: "Token", type: "password" },
    ]
  },
  {
    id: "konduto",
    name: "Konduto",
    description: "Antifraude com inteligência de navegação e machine learning para análise de risco em tempo real.",
    icon: <ShieldCheck className="h-6 w-6" />,
    status: "active",
    type: "antifraud",
    apiVersion: "v1.2",
    lastSync: "2026-05-23 14:25:00",
    credentialFields: [
      { key: "merchantId", label: "Merchant ID", type: "text" },
      { key: "apiKey", label: "API Key", type: "password" },
    ]
  },
  {
    id: "cybersource",
    name: "Cybersource",
    description: "Antifraude global da Visa. Decision Manager com regras avançadas e score de risco.",
    icon: <ShieldCheck className="h-6 w-6" />,
    status: "active",
    type: "antifraud",
    apiVersion: "v2.0",
    lastSync: "2026-05-23 14:20:00",
    credentialFields: [
      { key: "merchantId", label: "Merchant ID", type: "text" },
      { key: "apiKey", label: "API Key", type: "password" },
      { key: "secretKey", label: "Secret Key", type: "password" },
    ]
  },
  {
    id: "equals",
    name: "Equals",
    description: "Conciliador financeiro. Automatiza a conciliação de vendas, taxas e recebíveis das adquirentes.",
    icon: <Scale className="h-6 w-6" />,
    status: "active",
    type: "reconciler",
    apiVersion: "v3.0",
    lastSync: "2026-05-23 14:15:00",
    credentialFields: [
      { key: "clientId", label: "Client ID", type: "text" },
      { key: "clientSecret", label: "Client Secret", type: "password" },
    ]
  },
  {
    id: "pix-santander",
    name: "Pix Santander",
    description: "Pagamento instantâneo via Pix pelo Santander. QR Code dinâmico e liquidação imediata.",
    icon: <QrCode className="h-6 w-6" />,
    status: "active",
    type: "payment_method",
    apiVersion: "v1.0",
    lastSync: "2026-05-23 14:32:00",
    credentialFields: [
      { key: "clientId", label: "Client ID", type: "text" },
      { key: "clientSecret", label: "Client Secret", type: "password" },
      { key: "pixKey", label: "Chave PIX", type: "text" },
    ]
  },
  {
    id: "pix-itau",
    name: "Pix Itaú",
    description: "Pagamento instantâneo via Pix pelo Itaú. QR Code dinâmico e liquidação imediata.",
    icon: <QrCode className="h-6 w-6" />,
    status: "active",
    type: "payment_method",
    apiVersion: "v1.0",
    lastSync: "2026-05-23 14:31:00",
    credentialFields: [
      { key: "clientId", label: "Client ID", type: "text" },
      { key: "clientSecret", label: "Client Secret", type: "password" },
      { key: "pixKey", label: "Chave PIX", type: "text" },
    ]
  },
]

export function IntegrationsContent() {
  const { selectedEstabelecimento } = useEstabelecimento()
  const [estabelecimentoIntegrations, setEstabelecimentoIntegrations] = useState(initialEstabelecimentoIntegrations)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [editingCredentials, setEditingCredentials] = useState<Record<string, IntegrationCredentials>>({})

  const toggleExpanded = (integrationId: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(integrationId)) {
        next.delete(integrationId)
      } else {
        next.add(integrationId)
      }
      return next
    })
  }

  const togglePasswordVisibility = (fieldKey: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }))
  }

  const getIntegrationState = (integrationId: string): EstabelecimentoIntegrationState => {
    if (!selectedEstabelecimento) {
      return { enabled: true, credentials: {}, credentialsConfigured: true }
    }
    return estabelecimentoIntegrations[selectedEstabelecimento.id]?.[integrationId] ?? {
      enabled: false,
      credentials: {},
      credentialsConfigured: false
    }
  }

  const updateCredential = (integrationId: string, key: keyof IntegrationCredentials, value: string) => {
    setEditingCredentials(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        [key]: value
      }
    }))
  }

  const saveCredentials = (integrationId: string, integration: Integration) => {
    if (!selectedEstabelecimento) return

    const newCredentials = editingCredentials[integrationId] || {}
    const currentState = getIntegrationState(integrationId)
    const mergedCredentials = { ...currentState.credentials, ...newCredentials }
    
    // Verificar se todas as credenciais obrigatórias foram preenchidas
    const allFieldsFilled = integration.credentialFields.every(
      field => mergedCredentials[field.key] && mergedCredentials[field.key]!.trim() !== ""
    )

    setEstabelecimentoIntegrations(prev => ({
      ...prev,
      [selectedEstabelecimento.id]: {
        ...prev[selectedEstabelecimento.id],
        [integrationId]: {
          ...currentState,
          credentials: mergedCredentials,
          credentialsConfigured: allFieldsFilled,
        }
      }
    }))

    // Limpar estado de edição
    setEditingCredentials(prev => {
      const next = { ...prev }
      delete next[integrationId]
      return next
    })
  }

  const toggleIntegration = (integrationId: string) => {
    if (!selectedEstabelecimento) return
    
    const currentState = getIntegrationState(integrationId)
    
    // Só permite ativar se as credenciais estiverem configuradas
    if (!currentState.enabled && !currentState.credentialsConfigured) {
      // Expandir o card para mostrar os campos de credenciais
      setExpandedCards(prev => new Set(prev).add(integrationId))
      return
    }
    
    setEstabelecimentoIntegrations(prev => ({
      ...prev,
      [selectedEstabelecimento.id]: {
        ...prev[selectedEstabelecimento.id],
        [integrationId]: {
          ...currentState,
          enabled: !currentState.enabled
        }
      }
    }))
  }

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-[#008529]/15 text-[#008529] border-[#008529]/30">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Ativa
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-zinc-500/15 text-zinc-400 border-zinc-500/30">
            Inativa
          </Badge>
        )
      case "maintenance":
        return (
          <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30">
            <AlertCircle className="mr-1 h-3 w-3" />
            Manutenção
          </Badge>
        )
    }
  }

  const getTypeLabel = (type: Integration["type"]) => {
    switch (type) {
      case "acquirer":
        return "Adquirente"
      case "payment_method":
        return "Pix"
      case "antifraud":
        return "Antifraude"
      case "reconciler":
        return "Conciliador"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrações</h1>
          <p className="text-sm text-muted-foreground">
            {selectedEstabelecimento 
              ? `Gerencie as integrações e credenciais para ${selectedEstabelecimento.nomeFantasia}`
              : "Visão global de todas as integrações disponíveis na Plinia"
            }
          </p>
        </div>
      </div>

      {/* Lista de Integrações */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pliniaIntegrations.map((integration) => {
          const state = getIntegrationState(integration.id)
          const isExpanded = expandedCards.has(integration.id)
          const editingCreds = editingCredentials[integration.id] || {}
          
          return (
            <Card 
              key={integration.id} 
              className={cn(
                "border-border bg-card transition-all",
                !state.enabled && selectedEstabelecimento && "opacity-60"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      state.enabled ? "bg-[#008529]/10 text-[#008529]" : "bg-muted text-muted-foreground"
                    )}>
                      {integration.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">{integration.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className="mt-1 border-[#36103A]/30 bg-[#36103A]/5 text-[11px] font-medium text-[#36103A]"
                      >
                        {getTypeLabel(integration.type)}
                      </Badge>
                    </div>
                  </div>
                  {getStatusBadge(integration.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{integration.description}</p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>API: {integration.apiVersion}</span>
                  <span>Sync: {integration.lastSync?.split(" ")[1]}</span>
                </div>

                {/* Controles por estabelecimento */}
                {selectedEstabelecimento && (
                  <>
                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {state.enabled ? "Ativada" : "Desativada"}
                        </span>
                        {!state.credentialsConfigured && (
                          <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-500">
                            <Key className="mr-1 h-3 w-3" />
                            Configurar credenciais
                          </Badge>
                        )}
                      </div>
                      <Switch
                        checked={state.enabled}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                        disabled={!state.credentialsConfigured && !state.enabled}
                        className="data-[state=checked]:bg-[#008529]"
                      />
                    </div>

                    {/* Botão para expandir/recolher credenciais */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => toggleExpanded(integration.id)}
                    >
                      <Key className="mr-2 h-3.5 w-3.5" />
                      Credenciais
                      {isExpanded ? (
                        <ChevronUp className="ml-auto h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-auto h-4 w-4" />
                      )}
                    </Button>

                    {/* Formulário de Credenciais */}
                    {isExpanded && (
                      <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Lock className="h-4 w-4 text-[#36103A]" />
                          Configurar Credenciais
                        </div>
                        
                        {integration.credentialFields.map((field) => {
                          const fieldKey = `${integration.id}-${field.key}`
                          const currentValue = editingCreds[field.key] ?? state.credentials[field.key] ?? ""
                          const isPassword = field.type === "password"
                          const showPassword = showPasswords[fieldKey]
                          
                          return (
                            <div key={field.key} className="space-y-1.5">
                              <Label htmlFor={fieldKey} className="text-xs text-muted-foreground">
                                {field.label}
                              </Label>
                              <div className="relative">
                                <Input
                                  id={fieldKey}
                                  type={isPassword && !showPassword ? "password" : "text"}
                                  value={currentValue}
                                  onChange={(e) => updateCredential(integration.id, field.key, e.target.value)}
                                  placeholder={`Digite ${field.label}`}
                                  className="h-8 text-sm pr-8"
                                />
                                {isPassword && (
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(fieldKey)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}

                        <Button
                          size="sm"
                          className="w-full bg-[#008529] hover:bg-[#008529]/90 text-white"
                          onClick={() => saveCredentials(integration.id, integration)}
                        >
                          <Save className="mr-2 h-3.5 w-3.5" />
                          Salvar Credenciais
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info adicional na visão global */}
      {!selectedEstabelecimento && (
        <Card className="border-[#36103A]/30 bg-[#36103A]/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#36103A]/20">
              <AlertCircle className="h-5 w-5 text-[#36103A]" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Visão Global</p>
              <p className="text-xs text-muted-foreground">
                Selecione um estabelecimento no menu lateral para configurar credenciais e ativar ou desativar integrações individualmente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
