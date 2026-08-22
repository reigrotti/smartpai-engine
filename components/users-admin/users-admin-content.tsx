"use client"

import { useState } from "react"
import { Plus, Pencil, UserCheck, UserX, Search, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface User {
  id: string
  nome: string
  sobrenome: string
  email: string
  status: "ativo" | "inativo"
  dataCriacao: string
  ultimoAcesso: string
}

// Dados mockados
const initialUsers: User[] = [
  {
    id: "1",
    nome: "Carlos",
    sobrenome: "Silva",
    email: "carlos.silva@plinia.com",
    status: "ativo",
    dataCriacao: "2024-01-15",
    ultimoAcesso: "2026-05-20 14:32",
  },
  {
    id: "2",
    nome: "Maria",
    sobrenome: "Santos",
    email: "maria.santos@plinia.com",
    status: "ativo",
    dataCriacao: "2024-02-20",
    ultimoAcesso: "2026-05-19 09:15",
  },
  {
    id: "3",
    nome: "João",
    sobrenome: "Oliveira",
    email: "joao.oliveira@plinia.com",
    status: "inativo",
    dataCriacao: "2024-03-10",
    ultimoAcesso: "2026-04-01 11:45",
  },
  {
    id: "4",
    nome: "Ana",
    sobrenome: "Costa",
    email: "ana.costa@plinia.com",
    status: "ativo",
    dataCriacao: "2024-04-05",
    ultimoAcesso: "2026-05-20 16:20",
  },
  {
    id: "5",
    nome: "Pedro",
    sobrenome: "Ferreira",
    email: "pedro.ferreira@plinia.com",
    status: "ativo",
    dataCriacao: "2024-05-12",
    ultimoAcesso: "2026-05-18 10:00",
  },
]

export function UsersAdminContent() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userToToggle, setUserToToggle] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    sobrenome: "",
    email: "",
  })

  const filteredUsers = users.filter(
    (user) =>
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.sobrenome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        nome: user.nome,
        sobrenome: user.sobrenome,
        email: user.email,
      })
    } else {
      setEditingUser(null)
      setFormData({ nome: "", sobrenome: "", email: "" })
    }
    setIsDialogOpen(true)
  }

  const handleSaveUser = () => {
    if (!formData.nome || !formData.sobrenome || !formData.email) return

    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? { ...u, ...formData }
            : u
        )
      )
    } else {
      const newUser: User = {
        id: String(Date.now()),
        ...formData,
        status: "ativo",
        dataCriacao: new Date().toISOString().split("T")[0],
        ultimoAcesso: "-",
      }
      setUsers([...users, newUser])
    }

    setIsDialogOpen(false)
    setFormData({ nome: "", sobrenome: "", email: "" })
    setEditingUser(null)
  }

  const handleToggleStatus = (user: User) => {
    setUserToToggle(user)
    setIsAlertOpen(true)
  }

  const confirmToggleStatus = () => {
    if (userToToggle) {
      setUsers(
        users.map((u) =>
          u.id === userToToggle.id
            ? { ...u, status: u.status === "ativo" ? "inativo" : "ativo" }
            : u
        )
      )
    }
    setIsAlertOpen(false)
    setUserToToggle(null)
  }

  const activeCount = users.filter((u) => u.status === "ativo").length
  const inactiveCount = users.filter((u) => u.status === "inativo").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuários da plataforma Plinia
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#008529] hover:bg-[#008529]/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#008529]">{activeCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuários Inativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{inactiveCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              Lista de Usuários
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Nome</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Email Corporativo</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Data de Criação</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Último Acesso</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-medium text-foreground">
                      {user.nome} {user.sobrenome}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.status === "ativo"
                            ? "bg-[#008529]/15 text-[#008529] hover:bg-[#008529]/25 border-[#008529]/30"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                        }
                      >
                        {user.status === "ativo" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.dataCriacao}</TableCell>
                    <TableCell className="text-muted-foreground">{user.ultimoAcesso}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                            {user.status === "ativo" ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Inativar
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Atualize as informações do usuário."
                : "Preencha os dados para cadastrar um novo usuário."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Digite o nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sobrenome">Sobrenome</Label>
              <Input
                id="sobrenome"
                placeholder="Digite o sobrenome"
                value={formData.sobrenome}
                onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Corporativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@plinia.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-background border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={!formData.nome || !formData.sobrenome || !formData.email}
              className="bg-[#008529] hover:bg-[#008529]/90 text-white"
            >
              {editingUser ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert de Confirmação */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToToggle?.status === "ativo" ? "Inativar Usuário" : "Ativar Usuário"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToToggle?.status === "ativo"
                ? `Tem certeza que deseja inativar o usuário ${userToToggle?.nome} ${userToToggle?.sobrenome}? O usuário não poderá mais acessar a plataforma.`
                : `Tem certeza que deseja ativar o usuário ${userToToggle?.nome} ${userToToggle?.sobrenome}? O usuário poderá acessar a plataforma novamente.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggleStatus}
              className={
                userToToggle?.status === "ativo"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-[#008529] hover:bg-[#008529]/90"
              }
            >
              {userToToggle?.status === "ativo" ? "Inativar" : "Ativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
