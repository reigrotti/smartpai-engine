"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { OnboardContent } from "@/components/onboard/onboard-content"

export default function OnboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-6">
          <OnboardContent />
        </main>
      </div>
    </div>
  )
}
