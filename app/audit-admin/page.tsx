import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { AuditAdminContent } from "@/components/audit-admin/audit-admin-content"

export default function AuditAdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="p-6">
          <AuditAdminContent />
        </main>
      </div>
    </div>
  )
}
