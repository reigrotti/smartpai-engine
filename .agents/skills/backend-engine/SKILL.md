---
name: backend-engine
description: >-
  Use esta skill ao criar, modificar ou depurar qualquer arquivo de backend no
  projeto smartpai-engine (RoutIQ). Cobre os padrões obrigatórios de API Routes
  (Next.js App Router), tratamento de erros, autenticação multi-tenant,
  persistência com Prisma + pg.Pool, e o padrão Strategy de providers de
  adquirentes. Ative sempre que o trabalho envolver: app/api/**, lib/services/**,
  lib/providers/**, lib/prisma.ts ou prisma/schema.prisma.
---

# Backend Engine — Runbook de Padrões RoutIQ

Este documento descreve os padrões **obrigatórios** observados no backend do
`smartpai-engine`. Qualquer novo código deve seguir exatamente estes padrões
para manter consistência, segurança e SLA de throughput.

---

## 1. Estrutura e Convenções de API Routes

### 1.1 Localização e Nomenclatura

Todas as rotas residem em `app/api/<recurso>/route.ts` seguindo o **Next.js 14
App Router**. Cada arquivo exporta apenas os métodos HTTP que aquele recurso
suporta.

```
app/api/
├── pay/route.ts            → POST  (cobrança)
├── dashboard/route.ts      → GET   (analytics)
├── webhooks/pix/route.ts   → POST  (webhook externo)
├── seed/route.ts           → GET   (dev only — injeção de dados)
└── stress/route.ts         → GET   (dev only — benchmark)
```

### 1.2 Assinatura Padrão de uma Route Handler

```typescript
import { NextResponse, NextRequest } from 'next/server';

// Método HTTP como named export (GET | POST | PUT | PATCH | DELETE)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // ... lógica ...
    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error('[NOME_DA_ROTA ERROR]:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Regras:**
- Sempre use `NextResponse.json()` — nunca `Response` puro.
- Prefixe logs de erro com `[NOME_DA_ROTA ERROR]:` para facilitar rastreio no
  Cloud Run Logs.
- `req: Request` para `POST` simples; `req: NextRequest` quando precisar de
  `searchParams` (ex.: `GET` com query strings como em `/api/dashboard`).

### 1.3 Autenticação via Bearer Token

O endpoint `/api/pay` autentica o Merchant via cabeçalho HTTP:

```typescript
const authHeader = req.headers.get('authorization');
const secretKey  = authHeader?.replace('Bearer ', '');

if (!secretKey) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Regra:** A `secretKey` nunca é validada diretamente na Route — ela é passada
para `processPayment()`, que realiza a query no banco como **única fonte de
autenticação multi-tenant**. Isso garante isolamento de contexto por
`merchantId`.

### 1.4 Rotas de Desenvolvimento (Restrições)

| Rota | Função | Restrição |
|------|--------|-----------|
| `GET /api/seed` | Limpa o banco e injeta cenários homologados | Sem auth — remover em produção |
| `GET /api/stress` | 1.000 inserts concorrentes (batch 100) | Sem auth — remover em produção |

---

## 2. Tratamento de Erros

### 2.1 Estratégia por Camada

O projeto segue um modelo de **tratamento em camadas**, onde cada camada captura
o que é de sua responsabilidade e re-lança o resto:

```
Route Handler  →  try/catch → NextResponse 500 com error.message
     │
     ▼
paymentService →  try/catch por provider → re-lança erro com relatório completo
     │
     ▼
Provider       →  try/catch → retorna ProviderResponse (nunca lança para cima)
     │
     ▼
Service Legado →  try/catch → retorna { success: false, error: string }
```

### 2.2 Padrão de Resposta de Erro HTTP

```typescript
// CORRETO — mensagem de erro como string no campo "error"
return NextResponse.json({ error: error.message }, { status: 500 });

// CORRETO — erro de validação com campo específico
return NextResponse.json(
  { error: 'Payload incompleto. external_id e status mandatórios.' },
  { status: 400 }
);

// ERRADO — nunca expor stack trace ou objeto de erro completo
return NextResponse.json({ error: error }, { status: 500 });
```

### 2.3 Comportamento de Erro nos Providers

O padrão `isSoftDecline` controla o comportamento de falha na fila de providers:

```typescript
// Provider PRIMÁRIO: falha de rede/timeout → isSoftDecline: true (mantém failover)
catch (e: any) {
  return {
    success: false,
    error: e.message,
    providerName: this.name,
    isSoftDecline: true  // permite que o secundário assuma
  };
}

// Provider SECUNDÁRIO (Rede): qualquer falha → isSoftDecline: false (encerra a esteira)
catch (e: any) {
  return {
    success: false,
    error: e.message,
    providerName: this.name,
    isSoftDecline: false  // mata o loop, sem mais retentativas
  };
}
```

### 2.4 Hard Decline Guard no Orquestrador

```typescript
// Em paymentService.ts — nunca remover este guard
if (!response.isSoftDecline) {
  console.log(`[RoutIQ] Hard Decline detectado em ${provider.name}. Interrompendo.`);
  break; // encerra o loop de providers imediatamente
}
```

### 2.5 Idempotência no Webhook PIX

```typescript
// Verificação ANTES de qualquer update — padrão obrigatório
if (existingTransaction.status === 'SUCCESS' && status === 'PAID') {
  return NextResponse.json({ message: 'Already processed' }, { status: 200 });
}
```

---

## 3. Banco de Dados — Padrões Prisma

### 3.1 Instância Canônica (Singleton Obrigatório)

**Nunca** instancie `PrismaClient` diretamente fora de `lib/prisma.ts`.
Sempre importe:

```typescript
import { prisma } from '@/lib/prisma';
// ou (em arquivos fora do App Router):
import { prisma } from '../../lib/prisma';
```

O singleton usa `pg.Pool` via `@prisma/adapter-pg` para evitar esgotamento de
conexões no Cloud Run:

```typescript
// lib/prisma.ts — não modificar sem revisão de arquitetura
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = global.prisma || new PrismaClient({ adapter });
```

### 3.2 Campos JSONB — Regra de Ouro

Três campos do modelo `Transaction` são colunas `jsonb` nativas no PostgreSQL:

| Campo | Uso |
|-------|-----|
| `rawAcquirerResponse` | Resposta bruta do provider (Cielo/Rede) |
| `shopperData` | Dados do comprador |
| `riskData` | Score de risco da transação |

```typescript
// CORRETO — objeto JavaScript diretamente
await prisma.transaction.create({
  data: {
    rawAcquirerResponse: { success: true, providerName: 'Cielo' },
    shopperData: { name: 'João Silva' },
    riskData: { score: 15 }
  }
});

// PROIBIDO — JSON.stringify() explícito corrompe índices JSONB e queries nativas
rawAcquirerResponse: JSON.stringify({ success: true })
```

Exceção documentada: O webhook PIX em `app/api/webhooks/pix/route.ts`
usa `JSON.stringify()` para mesclar o payload com a resposta existente. Este
é o único caso aceito e deve permanecer isolado naquele arquivo.

### 3.3 Identificadores — Anti-Alucinação

| Campo | Quando usar |
|-------|-------------|
| `pspReference` | Chave de conciliação principal — sempre único por transação |
| `externalId` | Exclusivo para conciliação de Webhooks PIX |

```typescript
// CORRETO — pspReference vindo do provider ou gerado com prefixo + timestamp
pspReference: response.pspReference || `CIELO-${Date.now()}`

// PROIBIDO — IDs genéricos inventados sem prefixo identificador
pspReference: 'transaction_id_123'
```

### 3.4 Raw Queries com Datas e Agregações

Ao usar `prisma.$queryRaw` com colunas de data ou agregações numéricas:

```typescript
// CORRETO — snake_case físico + cast ::int (evita crash BigInt no Node.js)
const result: any[] = await prisma.$queryRaw`
  SELECT
    TO_CHAR("created_at", 'DD/MM') as date,
    COUNT(id)::int   as count_id,
    SUM(amount)::int as sum_amount
  FROM "transactions"
  WHERE "created_at" > CURRENT_DATE - INTERVAL '7 days'
  GROUP BY TO_CHAR("created_at", 'DD/MM')
`;

// ERRADO — sem cast gera BigInt → HTTP 500 na serialização JSON
COUNT(id) as count_id
```

### 3.5 Upsert de Merchant (Server Actions)

O padrão de upsert para Merchants usa `id` como campo `where`:

```typescript
// app/actions/merchant.ts
await prisma.merchant.upsert({
  where: { id: 'default-merchant' },
  update: { publicKey, secretKey },
  create: { id: 'default-merchant', name: 'Lojista Principal', publicKey, secretKey }
});
```

---

## 4. Padrão Strategy de Providers

### 4.1 Interface Obrigatória

Toda nova adquirente **deve** implementar `IProvider` definida em
`lib/providers/baseProvider.ts`:

```typescript
export interface IProvider {
  name: string;
  execute(
    amount: number,
    cardToken: string,
    merchantKeys: { publicKey: string; secretKey: string }
  ): Promise<ProviderResponse>;
}

export interface ProviderResponse {
  success: boolean;
  pspReference?: string;
  error?: string;
  providerName: string;
  isSoftDecline?: boolean; // obrigatório para Silent Recovery
}
```

### 4.2 Checklist para Novo Provider

Ao adicionar uma nova adquirente (ex.: Stone, PagSeguro):

1. Criar `lib/providers/<nome>Provider.ts` implementando `IProvider`
2. Criar `lib/services/<nome>.ts` com o HTTP client para o sandbox/produção
3. Atualizar `lib/services/paymentService.ts` com nova lógica de BIN na fila
4. Definir comportamento de `isSoftDecline` no catch do novo provider
5. Rodar `npx tsc --noEmit` — deve retornar zero erros

### 4.3 Regras de BIN Routing (Estado atual)

| 1º dígito do PAN | Provider Primário | Provider Secundário |
|---|---|---|
| `4` (Visa) | Cielo | Rede |
| Qualquer outro | Rede | Cielo |

### 4.4 Flag recoveredByRoutIQ

```typescript
// Calculado pelo índice na fila — nunca hardcoded
const isRecovered = index > 0; // 0 = primário; 1+ = failover

await prisma.transaction.create({
  data: { recoveredByRoutIQ: isRecovered, ... }
});
```

---

## 5. Multi-tenancy — Regras de Isolamento

Toda operação de banco que toca dados de transação **deve** validar `merchantId`
ou `secretKey` primeiro:

```typescript
// CORRETO — autenticação via secretKey antes de qualquer operação
const merchant = await prisma.merchant.findFirst({
  where: { secretKey: paymentRequest.secretKey }
});
if (!merchant) throw new Error('Merchant não autorizado.');

// A partir daqui, SEMPRE usar merchant.id para filtros
await prisma.transaction.create({
  data: { merchantId: merchant.id, ... }
});
```

Nunca fazer queries em `Transaction` sem filtro por `merchantId`. Vazamento
cross-tenant é falha crítica de zero tolerância.

---

## 6. Checklist de Validação Antes do Commit

```bash
# 1. Validação de tipos — BLOQUEANTE (zero erros obrigatório)
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Build de produção (valida bundling + prisma generate)
npm run build

# 4. Teste manual do fluxo principal
curl -X POST http://localhost:3000/api/pay \
  -H "Authorization: Bearer sk_live_routiq_001" \
  -H "Content-Type: application/json" \
  -d '{"amount": 15000, "cardNumber": "4111111111111111"}'

# 5. Teste de Silent Recovery (valor .99 aciona failover Cielo → Rede)
curl -X POST http://localhost:3000/api/pay \
  -H "Authorization: Bearer sk_live_routiq_001" \
  -H "Content-Type: application/json" \
  -d '{"amount": 25099, "cardNumber": "5555555555554444"}'

# 6. Diagnóstico direto do orquestrador (sem HTTP)
npx ts-node --project tsconfig.json tests/util/test-routing.ts
```

---

## 7. Referências Rápidas de Arquivos

| Arquivo | Responsabilidade |
|---------|-----------------|
| `lib/prisma.ts` | Singleton Prisma + pg.Pool |
| `lib/providers/baseProvider.ts` | Interface IProvider e ProviderResponse |
| `lib/providers/cieloProvider.ts` | Adaptador Cielo (implementa IProvider) |
| `lib/providers/redeProvider.ts` | Adaptador Rede (implementa IProvider) |
| `lib/services/paymentService.ts` | Orquestrador: BIN routing + failover + persistência |
| `lib/services/cielo.ts` | HTTP client para Cielo Sandbox |
| `lib/services/rede.ts` | HTTP client para Rede Sandbox |
| `app/api/pay/route.ts` | POST /api/pay — entrada principal de pagamentos |
| `app/api/dashboard/route.ts` | GET /api/dashboard — analytics e telemetria |
| `app/api/webhooks/pix/route.ts` | POST /api/webhooks/pix — notificações PIX |
| `app/actions/merchant.ts` | Server Action — upsert de chaves do Merchant |
| `prisma/schema.prisma` | Fonte de verdade dos modelos de dados |
