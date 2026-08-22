"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Download,
  ClipboardList,
  User,
  Settings,
  Key,
  LogIn,
  LogOut,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEstabelecimento } from "@/contexts/estabelecimento-context"

type AuditAction = "criar" | "editar" | "excluir" | "ativar" | "desativar" | "configurar" | "login" | "logout"
type AuditCategory = "Transacao" | "Usuario" | "Configuracao" | "Autenticacao" | "Relatorio"

interface AuditLog {
  id: string
  timestamp: string
  action: AuditAction
  category: AuditCategory
  description: string
  target: string
  user: {
    name: string
    email: string
  }
  ip: string
  estabelecimentoId: string
}

// Logs mockados por estabelecimento
const allAuditLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2024-01-15 14:32:15",
    action: "login",
    category: "Autenticacao",
    description: "Login realizado com sucesso",
    target: "Sistema",
    user: { name: "Maria Santos", email: "maria@lojacental.com" },
    ip: "192.168.1.100",
    estabelecimentoId: "1",
  },
  {
    id: "2",
    timestamp: "2024-01-15 14:35:22",
    action: "editar",
    category: "Configuracao",
    description: "Alteracao de configuracao de notificacoes",
    target: "Notificacoes",
    user: { name: "Maria Santos", email: "maria@lojacentral.com" },
    ip: "192.168.1.100",
    estabelecimentoId: "1",
  },
  {
    id: "3",
    timestamp: "2024-01-15 15:10:45",
    action: "criar",
    category: "Usuario",
    description: "Novo usuario cadastrado",
    target: "Carlos Oliveira",
    user: { name: "Maria Santos", email: "maria@lojacentral.com" },
    ip: "192.168.1.100",
    estabelecimentoId: "1",
  },
  {
    id: "4",
    timestamp: "2024-01-15 10:22:33",
    action: "login",
    category: "Autenticacao",
    description: "Login realizado com sucesso",
    target: "Sistema",
    user: { name: "Pedro Lima", email: "pedro@ecommercebrasil.com" },
    ip: "10.0.0.50",
    estabelecimentoId: "2",
  },
  {
    id: "5",
    timestamp: "2024-01-15 10:45:12",
    action: "configurar",
    category: "Configuracao",
    description: "Configuracao de regras de roteamento",
    target: "Roteador",
    user: { name: "Pedro Lima", email: "pedro@ecommercebrasil.com" },
    ip: "10.0.0.50",
    estabelecimentoId: "2",
  },
  {
    id: "6",
    timestamp: "2024-01-15 11:30:00",
    action: "editar",
    category: "Transacao",
    description: "Estorno de transacao solicitado",
    target: "TXN-2024-001234",
    user: { name: "Ana Costa", email: "ana@ecommercebrasil.com" },
    ip: "10.0.0.51",
    estabelecimentoId: "2",
  },
  {
    id: "7",
    timestamp: "2024-01-15 09:15:00",
    action: "login",
    category: "Autenticacao",
    description: "Login realizado com sucesso",
    target: "Sistema",
    user: { name: "Lucas Ferreira", email: "lucas@marketplaceplus.com" },
    ip: "172.16.0.10",
    estabelecimentoId: "3",
  },
  {
    id: "8",
    timestamp: "2024-01-15 09:45:30",
    action: "criar",
    category: "Relatorio",
    description: "Relatorio de vendas gerado",
    target: "Relatorio Mensal",
    user: { name: "Lucas Ferreira", email: "lucas@marketplaceplus.com" },
    ip: "172.16.0.10",
    estabelecimentoId: "3",
  },
  {
    id: "9",
    timestamp: "2024-01-15 16:00:00",
    action: "desativar",
    category: "Usuario",
    description: "Usuario desativado",
    target: "João Silva",
    user: { name: "Maria Santos", email: "maria@lojacentral.com" },
    ip: "192.168.1.100",
    estabelecimentoId: "1",
  },
  {
    id: "10",
    timestamp: "2024-01-15 16:30:00",
    action: "logout",
    category: "Autenticacao",
    description: "Logout realizado",
    target: "Sistema",
    user: { name: "Maria Santos", email: "maria@lojacentral.com" },
    ip: "192.168.1.100",
    estabelecimentoId: "1",
  },
]

const actionIcons: Record<AuditAction, React.ReactNode> = {
  criar: <Plus className="h-3.5 w-3.5" />,
  editar: <Edit className="h-3.5 w-3.5" />,
  excluir: <Trash2 className="h-3.5 w-3.5" />,
  ativar: <ToggleRight className="h-3.5 w-3.5" />,
  desativar: <ToggleLeft className="h-3.5 w-3.5" />,
  configurar: <Settings className="h-3.5 w-3.5" />,
  login: <LogIn className="h-3.5 w-3.5" />,
  logout: <LogOut className="h-3.5 w-3.5" />,
}

const actionColors: Record<AuditAction, string> = {
  criar: "bg-[#008529]/10 text-[#008529] border-[#008529]/20",
  editar: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  excluir: "bg-red-500/10 text-red-500 border-red-500/20",
  ativar: "bg-[#008529]/10 text-[#008529] border-[#008529]/20",
  desativar: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  configurar: "bg-[#36103A]/10 text-[#36103A] border-[#36103A]/20",
  login: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  logout: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

const categoryIcons: Record<AuditCategory, React.ReactNode> = {
  Transacao: <ClipboardList className="h-3.5 w-3.5" />,
  Usuario: <User className="h-3.5 w-3.5" />,
  Configuracao: <Settings className="h-3.5 w-3.5" />,
  Autenticacao: <Key className="h-3.5 w-3.5" />,
  Relatorio: <ClipboardList className="h-3.5 w-3.5" />,
}

export function AuditContent() {
  const { selectedEstabelecimento } = useEstabelecimento()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")

  // Filtrar logs pelo estabelecimento selecionado
  const establishmentLogs = useMemo(() => {
    if (!selectedEstabelecimento) {
      return []
    }
    return allAuditLogs.filter(log => log.estabelecimentoId === selectedEstabelecimento.id)
  }, [selectedEstabelecimento])

  const filteredLogs = useMemo(() => {
    return establishmentLogs.filter((log) => {
      const matchesSearch =
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || log.category === categoryFilter
      const matchesAction = actionFilter === "all" || log.action === actionFilter
      return matchesSearch && matchesCategory && matchesAction
    })
  }, [establishmentLogs, searchTerm, categoryFilter, actionFilter])

  const todayLogs = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return establishmentLogs.filter((log) => log.timestamp.startsWith(today.replace(/-/g, "-"))).length
  }, [establishmentLogs])

  const exportCSV = () => {
    const headers = ["Data/Hora", "Acao", "Categoria", "Descricao", "Alvo", "Usuario", "Email", "IP"]
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.action,
      log.category,
      log.description,
      log.target,
      log.user.name,
      log.user.email,
      log.ip,
    ])
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${selectedEstabelecimento?.nomeFantasia || "estabelecimento"}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  if (!selectedEstabelecimento) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Selecione um Estabelecimento</h2>
          <p className="text-muted-foreground">
            Para visualizar os logs de auditoria, selecione um estabelecimento no menu lateral.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit - {selectedEstabelecimento.nomeFantasia}</h1>
          <p className="text-muted-foreground">Logs de atividades e alteracoes do estabelecimento</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Logs</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{establishmentLogs.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Logs Hoje</CardTitle>
            <ClipboardList className="h-4 w-4 text-[#008529]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#008529]">{todayLogs}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Filtrados</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{filteredLogs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por descricao, usuario ou alvo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="Transacao">Transacao</SelectItem>
                <SelectItem value="Usuario">Usuario</SelectItem>
                <SelectItem value="Configuracao">Configuracao</SelectItem>
                <SelectItem value="Autenticacao">Autenticacao</SelectItem>
                <SelectItem value="Relatorio">Relatorio</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Acao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Acoes</SelectItem>
                <SelectItem value="criar">Criar</SelectItem>
                <SelectItem value="editar">Editar</SelectItem>
                <SelectItem value="excluir">Excluir</SelectItem>
                <SelectItem value="ativar">Ativar</SelectItem>
                <SelectItem value="desativar">Desativar</SelectItem>
                <SelectItem value="configurar">Configurar</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Data/Hora</TableHead>
                <TableHead className="text-muted-foreground">Acao</TableHead>
                <TableHead className="text-muted-foreground">Categoria</TableHead>
                <TableHead className="text-muted-foreground">Descricao</TableHead>
                <TableHead className="text-muted-foreground">Alvo</TableHead>
                <TableHead className="text-muted-foreground">Usuario</TableHead>
                <TableHead className="text-muted-foreground">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum log encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-border">
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {log.timestamp}
                    </TableCell>
                    <TableCell>
                      <Badge className={`gap-1 ${actionColors[log.action]}`}>
                        {actionIcons[log.action]}
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {categoryIcons[log.category]}
                        <span className="text-sm">{log.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-foreground">
                      {log.description}
                    </TableCell>
                    <TableCell className="text-foreground font-medium">{log.target}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{log.user.name}</div>
                        <div className="text-xs text-muted-foreground">{log.user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
