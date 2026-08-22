import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react"
import { Building2, ShieldCheck, Trash2 } from "lucide-react"
import type { ProcessorNodeData } from "../types"

export function ProcessorNode({ id, data }: NodeProps) {
  const { setNodes, setEdges } = useReactFlow()
  const nodeData = data as ProcessorNodeData
  const isAntifraud = nodeData.kind === "antifraud"

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id))
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id))
  }

  return (
    <div className="w-48 rounded-lg border border-border bg-card shadow-sm">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-border !bg-muted-foreground"
      />
      <div className="flex items-center justify-between px-2.5 py-2">
        <div className="flex items-center gap-2">
          <div
            className={
              isAntifraud
                ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#36103A]/10 text-[#36103A]"
                : "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#008529]/10 text-[#008529]"
            }
          >
            {isAntifraud ? <ShieldCheck className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
          </div>
          <div>
            <p className="text-xs font-semibold leading-tight text-foreground">{nodeData.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {isAntifraud ? "Antifraude" : "Adquirente"}
            </p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="text-muted-foreground transition-colors hover:text-red-500"
          aria-label="Remover node"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-border px-2.5 py-1 text-[9px] font-medium">
        <span className="text-[#008529]">Aprovada</span>
        <span className="text-red-500">Negada</span>
      </div>

      <Handle
        id="approved"
        type="source"
        position={Position.Bottom}
        style={{ left: "25%" }}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#008529]"
      />
      <Handle
        id="declined"
        type="source"
        position={Position.Bottom}
        style={{ left: "75%" }}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-red-500"
      />
    </div>
  )
}
