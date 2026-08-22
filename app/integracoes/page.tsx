"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { IntegrationsContent } from "@/components/integrations/integrations-content"

export default function IntegracoesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-64">
        <Header />
        <main className="flex-1 p-6">
          <IntegrationsContent />
        </main>
      </div>
    </div>
  )
}
