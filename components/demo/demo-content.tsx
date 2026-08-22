"use client"

import { useState, useRef, useEffect } from "react"
import { CreditCard, Lock, Terminal, RotateCcw, CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface LogEntry {
  id: number
  timestamp: string
  type: "info" | "success" | "error" | "warning" | "code"
  message: string
  code?: string
}

const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
  const matches = v.match(/\d{4,16}/g)
  const match = (matches && matches[0]) || ""
  const parts = []
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }
  if (parts.length) {
    return parts.join(" ")
  } else {
    return value
  }
}

const formatExpiry = (value: string) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
  if (v.length >= 2) {
    return v.substring(0, 2) + "/" + v.substring(2, 4)
  }
  return v
}

export function DemoContent() {
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")
  const [amount, setAmount] = useState("299.90")
  const [isProcessing, setIsProcessing] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logIdCounter, setLogIdCounter] = useState(0)
  const consoleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [logs])

  const addLog = (type: LogEntry["type"], message: string, code?: string) => {
    const timestamp = new Date().toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit",
      fractionalSecondDigits: 3
    })
    setLogIdCounter(prev => {
      const newId = prev + 1
      setLogs(currentLogs => [...currentLogs, { id: newId, timestamp, type, message, code }])
      return newId
    })
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const clearLogs = () => {
    setLogs([])
    setLogIdCounter(0)
  }

  const processPayment = async () => {
    if (!cardNumber || !cardName || !expiry || !cvv) {
      addLog("error", "Erro: Preencha todos os campos do cartão")
      return
    }

    setIsProcessing(true)
    clearLogs()

    // Início do processamento
    addLog("info", "Iniciando processamento de pagamento...")
    await delay(500)

    addLog("code", "Recebendo dados da transação", `const transaction = {
  amount: ${amount},
  currency: "BRL",
  card: {
    number: "${cardNumber.replace(/\d(?=\d{4})/g, "*")}",
    holder: "${cardName}",
    expiry: "${expiry}",
    cvv: "***"
  }
}`)
    await delay(800)

    addLog("info", "Consultando regras de roteamento...")
    await delay(600)

    addLog("code", "Aplicando regras do motor de decisão", `const routingEngine = new PliniaRouter({
  merchantId: "EST_001",
  rules: ["cost_optimization", "approval_rate", "fallback"]
})

const bestRoute = routingEngine.selectAcquirer(transaction)`)
    await delay(700)

    addLog("success", "Rota primária selecionada: CIELO")
    await delay(400)

    addLog("code", "Enviando autorização para Cielo", `const cieloRequest = {
  endpoint: "https://api.cielo.com.br/v2/authorize",
  method: "POST",
  headers: { "Authorization": "Bearer ****" },
  body: transaction
}

const response = await fetch(cieloRequest)`)
    await delay(1200)

    // Simular falha na Cielo
    addLog("error", "CIELO retornou erro: 51 - Saldo insuficiente")
    await delay(500)

    addLog("warning", "Ativando fallback automático...")
    await delay(400)

    addLog("code", "Executando Silent Recovery", `// Plinia Silent Recovery Engine
const fallbackAcquirer = routingEngine.getFallback({
  previousAcquirer: "CIELO",
  errorCode: "51",
  cardBrand: "MASTERCARD"
})

console.log("Fallback selecionado:", fallbackAcquirer)
// Output: "REDE"`)
    await delay(800)

    addLog("info", "Tentando rota secundária: REDE")
    await delay(400)

    addLog("code", "Enviando autorização para Rede", `const redeRequest = {
  endpoint: "https://api.userede.com.br/v1/transactions",
  method: "POST",
  headers: { "Authorization": "Bearer ****" },
  body: {
    ...transaction,
    softDescriptor: "PLINIA*DEMO"
  }
}

const redeResponse = await fetch(redeRequest)`)
    await delay(1500)

    // Sucesso na Rede
    addLog("success", "REDE retornou: 00 - Transação Autorizada")
    await delay(300)

    addLog("code", "Resposta da autorização", `{
  "status": "APPROVED",
  "authorizationCode": "ABC123",
  "nsu": "987654321",
  "acquirer": "REDE",
  "tid": "10069930690${Date.now().toString().slice(-6)}",
  "timestamp": "${new Date().toISOString()}"
}`)
    await delay(500)

    addLog("success", "Transação SALVA pelo Silent Recovery!")
    await delay(300)

    addLog("code", "Registrando métricas", `analytics.track("transaction_saved", {
  originalAcquirer: "CIELO",
  finalAcquirer: "REDE",
  savedAmount: ${amount},
  recoveryTime: "2.3s"
})

// Incrementando KPI: Transações Salvas +1
// Valor recuperado: R$ ${amount}`)
    await delay(600)

    addLog("success", "Processamento concluído com sucesso!")

    setIsProcessing(false)
  }

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-[#008529]" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <ArrowRight className="h-4 w-4 text-yellow-500" />
      case "code":
        return <Terminal className="h-4 w-4 text-[#36103A]" />
      default:
        return <ArrowRight className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-[#008529]"
      case "error":
        return "text-red-500"
      case "warning":
        return "text-yellow-500"
      case "code":
        return "text-[#36103A]"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Demo do Roteador</h1>
          <p className="text-muted-foreground text-sm">
            Simule uma transacao e observe o fallback automatico
          </p>
        </div>

        {/* Card de Checkout */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-[#008529]" />
              Dados do Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="amount" className="text-xs">Valor da Compra</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <Input
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 h-9"
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="cardNumber" className="text-xs">Numero do Cartao</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="cardName" className="text-xs">Nome do Titular</Label>
              <Input
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                placeholder="NOME COMO NO CARTAO"
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="expiry" className="text-xs">Validade</Label>
                <Input
                  id="expiry"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/AA"
                  maxLength={5}
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cvv" className="text-xs">CVV</Label>
                <Input
                  id="cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  type="password"
                  className="h-9"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="flex-1 bg-[#008529] hover:bg-[#008529]/90 text-white h-9"
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Pagar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearLogs}
                  disabled={isProcessing}
                  className="h-9 w-9 p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Console de Logs */}
        <Card className="border-border bg-zinc-950 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#008529]" />
              <span className="text-sm font-medium text-foreground">Console do Roteador</span>
            </div>
            <div className="flex items-center gap-2">
              {isProcessing && (
                <Badge className="bg-[#008529]/10 text-[#008529] border-[#008529]/20 text-xs">
                  <div className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-[#008529]" />
                  Executando
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{logs.length} logs</span>
            </div>
          </div>
          <div 
            ref={consoleRef}
            className="h-64 overflow-y-auto p-4 font-mono"
          >
            {logs.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                Clique em &quot;Pagar&quot; para iniciar a demonstracao
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="group">
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">[{log.timestamp}]</span>
                      {getLogIcon(log.type)}
                      <span className={cn("flex-1 text-xs", getLogColor(log.type))}>
                        {log.message}
                      </span>
                    </div>
                    {log.code && (
                      <pre className="mt-2 ml-6 rounded bg-zinc-900 p-2 text-xs text-zinc-300 overflow-x-auto border border-zinc-800">
                        <code>{log.code}</code>
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
