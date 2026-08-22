"use client"

import { Activity, DollarSign, ShieldCheck } from "lucide-react"
import { KPICard } from "./kpi-card"
import { InsightCard } from "./insight-card"
import { AllocationChart } from "./allocation-chart"
import { LiveFeed } from "./live-feed"

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="Global Auth Rate"
          value="98.2%"
          change={{ value: "+0.8%", trend: "up" }}
          subtitle="vs. semana anterior"
          icon={<Activity className="h-5 w-5 text-primary" />}
        />
        <KPICard
          title="Volume Transacionado"
          value="R$ 12.4M"
          change={{ value: "+15.3%", trend: "up" }}
          subtitle="vs. semana anterior"
          icon={<DollarSign className="h-5 w-5 text-primary" />}
        />
        <KPICard
          title="Transações Salvas"
          value="1.247"
          change={{ value: "+23%", trend: "up" }}
          subtitle="Silent Recovery"
          icon={<ShieldCheck className="h-5 w-5 text-primary" />}
        />
      </div>

      {/* Smart Insight */}
      <InsightCard
        title="Insight do Motor"
        description="A adquirente Cielo está aprovando 14% mais transações da bandeira Visa nas últimas 24h. Sugestão: Configurar Cielo como rota primária para Visa."
        actionLabel="Aplicar Regra"
        onAction={() => console.log("Regra aplicada")}
      />

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-1">
        <AllocationChart />
      </div>

      {/* Live Feed */}
      <LiveFeed />
    </div>
  )
}
