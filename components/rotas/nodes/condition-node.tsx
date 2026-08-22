import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react"
import { GitBranch, Trash2, X, Plus } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  FIELD_LABELS,
  MULTI_VALUE_FIELDS,
  OPERATOR_LABELS,
  OPERATORS_BY_FIELD,
  OPTIONS_BY_FIELD,
  createCriterion,
  type Criterion,
  type ConditionField,
  type ConditionNodeData,
  type ConditionOperator,
} from "../types"

export function ConditionNode({ id, data }: NodeProps) {
  const { updateNodeData, setNodes, setEdges } = useReactFlow()
  const nodeData = data as ConditionNodeData
  const criteria = nodeData.criteria ?? []

  const setCriteria = (next: Criterion[]) => updateNodeData(id, { criteria: next })

  const patchCriterion = (critId: string, patch: Partial<Criterion>) => {
    setCriteria(criteria.map((c) => (c.id === critId ? { ...c, ...patch } : c)))
  }

  const handleFieldChange = (critId: string, field: ConditionField) => {
    const operator = OPERATORS_BY_FIELD[field][0]
    patchCriterion(critId, { field, operator, values: [] })
  }

  const toggleOption = (crit: Criterion, option: string) => {
    const next = crit.values.includes(option)
      ? crit.values.filter((v) => v !== option)
      : [...crit.values, option]
    patchCriterion(crit.id, { values: next })
  }

  const addCriterion = () => setCriteria([...criteria, createCriterion()])
  const removeCriterion = (critId: string) => setCriteria(criteria.filter((c) => c.id !== critId))

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id))
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id))
  }

  return (
    <div className="w-64 rounded-lg border border-border bg-card shadow-sm">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-border !bg-muted-foreground"
      />
      <div className="flex items-center justify-between rounded-t-[7px] bg-[#36103A]/10 px-2.5 py-1.5">
        <div className="flex items-center gap-1.5">
          <GitBranch className="h-3.5 w-3.5 text-[#36103A]" />
          <span className="text-xs font-semibold text-foreground">Condição</span>
        </div>
        <button
          onClick={handleDelete}
          className="text-muted-foreground transition-colors hover:text-red-500"
          aria-label="Remover node"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-1.5 p-2.5">
        {criteria.length === 0 && (
          <p className="rounded-md border border-dashed border-border px-2 py-2.5 text-center text-[10px] text-muted-foreground">
            Nenhum critério. Adicione uma regra abaixo.
          </p>
        )}

        {criteria.map((crit, index) => {
          const isMulti = MULTI_VALUE_FIELDS.includes(crit.field)
          const options = OPTIONS_BY_FIELD[crit.field]
          return (
            <div key={crit.id}>
              {index > 0 && (
                <div className="my-1.5 flex items-center gap-1.5">
                  <div className="h-px flex-1 bg-border" />
                  <span className="rounded bg-[#36103A]/10 px-1 text-[9px] font-bold text-[#36103A]">
                    E
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}

              <div className="rounded-md border border-border bg-muted/40 p-1.5">
                <div className="mb-1.5 flex items-center gap-1">
                  <Select
                    value={crit.field}
                    onValueChange={(v) => handleFieldChange(crit.id, v as ConditionField)}
                  >
                    <SelectTrigger className="h-6 flex-1 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(FIELD_LABELS) as ConditionField[]).map((f) => (
                        <SelectItem key={f} value={f} className="text-xs">
                          {FIELD_LABELS[f]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={crit.operator}
                    onValueChange={(v) => patchCriterion(crit.id, { operator: v as ConditionOperator })}
                  >
                    <SelectTrigger className="h-6 flex-1 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS_BY_FIELD[crit.field].map((op) => (
                        <SelectItem key={op} value={op} className="text-xs">
                          {OPERATOR_LABELS[op]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => removeCriterion(crit.id)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                    aria-label="Remover critério"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                {options ? (
                  <div className="flex flex-wrap gap-1">
                    {options.map((opt) => {
                      const selected = crit.values.includes(opt)
                      return (
                        <button
                          key={opt}
                          onClick={() => toggleOption(crit, opt)}
                          className={cn(
                            "rounded border px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                            selected
                              ? "border-[#008529] bg-[#008529]/10 text-[#008529]"
                              : "border-border bg-card text-muted-foreground hover:border-[#008529]/40",
                          )}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                ) : crit.field === "bin" ? (
                  <Input
                    value={crit.values.join(", ")}
                    onChange={(e) =>
                      patchCriterion(crit.id, {
                        values: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Ex.: 401178, 516292"
                    className="h-6 text-[10px]"
                  />
                ) : (
                  <div className="relative">
                    <Input
                      type="number"
                      value={crit.values[0] ?? ""}
                      onChange={(e) => patchCriterion(crit.id, { values: [e.target.value] })}
                      placeholder={crit.field === "volume" ? "Ex.: 50" : "Ex.: 500"}
                      className={cn("h-6 text-[10px]", crit.field === "volume" && "pr-6")}
                    />
                    {crit.field === "volume" && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                        %
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        <button
          onClick={addCriterion}
          className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-[#36103A]/40 px-2 py-1 text-[10px] font-medium text-[#36103A] transition-colors hover:bg-[#36103A]/5"
        >
          <Plus className="h-3 w-3" />
          Adicionar critério
        </button>
      </div>

      {/* Saídas condicionais */}
      <div className="flex items-center justify-between border-t border-border px-2.5 py-1 text-[9px] font-medium">
        <span className="text-[#008529]">Verdadeiro</span>
        <span className="text-red-500">Falso</span>
      </div>

      <Handle
        id="true"
        type="source"
        position={Position.Bottom}
        style={{ left: "25%" }}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#008529]"
      />
      <Handle
        id="false"
        type="source"
        position={Position.Bottom}
        style={{ left: "75%" }}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-red-500"
      />
    </div>
  )
}
