"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { RotateCcw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { IntegrationMeta } from "@/lib/integrations-data"
import { buildDefaultFlow, loadRotaFlow, saveRotaFlow } from "@/lib/rotas-storage"
import { NodePalette, type PaletteDragData } from "./node-palette"
import { StartNode } from "./nodes/start-node"
import { ConditionNode } from "./nodes/condition-node"
import { ProcessorNode } from "./nodes/processor-node"
import { TerminalNode } from "./nodes/terminal-node"

const nodeTypes: NodeTypes = {
  start: StartNode,
  condition: ConditionNode,
  processor: ProcessorNode,
  terminal: TerminalNode,
}

function edgeStyleForHandle(sourceHandle: string | null | undefined): Pick<Edge, "style" | "label" | "labelStyle"> {
  if (sourceHandle === "approved" || sourceHandle === "true") {
    return {
      style: { stroke: "#008529", strokeWidth: 2 },
      label: sourceHandle === "true" ? "Verdadeiro" : "Aprovada",
      labelStyle: { fill: "#008529", fontSize: 10, fontWeight: 600 },
    }
  }
  if (sourceHandle === "declined" || sourceHandle === "false") {
    return {
      style: { stroke: "#ef4444", strokeWidth: 2 },
      label: sourceHandle === "false" ? "Falso" : "Negada",
      labelStyle: { fill: "#ef4444", fontSize: 10, fontWeight: 600 },
    }
  }
  return { style: { stroke: "#94a3b8", strokeWidth: 2 } }
}

interface RotasBuilderProps {
  estabelecimentoId: string
  processors: IntegrationMeta[]
}

export function RotasBuilder({ estabelecimentoId, processors }: RotasBuilderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [saved, setSaved] = useState(false)
  const idCounter = useRef(0)

  // Carrega o fluxo do estabelecimento (localStorage ou padrão)
  useEffect(() => {
    const stored = loadRotaFlow(estabelecimentoId) ?? buildDefaultFlow()
    setNodes(stored.nodes)
    setEdges(stored.edges)
  }, [estabelecimentoId, setNodes, setEdges])

  const genId = useCallback((type: string) => {
    idCounter.current += 1
    return `${type}-${Date.now()}-${idCounter.current}`
  }, [])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            ...edgeStyleForHandle(connection.sourceHandle),
          },
          eds,
        ),
      )
    },
    [setEdges],
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const raw = e.dataTransfer.getData("application/plinia-node")
      if (!raw) return
      const payload = JSON.parse(raw) as PaletteDragData
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      const newNode: Node = {
        id: genId(payload.type),
        type: payload.type,
        position,
        data: payload.data,
      }
      setNodes((nds) => nds.concat(newNode))
    },
    [screenToFlowPosition, genId, setNodes],
  )

  const handleSave = useCallback(() => {
    saveRotaFlow(estabelecimentoId, { nodes, edges })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [estabelecimentoId, nodes, edges])

  const handleReset = useCallback(() => {
    const def = buildDefaultFlow()
    setNodes(def.nodes)
    setEdges(def.edges)
  }, [setNodes, setEdges])

  return (
    <div className="flex h-[calc(100vh-13rem)] overflow-hidden rounded-xl border border-border bg-card">
      <NodePalette processors={processors} />
      <div className="relative flex-1" ref={wrapperRef}>
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-[#008529] text-white hover:bg-[#008529]/90"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {saved ? "Salvo!" : "Salvar rota"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Restaurar padrão
          </Button>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{ type: "smoothstep" }}
        >
          <Background color="#cbd5e1" gap={16} />
          <Controls />
          <MiniMap pannable zoomable className="!bg-muted" />
        </ReactFlow>
      </div>
    </div>
  )
}
