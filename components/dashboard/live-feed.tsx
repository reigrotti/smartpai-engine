"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface Transaction {
  id: string
  value: number
  brand: string
  originalAcquirer: string
  finalAcquirer: string
  status: "success" | "failed" | "saved"
}

const transactions: Transaction[] = [
  {
    id: "TXN-001482",
    value: 1250.0,
    brand: "Visa",
    originalAcquirer: "Cielo",
    finalAcquirer: "Cielo",
    status: "success",
  },
  {
    id: "TXN-001481",
    value: 89.9,
    brand: "Mastercard",
    originalAcquirer: "Rede",
    finalAcquirer: "Rede",
    status: "success",
  },
  {
    id: "TXN-001480",
    value: 3450.0,
    brand: "Visa",
    originalAcquirer: "Cielo",
    finalAcquirer: "Rede",
    status: "saved",
  },
  {
    id: "TXN-001479",
    value: 567.5,
    brand: "Elo",
    originalAcquirer: "Rede",
    finalAcquirer: "Rede",
    status: "failed",
  },
  {
    id: "TXN-001478",
    value: 2100.0,
    brand: "Mastercard",
    originalAcquirer: "Rede",
    finalAcquirer: "Cielo",
    status: "saved",
  },
  {
    id: "TXN-001477",
    value: 450.0,
    brand: "Visa",
    originalAcquirer: "Cielo",
    finalAcquirer: "Cielo",
    status: "success",
  },
  {
    id: "TXN-001476",
    value: 1890.0,
    brand: "Hipercard",
    originalAcquirer: "Cielo",
    finalAcquirer: "Cielo",
    status: "success",
  },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

const getStatusBadge = (status: Transaction["status"]) => {
  switch (status) {
    case "success":
      return (
        <Badge className="bg-[#008529]/15 text-[#008529] hover:bg-[#008529]/25 border-[#008529]/30">
          Sucesso
        </Badge>
      )
    case "failed":
      return (
        <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
          Falha
        </Badge>
      )
    case "saved":
      return (
        <Badge className="bg-[#008529] text-white hover:bg-[#008529]/90 border-[#008529] font-semibold">
          SAVED (Silent Recovery)
        </Badge>
      )
  }
}

export function LiveFeed() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Live Feed</CardTitle>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#008529] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#008529]"></span>
            </span>
            <span className="text-xs text-muted-foreground">Ao vivo</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-muted-foreground font-medium">ID</TableHead>
                <TableHead className="text-muted-foreground font-medium">Valor</TableHead>
                <TableHead className="text-muted-foreground font-medium">Bandeira</TableHead>
                <TableHead className="text-muted-foreground font-medium">Adquirente Original</TableHead>
                <TableHead className="text-muted-foreground font-medium">Adquirente Final</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow 
                  key={transaction.id}
                  className={cn(
                    "border-border hover:bg-muted/50",
                    index === 0 && "animate-pulse-once"
                  )}
                >
                  <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(transaction.value)}</TableCell>
                  <TableCell>{transaction.brand}</TableCell>
                  <TableCell>{transaction.originalAcquirer}</TableCell>
                  <TableCell>
                    <span className={cn(
                      transaction.originalAcquirer !== transaction.finalAcquirer && "text-[#008529] font-medium"
                    )}>
                      {transaction.finalAcquirer}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{getStatusBadge(transaction.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
