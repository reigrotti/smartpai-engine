"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const data = [
  { name: "Seg", cieloVol: 4500000, redeVol: 2400000, cieloQty: 1200, redeQty: 850 },
  { name: "Ter", cieloVol: 5200000, redeVol: 2800000, cieloQty: 1400, redeQty: 920 },
  { name: "Qua", cieloVol: 4800000, redeVol: 3100000, cieloQty: 1300, redeQty: 980 },
  { name: "Qui", cieloVol: 6100000, redeVol: 2900000, cieloQty: 1600, redeQty: 900 },
  { name: "Sex", cieloVol: 7200000, redeVol: 3500000, cieloQty: 1900, redeQty: 1100 },
  { name: "Sáb", cieloVol: 5800000, redeVol: 2600000, cieloQty: 1500, redeQty: 850 },
  { name: "Dom", cieloVol: 3900000, redeVol: 1800000, cieloQty: 1000, redeQty: 600 },
]

const CIELO_COLOR = "#0099FF"
const REDE_COLOR = "#FF7A00"

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

const formatQuantity = (value: number) => {
  return new Intl.NumberFormat("pt-BR").format(value)
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    dataKey: string
    color: string
  }>
  label?: string
  showVolume: boolean
}

function CustomTooltip({ active, payload, label, showVolume }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
      <p className="text-foreground font-semibold mb-2">{label}</p>
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded" 
              style={{ backgroundColor: entry.color }} 
            />
            <span className="text-muted-foreground text-sm">{entry.name}:</span>
            <span className="text-foreground font-semibold text-sm">
              {showVolume ? formatCurrency(entry.value) : formatQuantity(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AllocationChart() {
  const [showVolume, setShowVolume] = useState(true)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Alocação por Adquirente</CardTitle>
            <p className="text-sm text-muted-foreground">
              {showVolume ? "Volume financeiro por dia da semana" : "Quantidade de transações por dia da semana"}
            </p>
          </div>
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={showVolume ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowVolume(true)}
              className={showVolume ? "bg-[#008529] text-white hover:bg-[#008529]/90" : "text-muted-foreground hover:text-foreground"}
            >
              Valor (R$)
            </Button>
            <Button
              variant={!showVolume ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowVolume(false)}
              className={!showVolume ? "bg-[#008529] text-white hover:bg-[#008529]/90" : "text-muted-foreground hover:text-foreground"}
            >
              Quantidade
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
              <XAxis 
                dataKey="name" 
                stroke="#ffffff"
                tick={{ fill: "#ffffff" }}
                fontSize={12}
                tickLine={{ stroke: "#ffffff" }}
                axisLine={{ stroke: "#ffffff" }}
                dy={10}
              />
              <YAxis 
                stroke="#ffffff"
                tick={{ fill: "#ffffff" }}
                fontSize={11}
                tickLine={{ stroke: "#ffffff" }}
                axisLine={{ stroke: "#ffffff" }}
                tickFormatter={showVolume ? formatCurrency : formatQuantity}
                tickCount={6}
                domain={[0, 'auto']}
                label={{ 
                  value: showVolume ? "Volume (R$)" : "Quantidade", 
                  angle: -90, 
                  position: "insideLeft",
                  offset: -45,
                  style: { textAnchor: "middle", fill: "#ffffff", fontSize: 12, fontWeight: 500 }
                }}
              />
              <Tooltip content={<CustomTooltip showVolume={showVolume} />} />
              <Legend 
                wrapperStyle={{ paddingTop: "16px" }}
                formatter={(value) => <span style={{ color: "#ffffff", fontSize: 12 }}>{value}</span>}
              />
              <Bar 
                dataKey={showVolume ? "cieloVol" : "cieloQty"} 
                name="Cielo" 
                fill={CIELO_COLOR}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey={showVolume ? "redeVol" : "redeQty"} 
                name="Rede" 
                fill={REDE_COLOR}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
