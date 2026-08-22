"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Plus,
  Users,
  UserCheck,
  UserX,
  MoreHorizontal,
  Edit,
  ToggleLeft,
  ToggleRight,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from "@/components/ui/label"
import { useEstabelecimento } from "@/contexts/estabelecimento-context"

interface User {
  id: string
  nome: string
  sobrenome: string
  email: string
  status: "ativo" | "inativo"
  criadoEm: string
  ultimoAcesso: string
  estabelecimentoId: string
}

// Usuarios mockados por estabelecimento
const allUsers: User[] = [
  {
    id: "1",
    nome: "Maria",
    sobrenome: "Santos",
    email: "maria@lojacentral.com",
    status: "ativo",
    criadoEm: "2024-01-10",
    ultimoAcesso: "2024-01-15 14:32",
    estabelecimentoId: "1",
  },
  {
    id: "2",
    nome: "Carlos",
    sobrenome: "Oliveira",
    email: "carlos@lojacentral.com",
    status: "ativo",
    criadoEm: "2024-01-12",
    ultimoAcesso: "2024-01-15 10:15",
    estabelecimentoId: "1",
  },
  {
    id: "3",
    nome: "Joao",
    sobrenome: "Silva",
    email: "joao@lojacentral.com",
    status: "inativo",
    criadoEm: "2024-01-05",
    ultimoAcesso: "2024-01-14 18:00",
    estabelecimentoId: "1",
  },
  {
    id: "4",
    nome: "Pedro",
    sobrenome: "Lima",
    email: "pedro@ecommercebrasil.com",
    status: "ativo",
    criadoEm: "2024-01-08",
    ultimoAcesso: "2024-01-15 10:22",
    estabelecimentoId: "2",
  },
  {
    id: "5",
    nome: "Ana",
    sobrenome: "Costa",
    email: "ana@ecommercebrasil.com",
    status: "ativo",
    criadoEm: "2024-01-09",
    ultimoAcesso: "2024-01-15 11:30",
    estabelecimentoId: "2",
  },
  {
    id: "6",
    nome: "Lucas",
    sobrenome: "Ferreira",
    email: "lucas@marketplaceplus.com",
    status: "ativo",
    criadoEm: "2024-01-07",
    ultimoAcesso: "2024-01-15 09:15",
    estabelecimentoId: "3",
  },
  {
    id: "7",
    nome: "Fernanda",
    sobrenome: "Alves",
    email: "fernanda@techstore.com",
    status: "ativo",
    criadoEm: "2024-01-11",
    ultimoAcesso: "2024-01-15 08:45",
    estabelecimentoId: "4",
  },
]

export function UsersContent() {
  const { selectedEstabelecimento } = useEstabelecimento()
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>(allUsers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [statusDialogUser, setStatusDialogUser] = useState<User | null>(null)
  
  // Form state
  const [formNome, setFormNome] = useState("")
  const [formSobrenome, setFormSobrenome] = useState("")
  const [formEmail, setFormEmail] = useState("")

  // Filtrar usuarios pelo estabelecimento selecionado
  const establishmentUsers = useMemo(() => {
    if (!selectedEstabelecimento) {
      return []
    }
    return users.filter(user => user.estabelecimentoId === selectedEstabelecimento.id)
  }, [selectedEstabelecimento, users])

  const filteredUsers = useMemo(() => {
    return establishmentUsers.filter(
      (user) =>
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.sobrenome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [establishmentUsers, searchTerm])

  const activeUsers = establishmentUsers.filter((u) => u.status === "ativo").length
  const inactiveUsers = establishmentUsers.filter((u) => u.status === "inativo").length

  const openNewUserDialog = () => {
    setEditingUser(null)
    setFormNome("")
    setFormSobrenome("")
    setFormEmail("")
    setIsDialogOpen(true)
  }

  const openEditUserDialog = (user: User) => {
    setEditingUser(user)
    setFormNome(user.nome)
    setFormSobrenome(user.sobrenome)
    setFormEmail(user.email)
    setIsDialogOpen(true)
  }

  const handleSaveUser = () => {
    if (!selectedEstabelecimento) return
    
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, nome: formNome, sobrenome: formSobrenome, email: formEmail }
            : u
        )
      )
    } else {
      const newUser: User = {
        id: String(Date.now()),
        nome: formNome,
        sobrenome: formSobrenome,
        email: formEmail,
        status: "ativo",
        criadoEm: new Date().toISOString().split("T")[0],
        ultimoAcesso: "-",
        estabelecimentoId: selectedEstabelecimento.id,
      }
      setUsers((prev) => [...prev, newUser])
    }
    setIsDialogOpen(false)
  }

  const handleToggleStatus = () => {
    if (!statusDialogUser) return
    setUsers((prev) =>
      prev.map((u) =>
        u.id === statusDialogUser.id
          ? { ...u, status: u.status === "ativo" ? "inativo" : "ativo" }
          : u
      )
    )
    setStatusDialogUser(null)
  }

  if (!selectedEstabelecimento) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Selecione um Estabelecimento</h2>
          <p className="text-muted-foreground">
            Para gerenciar os usuarios, selecione um estabelecimento no menu lateral.
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
          <h1 className="text-2xl font-bold text-foreground">Usuarios - {selectedEstabelecimento.nomeFantasia}</h1>
          <p className="text-muted-foreground">Gerencie os usuarios do estabelecimento</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewUserDialog} className="gap-2 bg-[#008529] hover:bg-[#008529]/90">
              <Plus className="h-4 w-4" />
              Novo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Usuario" : "Novo Usuario"}</DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Atualize as informacoes do usuario."
                  : "Preencha os dados para cadastrar um novo usuario."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formNome}
                  onChange={(e) => setFormNome(e.target.value)}
                  placeholder="Nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sobrenome">Sobrenome</Label>
                <Input
                  id="sobrenome"
                  value={formSobrenome}
                  onChange={(e) => setFormSobrenome(e.target.value)}
                  placeholder="Sobrenome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@empresa.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveUser} className="bg-[#008529] hover:bg-[#008529]/90">
                {editingUser ? "Salvar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{establishmentUsers.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-[#008529]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#008529]">{activeUsers}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inativos</CardTitle>
            <UserX className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{inactiveUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Usuario</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Criado em</TableHead>
                <TableHead className="text-muted-foreground">Ultimo Acesso</TableHead>
                <TableHead className="text-muted-foreground w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhum usuario encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      {user.nome} {user.sobrenome}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.status === "ativo"
                            ? "bg-[#008529]/10 text-[#008529] border-[#008529]/20"
                            : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.criadoEm}</TableCell>
                    <TableCell className="text-muted-foreground">{user.ultimoAcesso}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditUserDialog(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setStatusDialogUser(user)}>
                            {user.status === "ativo" ? (
                              <>
                                <ToggleLeft className="mr-2 h-4 w-4" />
                                Inativar
                              </>
                            ) : (
                              <>
                                <ToggleRight className="mr-2 h-4 w-4" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Status Toggle Dialog */}
      <AlertDialog open={!!statusDialogUser} onOpenChange={() => setStatusDialogUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusDialogUser?.status === "ativo" ? "Inativar Usuario" : "Ativar Usuario"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusDialogUser?.status === "ativo"
                ? `Tem certeza que deseja inativar ${statusDialogUser?.nome} ${statusDialogUser?.sobrenome}? O usuario nao podera mais acessar o sistema.`
                : `Tem certeza que deseja ativar ${statusDialogUser?.nome} ${statusDialogUser?.sobrenome}? O usuario podera acessar o sistema novamente.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              className={
                statusDialogUser?.status === "ativo"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-[#008529] hover:bg-[#008529]/90"
              }
            >
              {statusDialogUser?.status === "ativo" ? "Inativar" : "Ativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
