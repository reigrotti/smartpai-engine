import { Handle, Position } from "@xyflow/react"
import { CreditCard } from "lucide-react"

export function StartNode() {
  return (
    <div className="w-44 rounded-lg border border-[#36103A] bg-[#36103A] px-3 py-2 text-white shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15">
          <CreditCard className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className="text-xs font-semibold leading-tight">Início</p>
          <p className="text-[10px] text-white/70">Transação de Cartão</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#36103A]"
      />
    </div>
  )
}
