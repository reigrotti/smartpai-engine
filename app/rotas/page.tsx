"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { RotasContent } from "@/components/rotas/rotas-content"

export default function RotasPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-64">
        <Header />
        <main className="flex-1 p-6">
          <RotasContent />
        </main>
      </div>
    </div>
  )
}
