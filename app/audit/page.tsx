"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { AuditContent } from "@/components/audit/audit-content"

export default function AuditPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-64">
        <Header />
        <main className="flex-1 p-6">
          <AuditContent />
        </main>
      </div>
    </div>
  )
}
