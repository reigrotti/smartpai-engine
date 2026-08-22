"use client"

import { useState, useMemo } from "react"
import { 
  Search, 
  Filter,
  Download,
  User,
  Settings,
  UserPlus,
  Puzzle,
  Key,
  ToggleLeft,
  ToggleRight,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Calendar
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
import { cn } from "@/lib/utils"

type AuditAction = 
  | "criar" 
  | "editar" 
  | "excluir" 
  | "ativar" 
  | "desativar" 
  | "login" 
  | "logout"
  | "config"

type AuditCategory = 
  | "onboard" 
  | "usuario" 
  | "integracao" 
  | "credencial" 
  | "sistema"
  | "autenticacao"

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
  details?: string
}

// Dados mockados de audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2024-01-15T14:32:45",
    action: "criar",
    category: "onboard",
    description: "Novo estabelecimento cadastrado",
    target: "Loja Central",
    user: { name: "Carlos Silva", email: "carlos.silva@plinia.com" },
    ip: "192.168.1.45",
    details: "CNPJ: 12.345.678/0001-90"
  },
  {
    id: "2",
    timestamp: "2024-01-15T14:28:12",
    action: "ativar",
    category: "integracao",
    description: "Integracao ativada",
    target: "Cielo - Loja Central",
    user: { name: "Carlos Silva", email: "carlos.silva@plinia.com" },
    ip: "192.168.1.45",
  },
  {
    id: "3",
    timestamp: "2024-01-15T13:55:30",
    action: "config",
    category: "credencial",
    description: "Credenciais configuradas",
    target: "Cielo - Loja Central",
    user: { name: "Carlos Silva", email: "carlos.silva@plinia.com" },
    ip: "192.168.1.45",
    details: "Merchant ID e API Key atualizados"
  },
  {
    id: "4",
    timestamp: "2024-01-15T11:20:00",
    action: "criar",
    category: "usuario",
    description: "Novo usuario cadastrado",
    target: "Ana Costa",
    user: { name: "Maria Santos", email: "maria.santos@plinia.com" },
    ip: "192.168.1.32",
    details: "Email: ana.costa@plinia.com"
  },
  {
    id: "5",
    timestamp: "2024-01-15T10:45:22",
    action: "editar",
    category: "usuario",
    description: "Dados de usuario alterados",
    target: "Pedro Oliveira",
    user: { name: "Maria Santos", email: "maria.santos@plinia.com" },
    ip: "192.168.1.32",
    details: "Sobrenome atualizado"
  },
  {
    id: "6",
    timestamp: "2024-01-15T09:30:15",
    action: "desativar",
    category: "usuario",
    description: "Usuario desativado",
    target: "Joao Pereira",
    user: { name: "Maria Santos", email: "maria.santos@plinia.com" },
    ip: "192.168.1.32",
  },
  {
    id: "7",
    timestamp: "2024-01-14T16:42:33",
    action: "criar",
    category: "onboard",
    description: "Novo estabelecimento cadastrado",
    target: "E-Commerce Brasil",
    user: { name: "Carlos Silva", email: "carlos.silva@plinia.com" },
    ip: "192.168.1.45",
    details: "CNPJ: 98.765.432/0001-10"
  },
  {
    id: "8",
    timestamp: "2024-01-14T16:38:10",
    action: "ativar",
    category: "integracao",
    description: "Integracao ativada",
    target: "Rede - E-Commerce Brasil",
    user: { name: "Carlos Silva", email: "carlos.silva@plinia.com" },
    ip: "192.168.1.45",
  },
  {
    id: "9",
    timestamp: "2024-01-14T16:35:00",
    action: "config",
    category: "credencial",
    description: "Credenciais configuradas",
    target: "Rede - E-Commerce Brasil",
    user: { name: "Carlos Silva", email: "carlos.silva@plinia.com" },
    ip: "192.168.1.45",
  },
  {
    id: "10",
    timestamp: "2024-01-14T15:20:45",
    action: "desativar",
    category: "integracao",
    description: "Integracao desativada",
    target: "PIX - Tech Store",
    user: { name: "Ana Costa", email: "ana.costa@plinia.com" },
    ip: "192.168.1.67",
  },
  {
    id: "11",
    timestamp: "2024-01-14T14:10:30",
    action: "editar",
    category: "onboard",
    description: "Dados do estabelecimento alterados",
    target: "Marketplace Plus",
    user: { name: "Carlos Silva", email: "carlos.silva@plinia.com" },
    ip: "192.168.1.45",
    details: "Endereco atualizado"
  },
  {
    id: "12",
    timestamp: "2024-01-14T11:05:12",
    action: "login",
    category: "autenticacao",
    description: "Login realizado",
    target: "Sistema",
    user: { name: "Maria Santos", email: "maria.santos@plinia.com" },
    ip: "192.168.1.32",
  },
  {
    id: "13",
    timestamp: "2024-01-13T17:30:00",
    action: "logout",
    category: "autenticacao",
    description: "Logout realizado",
    target: "Sistema",
    user: { name: "Carlos Silva", email: "carlos.silva@plinia.com" },
    ip: "192.168.1.45",
  },
  {
    id: "14",
    timestamp: "2024-01-13T16:22:18",
    action: "excluir",
    category: "credencial",
    description: "Credenciais removidas",
    target: "Cielo - Tech Store",
    user: { name: "Ana Costa", email: "ana.costa@plinia.com" },
    ip: "192.168.1.67",
  },
  {
    id: "15",
    timestamp: "2024-01-13T14:15:45",
    action: "ativar",
    category: "usuario",
    description: "Usuario reativado",
    target: "Roberto Lima",
    user: { name: "Maria Santos", email: "maria.santos@plinia.com" },
    ip: "192.168.1.32",
  },
]

const actionConfig: Record<AuditAction, { label: string; color: string; icon: typeof Plus }> = {
  criar: { label: "Criar", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: Plus },
  editar: { label: "Editar", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Edit },
  excluir: { label: "Excluir", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: Trash2 },
  ativar: { label: "Ativar", color: "bg-[#008529]/10 text-[#008529] border-[#008529]/20", icon: ToggleRight },
  desativar: { label: "Desativar", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: ToggleLeft },
  login: { label: "Login", color: "bg-violet-500/10 text-violet-500 border-violet-500/20", icon: User },
  logout: { label: "Logout", color: "bg-gray-500/10 text-gray-400 border-gray-500/20", icon: User },
  config: { label: "Configurar", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Settings },
}

const categoryConfig: Record<AuditCategory, { label: string; icon: typeof User }> = {
  onboard: { label: "OnBoard", icon: UserPlus },
  usuario: { label: "Usuario", icon: User },
  integracao: { label: "Integracao", icon: Puzzle },
  credencial: { label: "Credencial", icon: Key },
  sistema: { label: "Sistema", icon: Settings },
  autenticacao: { label: "Autenticacao", icon: User },
}

export function AuditAdminContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")

  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter((log) => {
      const matchesSearch = 
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = categoryFilter === "all" || log.category === categoryFilter
      const matchesAction = actionFilter === "all" || log.action === actionFilter
      
      return matchesSearch && matchesCategory && matchesAction
    })
  }, [searchTerm, categoryFilter, actionFilter])

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString("pt-BR"),
      time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    }
  }

  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todayLogs = mockAuditLogs.filter(log => new Date(log.timestamp).toDateString() === today)
    
    return {
      total: mockAuditLogs.length,
      today: todayLogs.length,
      users: new Set(mockAuditLogs.map(log => log.user.email)).size,
    }
  }, [])

  const exportCSV = () => {
    const headers = ["Data", "Hora", "Acao", "Categoria", "Descricao", "Alvo", "Usuario", "Email", "IP"]
    const rows = filteredLogs.map(log => {
      const { date, time } = formatDateTime(log.timestamp)
      return [
        date,
        time,
        actionConfig[log.action].label,
        categoryConfig[log.category].label,
        log.description,
        log.target,
        log.user.name,
        log.user.email,
        log.ip
      ].join(",")
    })
    
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
            <p className="text-sm text-muted-foreground">
              Historico de alteracoes e acoes do sistema
            </p>
          </div>
          <Button onClick={exportCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-border px-6 py-4">
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#008529]/10">
                  <RefreshCw className="h-5 w-5 text-[#008529]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total de Logs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#36103A]/10">
                  <Calendar className="h-5 w-5 text-[#36103A]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.today}</p>
                  <p className="text-xs text-muted-foreground">Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <User className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.users}</p>
                  <p className="text-xs text-muted-foreground">Usuarios Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por descricao, alvo ou usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              <SelectItem value="onboard">OnBoard</SelectItem>
              <SelectItem value="usuario">Usuario</SelectItem>
              <SelectItem value="integracao">Integracao</SelectItem>
              <SelectItem value="credencial">Credencial</SelectItem>
              <SelectItem value="autenticacao">Autenticacao</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Acao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Acoes</SelectItem>
              <SelectItem value="criar">Criar</SelectItem>
              <SelectItem value="editar">Editar</SelectItem>
              <SelectItem value="excluir">Excluir</SelectItem>
              <SelectItem value="ativar">Ativar</SelectItem>
              <SelectItem value="desativar">Desativar</SelectItem>
              <SelectItem value="config">Configurar</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredLogs.length} registro(s)
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <Card className="border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-medium w-[180px]">Data/Hora</TableHead>
                <TableHead className="text-muted-foreground font-medium w-[100px]">Acao</TableHead>
                <TableHead className="text-muted-foreground font-medium w-[120px]">Categoria</TableHead>
                <TableHead className="text-muted-foreground font-medium">Descricao</TableHead>
                <TableHead className="text-muted-foreground font-medium">Alvo</TableHead>
                <TableHead className="text-muted-foreground font-medium">Responsavel</TableHead>
                <TableHead className="text-muted-foreground font-medium w-[120px]">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const { date, time } = formatDateTime(log.timestamp)
                const action = actionConfig[log.action]
                const category = categoryConfig[log.category]
                const ActionIcon = action.icon
                const CategoryIcon = category.icon
                
                return (
                  <TableRow key={log.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-mono text-xs">
                      <div className="flex flex-col">
                        <span className="text-foreground">{date}</span>
                        <span className="text-muted-foreground">{time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("gap-1", action.color)}>
                        <ActionIcon className="h-3 w-3" />
                        {action.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <CategoryIcon className="h-3.5 w-3.5" />
                        <span className="text-xs">{category.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">{log.description}</span>
                        {log.details && (
                          <span className="text-xs text-muted-foreground">{log.details}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">{log.target}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">{log.user.name}</span>
                        <span className="text-xs text-muted-foreground">{log.user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
