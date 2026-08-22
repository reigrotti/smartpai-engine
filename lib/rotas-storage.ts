import type { Edge, Node } from "@xyflow/react"

export interface RotaFlow {
  nodes: Node[]
  edges: Edge[]
}

// v2: node de Condição passou a suportar múltiplos critérios combinados (E)
const STORAGE_PREFIX = "plinia:rotas:cartao:v2:"

function storageKey(estabelecimentoId: string) {
  return `${STORAGE_PREFIX}${estabelecimentoId}`
}

export function loadRotaFlow(estabelecimentoId: string): RotaFlow | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(storageKey(estabelecimentoId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as RotaFlow
    if (!parsed.nodes || !parsed.edges) return null
    return parsed
  } catch {
    return null
  }
}

export function saveRotaFlow(estabelecimentoId: string, flow: RotaFlow): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(storageKey(estabelecimentoId), JSON.stringify(flow))
  } catch {
    // ignora falhas de quota/serialização
  }
}

export function clearRotaFlow(estabelecimentoId: string): void {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(storageKey(estabelecimentoId))
}

// Fluxo padrão inicial: início -> terminal aprovar
export function buildDefaultFlow(): RotaFlow {
  return {
    nodes: [
      {
        id: "start",
        type: "start",
        position: { x: 360, y: 40 },
        data: {},
        deletable: false,
      },
      {
        id: "terminal-aprovar-default",
        type: "terminal",
        position: { x: 340, y: 260 },
        data: { outcome: "approve" },
      },
    ],
    edges: [
      {
        id: "start-terminal",
        source: "start",
        target: "terminal-aprovar-default",
        type: "smoothstep",
      },
    ],
  }
}
