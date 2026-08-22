# GEMINI.md — RoutIQ / smartpai-engine
> **Contexto de inicialização canônico para agentes de IA.**
> Leia este arquivo integralmente antes de qualquer modificação no código.
> Versão: 2.1.0 · Status: Production-Ready · Última atualização: 2026-08-17

---

## 1. Visão Geral do Projeto

**RoutIQ** é um **orquestrador e roteador inteligente de pagamentos multi-tenant**.
O motor roteia transações de cartão de crédito entre adquirentes (Cielo e Rede) em tempo real, com **failover automático e silencioso** baseado no BIN do cartão, e persiste o histórico completo em PostgreSQL gerenciado no GCP.

| Campo | Valor |
|---|---|
| **Nome interno** | `smartpai-engine` |
| **Produto** | RoutIQ — Financial Orchestrator & Smart Routing Engine |
| **Stack principal** | Next.js 14 (App Router) · TypeScript 5 · Prisma 7.8.0 · PostgreSQL |
| **Runtime de produção** | Google Cloud Run (`southamerica-east1`) |
| **Banco de dados** | Google Cloud SQL — instância `smartpai-db-instance` (projeto `plinia-core-dev`) |
| **SLA de throughput** | ≥ 400 ops/seg (validado em 465.77 ops/seg com 1.000 tx concorrentes) |

---

## 2. Arquitetura do Sistema

### 2.1 Camadas

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND / DASHBOARD                                        │
│  Next.js 14 App Router · Recharts · Tailwind CSS            │
│  app/dashboard/page.tsx · app/checkout/ · app/transactions/ │
└───────────────────┬─────────────────────────────────────────┘
                    │ Server Actions / Secure API Endpoints
┌───────────────────▼─────────────────────────────────────────┐
│  BACKEND / ORQUESTRADOR                                      │
│  Next.js App Router API Routes                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ paymentService.ts  ←  Núcleo do RoutIQ               │    │
│  │   ├── CieloProvider  →  CieloService (Sandbox API)  │    │
│  │   └── RedeProvider   →  RedeService  (Sandbox API)  │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────┬─────────────────────────────────────────┘
                    │ @prisma/adapter-pg + pg.Pool
┌───────────────────▼─────────────────────────────────────────┐
│  DATA LAYER                                                  │
│  Prisma 7.8.0 · PostgreSQL · Google Cloud SQL               │
│  Modelos: Merchant · Transaction · CardOnFile                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Estrutura de Diretórios

```
smartpai-engine/
├── app/
│   ├── api/
│   │   ├── pay/route.ts              # POST — endpoint de cobrança principal
│   │   ├── dashboard/route.ts        # GET  — analytics e telemetria
│   │   ├── webhooks/pix/route.ts     # POST — recepção de notificações PIX
│   │   ├── seed/route.ts             # GET  — injeta massa de dados (dev)
│   │   └── stress/route.ts           # GET  — teste de carga (1.000 tx / batch 100)
│   ├── actions/
│   │   └── merchant.ts               # Server Action — upsert de chaves do Merchant
│   ├── checkout/                      # UI de checkout
│   ├── dashboard/page.tsx             # Dashboard analítico principal
│   ├── performance/                   # Métricas de performance
│   ├── settings/                      # Configurações do merchant
│   ├── transactions/                  # Listagem de transações
│   └── layout.tsx / page.tsx
│
├── lib/
│   ├── prisma.ts                      # Singleton PrismaClient + adapter-pg
│   ├── providers/
│   │   ├── baseProvider.ts            # Interface IProvider + tipo ProviderResponse
│   │   ├── cieloProvider.ts           # Adaptador Cielo (implementa IProvider)
│   │   └── redeProvider.ts            # Adaptador Rede (implementa IProvider)
│   └── services/
│       ├── paymentService.ts          # Orquestrador: BIN routing + failover + persistência
│       ├── cielo.ts                   # Serviço legado — HTTP direto ao Sandbox Cielo
│       └── rede.ts                    # Serviço legado — HTTP direto ao Sandbox Rede
│
├── prisma/
│   ├── schema.prisma                  # Fonte de verdade dos modelos de dados
│   └── migrations/                    # Histórico de migrações DDL
│
├── tests/
│   └── util/test-routing.ts           # Utilitário de teste do roteamento
│
├── docs/
│   ├── MASTER_ARCH_PLAN.md            # Plano diretor de arquitetura (referência)
│   └── prompt-agente.txt              # Contexto de inicialização legado
│
├── plinia-engine-template.yaml        # Manifesto Cloud Run (Knative) — produção
├── cloud-sql-proxy                    # Binário do Cloud SQL Auth Proxy (uso local)
├── seed-merchants.ts                  # Script ts-node para seed de merchants
├── .cursorrules                       # Regras de coding para IDEs com IA
├── .env / .env.local                  # Variáveis de ambiente locais
└── GEMINI.md                          # ← Este arquivo (contexto canônico para IA)
```

### 2.3 Fluxo de Processamento de Pagamento

```
POST /api/pay
  │
  ├─ [1] Autentica Merchant via secretKey (multi-tenancy)
  ├─ [2] Lê BIN do cartão (1º dígito)
  │       ├── BIN '4' (Visa)  → primária: Cielo → fallback: Rede
  │       └── BIN outro       → primária: Rede  → fallback: Cielo
  ├─ [3] Executa provider primário
  │       ├── SUCESSO → persiste Transaction (recoveredByRoutIQ: false) → retorna
  │       └── FALHA
  │           ├── isSoftDecline: true  → aciona provider secundário (Silent Recovery)
  │           └── isSoftDecline: false → interrompe a fila (Hard Decline Guard)
  ├─ [4] Executa provider secundário (se Soft Decline)
  │       ├── SUCESSO → persiste Transaction (recoveredByRoutIQ: true) → retorna
  │       └── FALHA   → lança erro com relatório completo
  └─ Persistência: prisma.transaction.create() com rawAcquirerResponse JSONB nativo
```

### 2.4 Modelos de Dados (Prisma Schema)

```prisma
model Merchant {
  id          String        @id @default(uuid())
  name        String
  publicKey   String        @unique  // Identifica o merchant nas requisições
  secretKey   String        @unique  // Autenticação via Bearer token
  status      String        @default("ACTIVE")
  transactions Transaction[]
  cardsOnFile  CardOnFile[]
}

model Transaction {
  id                  String    @id @default(uuid())
  pspReference        String    @unique  // Chave primária de conciliação — NUNCA inventar
  merchantId          String              // Isolamento multi-tenant obrigatório
  amount              Int                 // Em centavos (BRL)
  acquirer            String?             // 'Cielo' | 'Rede' | 'Stone'
  status              String    @default("PENDING")  // AUTHORIZED | DECLINED | SUCCESS | FAILED
  recoveredByRoutIQ   Boolean   @default(false)       // Flag de Silent Recovery
  externalId          String?   @unique  // Exclusivo para conciliação de Webhooks PIX
  rawAcquirerResponse Json?               // JSONB nativo — não usar JSON.stringify()
  shopperData         Json?               // JSONB nativo — não usar JSON.stringify()
  riskData            Json?               // JSONB nativo — não usar JSON.stringify()
}

model CardOnFile {
  id         String   @id @default(uuid())
  merchantId String
  vgsToken   String   @unique  // Token VGS — NUNCA armazenar PAN bruto
  bin        String?
  lastFour   String?
}
```

---

## 3. Integrações com GCP

| Serviço | Função | Ponto de contato no código |
|---|---|---|
| **Cloud Run** | Runtime serverless Next.js. Região: `southamerica-east1`. Autoscaling: 0–3 instâncias, concorrência 80, CPU 1 core, RAM 512Mi | `plinia-engine-template.yaml` |
| **Cloud SQL (PostgreSQL)** | Banco principal (`smartpai-db-instance`). Conectado via annotation `run.googleapis.com/cloudsql-instances` em produção | `plinia-engine-template.yaml` L37, `lib/prisma.ts` |
| **Cloud SQL Auth Proxy** | Túnel local para desenvolvimento (`cloud-sql-proxy` na raiz do projeto) | `cloud-sql-proxy` (binário), `.env` aponta para `127.0.0.1:5432` |
| **`@google-cloud/cloud-sql-connector`** | Pacote NPM para conexão programática ao Cloud SQL sem binário proxy | `package.json` |
| **`@google-cloud/functions-framework`** | Canal de deploy alternativo via Cloud Functions | `package.json` |
| **Artifact Registry** | Armazena a imagem Docker (`southamerica-east1-docker.pkg.dev/plinia-core-dev/cloud-run-source-deploy/smartpai-engine`) | `plinia-engine-template.yaml` L8 |
| **Cloud Storage (GCS)** | Fonte do build para Cloud Run Source Deploy (`gs://run-sources-plinia-core-dev-southamerica-east1/...`) | `plinia-engine-template.yaml` L10 |
| **IAM / Service Account** | `728639463419-compute@developer.gserviceaccount.com` executa o container | `plinia-engine-template.yaml` L62 |

### Configuração de Conexão ao Banco (Obrigatória)

```typescript
// lib/prisma.ts — padrão canônico, NUNCA criar PrismaClient fora deste módulo
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = global.prisma || new PrismaClient({ adapter });
// Singleton para evitar pool exhaustion em ambiente serverless
```

> **Regra absoluta:** O `@prisma/adapter-pg` + `pg.Pool` são **obrigatórios** em todo ambiente (dev e produção). Instâncias diretas de `PrismaClient` sem adapter são proibidas — causam esgotamento de conexões no Cloud Run.

---

## 4. Comandos de Desenvolvimento

### Setup inicial

```bash
# Instalar dependências (gera automaticamente o Prisma Client via postinstall)
npm install

# Gerar o Prisma Client manualmente
npx prisma generate

# Configurar variáveis de ambiente
cp .env.local .env
# Editar DATABASE_URL com a connection string correta
```

### Desenvolvimento local

```bash
# Iniciar o servidor de desenvolvimento Next.js
npm run dev
# App disponível em http://localhost:3000

# Iniciar o túnel Cloud SQL Auth Proxy (execute em terminal separado antes do npm run dev)
./cloud-sql-proxy plinia-core-dev:southamerica-east1:smartpai-db-instance --port 5432
```

### Banco de dados

```bash
# Criar e aplicar uma nova migração
npx prisma migrate dev --name <nome_da_migracao>

# Aplicar migrações em produção (sem criar nova migração)
npx prisma migrate deploy

# Abrir o Prisma Studio (UI visual do banco)
npx prisma studio

# Seed de Merchant de teste via ts-node
npx ts-node --project tsconfig.json seed-merchants.ts
```

### Qualidade e build

```bash
# Validação de tipos TypeScript — OBRIGATÓRIO antes de qualquer commit ou deploy
npx tsc --noEmit
# Deve retornar zero erros. Qualquer erro de tipo bloqueia o deploy.

# Build de produção (também executa prisma generate)
npm run build

# Lint
npm run lint
```

### Endpoints de desenvolvimento (não expor em produção)

```bash
# Seed: Limpa o banco e injeta cenários de teste homologados (Silent Recovery + Hard Decline)
GET http://localhost:3000/api/seed

# Stress test: Insere 1.000 transações em batches de 100 e mede throughput
GET http://localhost:3000/api/stress

# Exemplo de pagamento via cURL
curl -X POST http://localhost:3000/api/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_live_routiq_001" \
  -d '{"amount": 15000, "cardNumber": "4111111111111111"}'

# Simular Soft Decline (aciona Silent Recovery, roteamento Cielo → Rede)
curl -X POST http://localhost:3000/api/pay \
  -H "Authorization: Bearer sk_live_routiq_001" \
  -H "Content-Type: application/json" \
  -d '{"amount": 25099, "cardNumber": "5555555555554444"}'
```

---

## 5. Padrões de Código e Regras Obrigatórias

### 5.1 Banco de Dados

| Regra | Detalhe |
|---|---|
| **Adapter obrigatório** | Sempre usar `import { prisma } from '@/lib/prisma'`. Nunca instanciar `PrismaClient` diretamente fora de `lib/prisma.ts`. |
| **JSONB nativo** | Campos `rawAcquirerResponse`, `shopperData` e `riskData` são colunas `jsonb` nativas. Passar objetos JavaScript diretamente nas mutations Prisma. `JSON.stringify()` explícito é **proibido** — corrompe queries nativas. |
| **Identificadores** | Nunca inventar IDs genéricos. Use estritamente `pspReference` como chave de conciliação principal e `externalId` exclusivamente para conciliação de Webhooks PIX. |
| **Raw queries com datas** | Ao usar `prisma.$queryRaw` com agregações em `created_at`, referenciar a coluna física `snake_case` (`"created_at"`) e aplicar cast explícito `::int` em `SUM()` / `COUNT()` para evitar crashes de serialização BigInt do Node.js. |

```typescript
// ✅ CORRETO — JSONB nativo
await prisma.transaction.create({
  data: {
    rawAcquirerResponse: { success: true, providerName: 'Cielo' },
    shopperData: { name: 'João Silva' },
    riskData: { score: 15 }
  }
});

// ❌ PROIBIDO — JSON.stringify() explícito
await prisma.transaction.create({
  data: {
    rawAcquirerResponse: JSON.stringify({ success: true }) // QUEBRA índices JSONB
  }
});
```

### 5.2 Roteamento e Orquestração

| Regra | Detalhe |
|---|---|
| **Multi-tenancy** | Toda operação deve validar escopo por `merchantId` ou `secretKey` autenticado. Vazamento cross-tenant é falha crítica de zero tolerância. |
| **BIN routing** | Primeiro dígito do PAN: `4` = Visa → Cielo como primária. Qualquer outro → Rede como primária. |
| **Soft Decline trigger** | Valores com centavos `99` (ex: `R$ 250,99 = 25099`) acionam Soft Decline na Cielo por convenção de sandbox/demo. `isSoftDecline: true` **deve** ser propagado para acionar o failover. |
| **Hard Decline Guard** | Se `isSoftDecline === false`, o loop de providers é encerrado imediatamente via `break`. Nenhuma retentativa adicional é permitida (anti-card-washing, economia de custo de API). |
| **Silent Recovery flag** | Se a transação foi aprovada pelo provider de índice > 0 na fila, `recoveredByRoutIQ: true` deve ser persistido. |

### 5.3 API Routes

| Regra | Detalhe |
|---|---|
| **Autenticação** | Endpoint `/api/pay` usa `Authorization: Bearer <secretKey>`. Extrair com `req.headers.get('authorization')?.replace('Bearer ', '')`. |
| **Idempotência PIX** | Webhook PIX valida existência da transação por `externalId` antes de qualquer update. Se `status === 'SUCCESS'` e payload diz `'PAID'`, retornar HTTP 200 sem reprocessar. |
| **Frontend nunca chama adquirentes** | Processadores externos (Cielo, Rede) só são acessados a partir de `lib/services/`. O frontend consome apenas endpoints internos (`/api/*`) ou Server Actions. |
| **Sem exposição de credenciais** | Chaves de adquirentes (`MerchantId`, `MerchantKey`, tokens) nunca devem ser enviadas ao client bundle. |

### 5.4 TypeScript

```typescript
// Configuração do tsconfig.json (strict mode ativo)
{
  "strict": true,          // Modo estrito obrigatório
  "noEmit": true,          // Build apenas via Next.js, não tsc direto
  "target": "es2022",
  "paths": { "@/*": ["./*"] }  // Alias de import canônico
}

// Regra de validação: npx tsc --noEmit deve retornar zero erros antes de qualquer commit.
```

### 5.5 Padrão de Providers (Strategy Pattern)

Toda nova adquirente deve implementar a interface `IProvider`:

```typescript
// lib/providers/baseProvider.ts
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
  isSoftDecline?: boolean; // Gatilho obrigatório para Silent Recovery
}
```

- Erros de rede/timeout no provider **primário** → retornar `isSoftDecline: true` (mantém failover ativo)
- Erros de rede/timeout no provider **secundário** → retornar `isSoftDecline: false` (encerra a esteira)

---

## 6. Segurança e Compliance

| Área | Regra |
|---|---|
| **Zero PCI Scope** | Números de cartão abertos (PANs), CVVs e senhas **nunca** devem tocar logs, banco de dados ou variáveis de ambiente. |
| **Tokenização** | Dados de cartão devem trafegar via proxy VGS (Very Good Security). O campo `vgsToken` em `CardOnFile` armazena o token — nunca o PAN bruto. ⚠️ *Integração VGS ainda pendente de implementação.* |
| **Variáveis de ambiente** | Credenciais de adquirentes e `DATABASE_URL` residem exclusivamente em `.env` / variáveis de ambiente do Cloud Run. Nunca commitar valores reais. |
| **Logs de auditoria** | Todo webhook PIX deve logar `external_id` e `status` recebidos antes de qualquer processamento. |

---

## 7. Telemetria e Benchmarks de Produção

| Métrica | Valor validado |
|---|---|
| **Throughput de escrita** | 465.77 ops/seg (1.000 transações em 2.147s, batches de 100) |
| **SLA mínimo** | 400 ops/seg — regressões abaixo disso violam o SLA de produção |
| **Infraestrutura alvo** | Google Cloud SQL (PostgreSQL) via Cloud SQL Auth Proxy |
| **Endpoint de benchmark** | `GET /api/stress` — executa 1.000 inserts concorrentes e retorna métricas |

---

## 8. Pontos de Atenção Abertos

> **[PENDENTE]** Integração VGS não implementada no código. O PAN ainda trafega diretamente entre cliente e API. Necessário implementar proxy VGS antes de qualquer operação com dados reais de cartão.

> **[PENDENTE]** `lib/services/cielo.ts` e `lib/services/rede.ts` são wrappers diretos sem circuit breaker ou retry com backoff exponencial. Candidatos a refatoração nas próximas sprints.

> **[PENDENTE]** Validação de merchant via cabeçalho HTTP + cache (latência sub-2ms). Atualmente realiza query ao banco a cada requisição.

> **[DEMO ONLY]** `GET /api/dashboard?merchant=DEMO_STORE` aplica multiplicadores de escala (3.2x aprovado, 0.25x recusado) — feature exclusiva de apresentação, nunca expor em produção.

> **[ATENÇÃO]** Endpoints `/api/seed` e `/api/stress` devem ser protegidos ou removidos antes de qualquer exposição pública. Atualmente sem autenticação.
