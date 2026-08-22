import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react"
import { CheckCircle2, XCircle, Trash2 } from "lucide-react"
import type { TerminalNodeData } from "../types"

export function TerminalNode({ id, data }: NodeProps) {
  const { setNodes, setEdges } = useReactFlow()
  const nodeData = data as TerminalNodeData
  const isApprove = nodeData.outcome === "approve"

  const handleDelete = () => {
    setNodes((nodes) => nodes.filter((n) => n.id !== id))
    setEdges((edges) => edges.filter((e) => e.source !== id && e.target !== id))
  }

  return (
    <div
      className={
        isApprove
          ? "flex w-40 items-center gap-1.5 rounded-lg border border-[#008529] bg-[#008529]/10 px-2.5 py-2 shadow-sm"
          : "flex w-40 items-center gap-1.5 rounded-lg border border-red-500 bg-red-500/10 px-2.5 py-2 shadow-sm"
      }
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-2 !border-border !bg-muted-foreground"
      />
      {isApprove ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#008529]" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-red-500" />
      )}
      <span
        className={
          isApprove
            ? "flex-1 text-xs font-semibold text-[#008529]"
            : "flex-1 text-xs font-semibold text-red-500"
        }
      >
        {isApprove ? "Aprovar (Fim)" : "Recusar (Fim)"}
      </span>
      <button
        onClick={handleDelete}
        className="text-muted-foreground transition-colors hover:text-red-600"
        aria-label="Remover node"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}
