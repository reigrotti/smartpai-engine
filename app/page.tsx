import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Visão geral do seu orquestrador de pagamentos
            </p>
          </div>
          <DashboardContent />
        </main>
      </div>
    </div>
  )
}