"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { UsersAdminContent } from "@/components/users-admin/users-admin-content"

export default function UsersAdminPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-64">
        <Header />
        <main className="flex-1 p-6">
          <UsersAdminContent />
        </main>
      </div>
    </div>
  )
}
