"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, User, Phone, Mail, MapPin, FileText, Save } from "lucide-react"

interface EstabelecimentoForm {
  nomeFantasia: string
  razaoSocial: string
  cnpj: string
  inscricaoEstadual: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  contatoPrincipalNome: string
  contatoPrincipalEmail: string
  contatoPrincipalTelefone: string
  contatoSecundarioNome: string
  contatoSecundarioEmail: string
  contatoSecundarioTelefone: string
}

const initialForm: EstabelecimentoForm = {
  nomeFantasia: "",
  razaoSocial: "",
  cnpj: "",
  inscricaoEstadual: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  contatoPrincipalNome: "",
  contatoPrincipalEmail: "",
  contatoPrincipalTelefone: "",
  contatoSecundarioNome: "",
  contatoSecundarioEmail: "",
  contatoSecundarioTelefone: "",
}

export function OnboardContent() {
  const [form, setForm] = useState<EstabelecimentoForm>(initialForm)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (field: keyof EstabelecimentoForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18)
  }

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 14)
    }
    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15)
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/^(\d{5})(\d)/, "$1-$2").slice(0, 9)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    // Em produção, aqui enviaria para a API
    console.log("Estabelecimento cadastrado:", form)
    
    // Resetar formulário
    setForm(initialForm)
    setIsSaving(false)
    
    // Aqui poderia mostrar um toast de sucesso
    alert("Estabelecimento cadastrado com sucesso!")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">OnBoard</h1>
        <p className="text-muted-foreground">
          Cadastre novos estabelecimentos na plataforma Plinia
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Dados da Empresa */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-[#008529]" />
                Dados da Empresa
              </CardTitle>
              <CardDescription>
                Informações cadastrais do estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomeFantasia">Nome Fantasia *</Label>
                  <Input
                    id="nomeFantasia"
                    placeholder="Nome comercial do estabelecimento"
                    value={form.nomeFantasia}
                    onChange={(e) => handleChange("nomeFantasia", e.target.value)}
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">Razão Social *</Label>
                  <Input
                    id="razaoSocial"
                    placeholder="Razão social completa"
                    value={form.razaoSocial}
                    onChange={(e) => handleChange("razaoSocial", e.target.value)}
                    required
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={form.cnpj}
                    onChange={(e) => handleChange("cnpj", formatCNPJ(e.target.value))}
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                  <Input
                    id="inscricaoEstadual"
                    placeholder="Número da inscrição estadual"
                    value={form.inscricaoEstadual}
                    onChange={(e) => handleChange("inscricaoEstadual", e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-[#008529]" />
                Endereço
              </CardTitle>
              <CardDescription>
                Endereço completo do estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Completo *</Label>
                <Input
                  id="endereco"
                  placeholder="Rua, número, complemento, bairro"
                  value={form.endereco}
                  onChange={(e) => handleChange("endereco", e.target.value)}
                  required
                  className="bg-background border-border"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    placeholder="Cidade"
                    value={form.cidade}
                    onChange={(e) => handleChange("cidade", e.target.value)}
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Input
                    id="estado"
                    placeholder="UF"
                    value={form.estado}
                    onChange={(e) => handleChange("estado", e.target.value.toUpperCase().slice(0, 2))}
                    required
                    maxLength={2}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={form.cep}
                    onChange={(e) => handleChange("cep", formatCEP(e.target.value))}
                    required
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contato Principal */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-[#008529]" />
                Contato Principal
              </CardTitle>
              <CardDescription>
                Dados do responsável principal pelo estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="contatoPrincipalNome">Nome Completo *</Label>
                  <Input
                    id="contatoPrincipalNome"
                    placeholder="Nome do contato"
                    value={form.contatoPrincipalNome}
                    onChange={(e) => handleChange("contatoPrincipalNome", e.target.value)}
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoPrincipalEmail">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="contatoPrincipalEmail"
                      type="email"
                      placeholder="email@empresa.com"
                      value={form.contatoPrincipalEmail}
                      onChange={(e) => handleChange("contatoPrincipalEmail", e.target.value)}
                      required
                      className="bg-background border-border pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoPrincipalTelefone">Telefone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="contatoPrincipalTelefone"
                      placeholder="(00) 00000-0000"
                      value={form.contatoPrincipalTelefone}
                      onChange={(e) => handleChange("contatoPrincipalTelefone", formatTelefone(e.target.value))}
                      required
                      className="bg-background border-border pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contato Secundário */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-[#36103A]" />
                Contato Secundário
              </CardTitle>
              <CardDescription>
                Dados de um contato alternativo (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="contatoSecundarioNome">Nome Completo</Label>
                  <Input
                    id="contatoSecundarioNome"
                    placeholder="Nome do contato"
                    value={form.contatoSecundarioNome}
                    onChange={(e) => handleChange("contatoSecundarioNome", e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoSecundarioEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="contatoSecundarioEmail"
                      type="email"
                      placeholder="email@empresa.com"
                      value={form.contatoSecundarioEmail}
                      onChange={(e) => handleChange("contatoSecundarioEmail", e.target.value)}
                      className="bg-background border-border pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contatoSecundarioTelefone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="contatoSecundarioTelefone"
                      placeholder="(00) 00000-0000"
                      value={form.contatoSecundarioTelefone}
                      onChange={(e) => handleChange("contatoSecundarioTelefone", formatTelefone(e.target.value))}
                      className="bg-background border-border pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão de Envio */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#008529] hover:bg-[#008529]/90 text-white px-8"
            >
              {isSaving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Cadastrar Estabelecimento
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
