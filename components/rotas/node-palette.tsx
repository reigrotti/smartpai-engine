"use client"

import { Building2, CheckCircle2, GitBranch, ShieldCheck, XCircle } from "lucide-react"
import type { IntegrationMeta } from "@/lib/integrations-data"
import { createCriterion } from "./types"

export interface PaletteDragData {
  type: "condition" | "processor" | "terminal"
  data: Record<string, unknown>
}

interface NodePaletteProps {
  processors: IntegrationMeta[]
}

function DraggableItem({
  label,
  sublabel,
  icon,
  accent,
  payload,
}: {
  label: string
  sublabel: string
  icon: React.ReactNode
  accent: string
  payload: PaletteDragData
}) {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/plinia-node", JSON.stringify(payload))
    e.dataTransfer.effectAllowed = "move"
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex cursor-grab items-center gap-2.5 rounded-lg border border-border bg-card p-2.5 transition-colors hover:border-[#008529]/50 hover:bg-muted/50 active:cursor-grabbing"
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}1a`, color: accent }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{label}</p>
        <p className="truncate text-[11px] text-muted-foreground">{sublabel}</p>
      </div>
    </div>
  )
}

export function NodePalette({ processors }: NodePaletteProps) {
  const antifraud = processors.filter((p) => p.type === "antifraud")
  const acquirers = processors.filter((p) => p.type === "acquirer")

  return (
    <div className="flex h-full w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-background p-4">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-foreground">Componentes</h3>
        <p className="text-[11px] text-muted-foreground">
          Arraste para o canvas para montar a rota.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Regras</p>
        <DraggableItem
          label="Condição"
          sublabel="Bandeira, BIN, Valor, Volume ou Parcelas"
          icon={<GitBranch className="h-4 w-4" />}
          accent="#36103A"
          payload={{ type: "condition", data: { criteria: [createCriterion()] } }}
        />
      </div>

      {antifraud.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Antifraude</p>
          {antifraud.map((p) => (
            <DraggableItem
              key={p.id}
              label={p.name}
              sublabel="Antifraude"
              icon={<ShieldCheck className="h-4 w-4" />}
              accent="#36103A"
              payload={{ type: "processor", data: { integrationId: p.id, name: p.name, kind: "antifraud" } }}
            />
          ))}
        </div>
      )}

      {acquirers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Adquirentes</p>
          {acquirers.map((p) => (
            <DraggableItem
              key={p.id}
              label={p.name}
              sublabel="Adquirente"
              icon={<Building2 className="h-4 w-4" />}
              accent="#008529"
              payload={{ type: "processor", data: { integrationId: p.id, name: p.name, kind: "acquirer" } }}
            />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Terminais</p>
        <DraggableItem
          label="Aprovar"
          sublabel="Fim — transação aprovada"
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent="#008529"
          payload={{ type: "terminal", data: { outcome: "approve" } }}
        />
        <DraggableItem
          label="Recusar"
          sublabel="Fim — transação recusada"
          icon={<XCircle className="h-4 w-4" />}
          accent="#ef4444"
          payload={{ type: "terminal", data: { outcome: "decline" } }}
        />
      </div>
    </div>
  )
}
