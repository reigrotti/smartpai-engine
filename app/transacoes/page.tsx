import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { TransactionsContent } from "@/components/transactions/transactions-content"

export default function TransacoesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Transações</h1>
            <p className="text-sm text-muted-foreground">
              Visualize e exporte todas as transações em tempo real
            </p>
          </div>
          <TransactionsContent />
        </main>
      </div>
    </div>
  )
}
