"use client"

import { ReactFlowProvider } from "@xyflow/react"
import { AlertCircle, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useEstabelecimento } from "@/contexts/estabelecimento-context"
import { getEnabledIntegrations } from "@/lib/integrations-data"
import { RotasBuilder } from "./rotas-builder"

export function RotasContent() {
  const { selectedEstabelecimento } = useEstabelecimento()

  // Apenas adquirentes e antifraude participam do roteamento de cartão
  const processors = getEnabledIntegrations(
    selectedEstabelecimento?.id ?? null,
    ["acquirer", "antifraud"],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rotas</h1>
        <p className="text-sm text-muted-foreground">
          {selectedEstabelecimento
            ? `Configure o roteamento de cartão de ${selectedEstabelecimento.nomeFantasia} com regras condicionais.`
            : "Configure o roteamento de transações por método de pagamento."}
        </p>
      </div>

      {!selectedEstabelecimento ? (
        <Card className="border-[#36103A]/30 bg-[#36103A]/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#36103A]/20">
              <Info className="h-5 w-5 text-[#36103A]" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Selecione um estabelecimento</p>
              <p className="text-xs text-muted-foreground">
                As rotas são configuradas por estabelecimento. Escolha um no menu lateral para montar o fluxo de roteamento.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : processors.length === 0 ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Nenhuma integração de cartão habilitada</p>
              <p className="text-xs text-muted-foreground">
                Habilite ao menos uma adquirente ou antifraude em Integrações para configurar as rotas de cartão.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ReactFlowProvider>
          <RotasBuilder estabelecimentoId={selectedEstabelecimento.id} processors={processors} />
        </ReactFlowProvider>
      )}
    </div>
  )
}
