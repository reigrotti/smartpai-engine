"use client"

import { useState, useMemo, useCallback } from "react"
import { Download, Settings2, Search, RefreshCw, GripVertical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Tipo das transações baseado no CSV da Adyen
interface Transaction {
  id: string
  pspReference: string
  merchantReference: string
  account: string
  creationDate: string
  value: number
  currency: string
  paymentMethod: string
  status: "Authorised" | "Refused" | "SettledExternally" | "SettledInstallmentBulk" | "SettledInInstallments"
  riskScore: number
  accountHolderName: string
  acquirer: string
  acquirerAccount: string
  cardBin: string
  cardNumberSummary: string
  issuer: string
  issuerCountry: string
  shopperCountry: string
  shopperEmail: string
  shopperName: string
  shopperReference: string
  installments: number
  fundingSource: string
  rawAcquirerResponse: string
}

// Definição das colunas disponíveis
const allColumns = [
  { id: "creationDate", label: "Data/Hora", default: true },
  { id: "pspReference", label: "PSP Reference", default: true },
  { id: "merchantReference", label: "Merchant Reference", default: false },
  { id: "accountHolderName", label: "Titular", default: true },
  { id: "value", label: "Valor", default: true },
  { id: "currency", label: "Moeda", default: false },
  { id: "paymentMethod", label: "Bandeira", default: true },
  { id: "status", label: "Status", default: true },
  { id: "acquirer", label: "Adquirente", default: true },
  { id: "acquirerAccount", label: "Conta Adquirente", default: false },
  { id: "cardBin", label: "Card BIN", default: false },
  { id: "cardNumberSummary", label: "Final Cartão", default: true },
  { id: "issuer", label: "Emissor", default: false },
  { id: "issuerCountry", label: "País Emissor", default: false },
  { id: "shopperCountry", label: "País Comprador", default: false },
  { id: "shopperEmail", label: "Email", default: false },
  { id: "shopperName", label: "Nome Comprador", default: false },
  { id: "shopperReference", label: "Ref. Comprador", default: false },
  { id: "installments", label: "Parcelas", default: true },
  { id: "riskScore", label: "Risk Score", default: false },
  { id: "account", label: "Account", default: false },
  { id: "rawAcquirerResponse", label: "Resposta Adquirente", default: false },
] as const

type ColumnId = typeof allColumns[number]["id"]

// Dados mockados com informações fictícias
const mockTransactions: Transaction[] = [
  {
    id: "1",
    pspReference: "ABCD1234EFGH5678",
    merchantReference: "100001-200001-300001-400001",
    account: "LojaOnline1",
    creationDate: "2026-05-20 21:15:05",
    value: 509.00,
    currency: "BRL",
    paymentMethod: "Mastercard",
    status: "Refused",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 01",
    acquirer: "Cielo",
    acquirerAccount: "Cielo_Conta_001",
    cardBin: "510000",
    cardNumberSummary: "1234",
    issuer: "BANCO EXEMPLO S.A.",
    issuerCountry: "BR",
    shopperCountry: "BR",
    shopperEmail: "usuario01@plinia.com",
    shopperName: "Plinia Usuario 01",
    shopperReference: "CLT000001",
    installments: 2,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "83 : Autorizacao negada"
  },
  {
    id: "2",
    pspReference: "IJKL5678MNOP9012",
    merchantReference: "100002-200002-300002-400002",
    account: "ECommerce1",
    creationDate: "2026-05-20 21:15:02",
    value: 187.86,
    currency: "BRL",
    paymentMethod: "Visa",
    status: "Authorised",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 02",
    acquirer: "Cielo",
    acquirerAccount: "Cielo_Conta_002",
    cardBin: "411111",
    cardNumberSummary: "5678",
    issuer: "CAIXA FEDERAL",
    issuerCountry: "BR",
    shopperCountry: "BR",
    shopperEmail: "usuario02@plinia.com",
    shopperName: "Plinia Usuario 02",
    shopperReference: "CLT000002",
    installments: 1,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "00 : Transacao autorizada"
  },
  {
    id: "3",
    pspReference: "QRST9012UVWX3456",
    merchantReference: "100003-200003-300003-400003",
    account: "ECommerce1",
    creationDate: "2026-05-20 21:14:55",
    value: 33.64,
    currency: "BRL",
    paymentMethod: "Mastercard",
    status: "Authorised",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 03",
    acquirer: "Rede",
    acquirerAccount: "Rede_Conta_001",
    cardBin: "520000",
    cardNumberSummary: "9012",
    issuer: "BANCO DIGITAL S.A.",
    issuerCountry: "BR",
    shopperCountry: "BR",
    shopperEmail: "usuario03@plinia.com",
    shopperName: "Plinia Usuario 03",
    shopperReference: "CLT000003",
    installments: 1,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "00 : Success."
  },
  {
    id: "4",
    pspReference: "YZAB3456CDEF7890",
    merchantReference: "100004-200004-300004-400004",
    account: "ECommerce1",
    creationDate: "2026-05-20 21:14:54",
    value: 194.76,
    currency: "BRL",
    paymentMethod: "Mastercard",
    status: "Authorised",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 04",
    acquirer: "Rede",
    acquirerAccount: "Rede_Conta_001",
    cardBin: "530000",
    cardNumberSummary: "3456",
    issuer: "FINTECH PAGAMENTOS",
    issuerCountry: "BR",
    shopperCountry: "BR",
    shopperEmail: "usuario04@plinia.com",
    shopperName: "Plinia Usuario 04",
    shopperReference: "CLT000004",
    installments: 1,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "00 : Success."
  },
  {
    id: "5",
    pspReference: "GHIJ7890KLMN1234",
    merchantReference: "100005-200005-300005-400005",
    account: "ECommerce1",
    creationDate: "2026-05-20 21:14:52",
    value: 35.91,
    currency: "BRL",
    paymentMethod: "Mastercard",
    status: "Authorised",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 05",
    acquirer: "Rede",
    acquirerAccount: "Rede_Conta_001",
    cardBin: "540000",
    cardNumberSummary: "7890",
    issuer: "FINTECH PAGAMENTOS",
    issuerCountry: "BR",
    shopperCountry: "BR",
    shopperEmail: "usuario05@plinia.com",
    shopperName: "Plinia Usuario 05",
    shopperReference: "CLT000005",
    installments: 1,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "00 : Success."
  },
  {
    id: "6",
    pspReference: "OPQR1234STUV5678",
    merchantReference: "100006-200006-300006-400006",
    account: "Marketplace1",
    creationDate: "2026-05-20 21:14:45",
    value: 400.00,
    currency: "BRL",
    paymentMethod: "Mastercard",
    status: "Authorised",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 06",
    acquirer: "Adyen",
    acquirerAccount: "Adyen_MC_Conta_001",
    cardBin: "550000",
    cardNumberSummary: "2345",
    issuer: "BANCO TRADICIONAL S.A.",
    issuerCountry: "BR",
    shopperCountry: "BR",
    shopperEmail: "usuario06@plinia.com",
    shopperName: "Plinia Usuario 06",
    shopperReference: "CLT000006",
    installments: 1,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "00 : Approved or completed successfully"
  },
  {
    id: "7",
    pspReference: "WXYZ5678ABCD9012",
    merchantReference: "100007-200007-300007-400007",
    account: "Assinaturas1",
    creationDate: "2026-05-20 21:14:45",
    value: 46.00,
    currency: "BRL",
    paymentMethod: "Visa",
    status: "Refused",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 07",
    acquirer: "Adyen",
    acquirerAccount: "Adyen_Visa_Conta_001",
    cardBin: "422222",
    cardNumberSummary: "6789",
    issuer: "BANCO INVESTIMENTO S.A.",
    issuerCountry: "BR",
    shopperCountry: "",
    shopperEmail: "",
    shopperName: "",
    shopperReference: "CLT000007",
    installments: 0,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "9G : Blocked by cardholder/contact cardholder"
  },
  {
    id: "8",
    pspReference: "EFGH9012IJKL3456",
    merchantReference: "100008-200008-300008-400008",
    account: "ECommerce1",
    creationDate: "2026-05-20 21:14:43",
    value: 84.13,
    currency: "BRL",
    paymentMethod: "Mastercard",
    status: "Authorised",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 08",
    acquirer: "Rede",
    acquirerAccount: "Rede_Conta_001",
    cardBin: "510000",
    cardNumberSummary: "0123",
    issuer: "BANCO EMPRESARIAL S.A.",
    issuerCountry: "BR",
    shopperCountry: "BR",
    shopperEmail: "usuario08@plinia.com",
    shopperName: "Plinia Usuario 08",
    shopperReference: "CLT000008",
    installments: 1,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "00 : Success."
  },
  {
    id: "9",
    pspReference: "MNOP3456QRST7890",
    merchantReference: "100009-200009-300009-400009",
    account: "ECommerce1",
    creationDate: "2026-05-20 21:14:42",
    value: 70.30,
    currency: "BRL",
    paymentMethod: "Mastercard",
    status: "Authorised",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 09",
    acquirer: "Rede",
    acquirerAccount: "Rede_Conta_001",
    cardBin: "520000",
    cardNumberSummary: "4567",
    issuer: "FINTECH PAGAMENTOS",
    issuerCountry: "BR",
    shopperCountry: "BR",
    shopperEmail: "usuario09@plinia.com",
    shopperName: "Plinia Usuario 09",
    shopperReference: "CLT000009",
    installments: 1,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "00 : Success."
  },
  {
    id: "10",
    pspReference: "UVWX7890YZAB1234",
    merchantReference: "100010-200010-300010-400010",
    account: "Premium1",
    creationDate: "2026-05-20 21:14:40",
    value: 1071.00,
    currency: "BRL",
    paymentMethod: "Mastercard",
    status: "Authorised",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 10",
    acquirer: "Cielo",
    acquirerAccount: "Cielo_Conta_001",
    cardBin: "530000",
    cardNumberSummary: "8901",
    issuer: "BANCO NACIONAL S.A.",
    issuerCountry: "BR",
    shopperCountry: "BR",
    shopperEmail: "usuario10@plinia.com",
    shopperName: "Plinia Usuario 10",
    shopperReference: "CLT000010",
    installments: 5,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "00 : Transacao autorizada"
  },
  {
    id: "11",
    pspReference: "CDEF1234GHIJ5678",
    merchantReference: "100011-200011-300011-400011",
    account: "Vendas1",
    creationDate: "2026-05-20 21:14:40",
    value: 1840.00,
    currency: "BRL",
    paymentMethod: "Elo",
    status: "Refused",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 11",
    acquirer: "Cielo",
    acquirerAccount: "Cielo_Conta_001",
    cardBin: "636368",
    cardNumberSummary: "2345",
    issuer: "BANCO PUBLICO S.A.",
    issuerCountry: "BR",
    shopperCountry: "BR",
    shopperEmail: "usuario11@plinia.com",
    shopperName: "Plinia Usuario 11",
    shopperReference: "CLT000011",
    installments: 5,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "51 : Autorizacao negada"
  },
  {
    id: "12",
    pspReference: "KLMN5678OPQR9012",
    merchantReference: "100012-200012-300012-400012",
    account: "Vendas1",
    creationDate: "2026-05-20 21:14:39",
    value: 184.00,
    currency: "BRL",
    paymentMethod: "Visa",
    status: "Authorised",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 12",
    acquirer: "Cielo",
    acquirerAccount: "Cielo_Conta_001",
    cardBin: "433333",
    cardNumberSummary: "6789",
    issuer: "BANCO REGIONAL S.A.",
    issuerCountry: "BR",
    shopperCountry: "BR",
    shopperEmail: "usuario12@plinia.com",
    shopperName: "Plinia Usuario 12",
    shopperReference: "CLT000012",
    installments: 4,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "00 : Transacao autorizada"
  },
  {
    id: "13",
    pspReference: "STUV9012WXYZ3456",
    merchantReference: "100013-200013-300013-400013",
    account: "Assinatura1",
    creationDate: "2026-05-20 21:14:29",
    value: 842.40,
    currency: "BRL",
    paymentMethod: "Mastercard",
    status: "SettledInstallmentBulk",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 13",
    acquirer: "Adyen",
    acquirerAccount: "Adyen_MC_Conta_002",
    cardBin: "540000",
    cardNumberSummary: "0123",
    issuer: "BANCO DIGITAL S.A.",
    issuerCountry: "BR",
    shopperCountry: "BR",
    shopperEmail: "usuario13@plinia.com",
    shopperName: "Plinia Usuario 13",
    shopperReference: "CLT000013",
    installments: 12,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "00 : Approved or completed successfully"
  },
  {
    id: "14",
    pspReference: "ABEF3456CDGH7890",
    merchantReference: "100014-200014-300014-400014",
    account: "Clube1",
    creationDate: "2026-05-20 21:14:24",
    value: 23.00,
    currency: "BRL",
    paymentMethod: "Visa",
    status: "SettledInInstallments",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 14",
    acquirer: "Adyen",
    acquirerAccount: "Adyen_Visa_Conta_002",
    cardBin: "444444",
    cardNumberSummary: "4567",
    issuer: "PAGAMENTOS DIGITAIS LTDA.",
    issuerCountry: "BR",
    shopperCountry: "BR",
    shopperEmail: "usuario14@plinia.com",
    shopperName: "Plinia Usuario 14",
    shopperReference: "CLT000014",
    installments: 1,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "00 : Approved or completed successfully"
  },
  {
    id: "15",
    pspReference: "IJKL7890MNOP1234",
    merchantReference: "100015-200015-300015-400015",
    account: "Clube1",
    creationDate: "2026-05-20 21:14:19",
    value: 46.00,
    currency: "BRL",
    paymentMethod: "Mastercard",
    status: "Authorised",
    riskScore: 0,
    accountHolderName: "Plinia Usuario 15",
    acquirer: "Adyen",
    acquirerAccount: "Adyen_MC_Conta_002",
    cardBin: "550000",
    cardNumberSummary: "8901",
    issuer: "BANCO FINTECH S.A.",
    issuerCountry: "BR",
    shopperCountry: "BR",
    shopperEmail: "usuario15@plinia.com",
    shopperName: "Plinia Usuario 15",
    shopperReference: "CLT000015",
    installments: 1,
    fundingSource: "CREDIT",
    rawAcquirerResponse: "00 : Approved or completed successfully"
  },
]

// Função para formatar valores
const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(value)
}

// Função para obter badge de status
const getStatusBadge = (status: Transaction["status"]) => {
  switch (status) {
    case "Authorised":
      return (
        <Badge className="bg-[#008529]/15 text-[#008529] hover:bg-[#008529]/25 border-[#008529]/30">
          Autorizado
        </Badge>
      )
    case "Refused":
      return (
        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
          Recusado
        </Badge>
      )
    case "SettledExternally":
      return (
        <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">
          Liquidado Ext.
        </Badge>
      )
    case "SettledInstallmentBulk":
      return (
        <Badge className="bg-[#008529] text-white hover:bg-[#008529]/90 border-[#008529]">
          Liq. Parcelado
        </Badge>
      )
    case "SettledInInstallments":
      return (
        <Badge className="bg-[#008529]/15 text-[#008529] hover:bg-[#008529]/25 border-[#008529]/30">
          Em Parcelas
        </Badge>
      )
    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      )
  }
}

export function TransactionsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnId>>(
    new Set(allColumns.filter(col => col.default).map(col => col.id))
  )
  const [columnOrder, setColumnOrder] = useState<ColumnId[]>(allColumns.map(col => col.id))
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [draggedColumn, setDraggedColumn] = useState<ColumnId | null>(null)

  // Colunas ordenadas e visíveis
  const orderedVisibleColumns = useMemo(() => {
    return columnOrder
      .filter(colId => visibleColumns.has(colId))
      .map(colId => allColumns.find(col => col.id === colId)!)
  }, [columnOrder, visibleColumns])

  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return mockTransactions
    const term = searchTerm.toLowerCase()
    return mockTransactions.filter(
      (t) =>
        t.pspReference.toLowerCase().includes(term) ||
        t.accountHolderName.toLowerCase().includes(term) ||
        t.shopperEmail.toLowerCase().includes(term) ||
        t.cardNumberSummary.includes(term) ||
        t.acquirer.toLowerCase().includes(term)
    )
  }, [searchTerm])

  // Toggle coluna
  const toggleColumn = (columnId: ColumnId) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev)
      if (next.has(columnId)) {
        next.delete(columnId)
      } else {
        next.add(columnId)
      }
      return next
    })
  }

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, columnId: ColumnId) => {
    setDraggedColumn(columnId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", columnId)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetColumnId: ColumnId) => {
    e.preventDefault()
    if (!draggedColumn || draggedColumn === targetColumnId) {
      setDraggedColumn(null)
      return
    }

    setColumnOrder(prevOrder => {
      const newOrder = [...prevOrder]
      const draggedIndex = newOrder.indexOf(draggedColumn)
      const targetIndex = newOrder.indexOf(targetColumnId)
      
      newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, draggedColumn)
      
      return newOrder
    })
    setDraggedColumn(null)
  }, [draggedColumn])

  const handleDragEnd = useCallback(() => {
    setDraggedColumn(null)
  }, [])

  // Exportar CSV
  const exportCSV = () => {
    const headers = orderedVisibleColumns.map((col) => col.label).join(",")
    
    const rows = filteredTransactions.slice(0, 1000).map((t) => {
      return orderedVisibleColumns
        .map((col) => {
          const value = t[col.id as keyof Transaction]
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`
          }
          return value
        })
        .join(",")
    })

    const csv = [headers, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `transacoes_plinia_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Simular refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Render valor da célula
  const renderCellValue = (transaction: Transaction, columnId: ColumnId) => {
    switch (columnId) {
      case "value":
        return formatCurrency(transaction.value, transaction.currency)
      case "status":
        return getStatusBadge(transaction.status)
      case "installments":
        return transaction.installments > 0 ? `${transaction.installments}x` : "-"
      case "creationDate":
        return (
          <span className="text-xs">
            {new Date(transaction.creationDate).toLocaleString("pt-BR")}
          </span>
        )
      case "cardNumberSummary":
        return <span className="font-mono">****{transaction.cardNumberSummary}</span>
      case "cardBin":
        return <span className="font-mono">{transaction.cardBin}</span>
      case "pspReference":
        return <span className="font-mono text-xs">{transaction.pspReference}</span>
      case "rawAcquirerResponse":
        return (
          <span className="text-xs max-w-[200px] truncate block" title={transaction.rawAcquirerResponse}>
            {transaction.rawAcquirerResponse}
          </span>
        )
      default:
        return transaction[columnId as keyof Transaction] || "-"
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Transações em Tempo Real
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Indicador ao vivo */}
            <div className="flex items-center gap-2 mr-4">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#008529] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#008529]"></span>
              </span>
              <span className="text-xs text-muted-foreground">Ao vivo</span>
            </div>

            {/* Botão Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Atualizar
            </Button>

            {/* Dropdown colunas */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
                <DropdownMenuLabel>Colunas Visíveis</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allColumns.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={visibleColumns.has(col.id)}
                    onCheckedChange={() => toggleColumn(col.id)}
                  >
                    {col.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Botão Exportar */}
            <Button
              size="sm"
              onClick={exportCSV}
              className="bg-[#008529] hover:bg-[#008529]/90 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Busca */}
        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por PSP, titular, email, cartão ou adquirente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {orderedVisibleColumns.map((col) => (
                  <TableHead
                    key={col.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, col.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "text-muted-foreground font-medium whitespace-nowrap cursor-grab select-none",
                      draggedColumn === col.id && "opacity-50",
                      draggedColumn && draggedColumn !== col.id && "border-l-2 border-l-transparent hover:border-l-[#008529]"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
                      {col.label}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="border-border hover:bg-muted/50 cursor-pointer"
                >
                  {orderedVisibleColumns.map((col) => (
                    <TableCell key={col.id} className="whitespace-nowrap">
                      {renderCellValue(transaction, col.id)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer com contagem */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Exibindo {filteredTransactions.length} transações
          </p>
          <p className="text-xs text-muted-foreground">
            Exportação limitada às últimas 1.000 transações
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
