---
name: payment-qa-benchmarks
description: >-
  Use esta skill ao planejar, executar ou depurar testes de roteamento, cenários
  de simulação transacional (Silent Recovery, Soft Decline, Hard Decline),
  injeção de massa de dados e benchmarks de concorrência/stress no RoutIQ.
  Ative sempre que o trabalho envolver: tests/**, app/api/stress/**,
  app/api/seed/**, seed-merchants.ts ou validação de throughput e conformidade
  transacional.
---

# Payment QA & Benchmarks — Runbook de Testes e Simulações RoutIQ

Este documento define a esteira de testes, cenários de simulação homologados,
procedimentos de injeção de massa e benchmarks de throughput para o **RoutIQ**
(`smartpai-engine`).

---

## 1. Matriz de Cenários Transacionais Homologados

O orquestrador RoutIQ é validado com quatro cenários de teste canônicos:

| ID | Cenário | Condição de Entrada | Comportamento Esperado | Flag de Auditoria |
|---|---|---|---|---|
| **C1** | **Sucesso Orgânico** | BIN `4` (Visa), valor padrão (ex: R$ 150,00 / `15000`) | Aprovado direto pela Cielo (Rota Primária). | `recoveredByRoutIQ: false`, `acquirer: 'Cielo'` |
| **C2** | **Silent Recovery** | Valor com centavos `.99` (ex: R$ 250,99 / `25099`) | Soft Decline forçado na Cielo ➔ Failover silencioso para a Rede ➔ Autorizado com sucesso. | `recoveredByRoutIQ: true`, `acquirer: 'Rede'` |
| **C3** | **Hard Decline Guard** | Erro estrito de cartão / Fraude (`isSoftDecline: false`) | Interrompe o loop imediatamente na primária sem tentar a adquirente secundária. | `status: 'DECLINED'`, `recoveredByRoutIQ: false` |
| **C4** | **PIX Idempotency** | Webhook duplicado com `external_id` já pago | Responde HTTP 200 (`Already processed`) sem duplicar saldo ou alterar estado. | `status: 'SUCCESS'`, lock de idempotência ativo |

---

## 2. Testes de Diagnóstico via CLI (Sem Camada HTTP)

O utilitário `tests/util/test-routing.ts` permite testar o orquestrador e a
comunicação com os provedores diretamente pelo terminal, sem depender de
servidor HTTP ativo.

### 2.1 Como Executar o Diagnóstico

```bash
# Execução direta via ts-node com resolução de aliases
npx ts-node --project tsconfig.json tests/util/test-routing.ts
```

### 2.2 Estrutura do Teste de Roteamento

```typescript
// tests/util/test-routing.ts
import { processPayment } from '../../lib/services/paymentService';
import { prisma } from '../../lib/prisma';

async function runDiagnostic() {
  // 1. Garante que o Merchant de teste existe
  const merchant = await prisma.merchant.upsert({
    where: { publicKey: 'pk_test_cielo' },
    update: {},
    create: {
      name: 'Loja Diagnóstico',
      publicKey: 'pk_test_cielo',
      secretKey: 'sk_test_routiq_123',
    }
  });

  // 2. Dispara transação de teste
  const payload = {
    secretKey: 'sk_test_routiq_123',
    amount: 50000,
    cardNumber: '4111111111111111', // BIN 4 (Cielo)
    customerName: 'Diagnóstico QA'
  };

  const result = await processPayment(payload);
  console.log('Adquirente Final:', result.acquirer);
  console.log('Recuperado pela RoutIQ?', result.recoveredByRoutIQ);
}
```

---

## 3. Injeção e Reset de Massa de Dados (Seeds)

### 3.1 Script de Seed de Merchants

Cria o Merchant de homologação no Cloud SQL:

```bash
npx ts-node --project tsconfig.json seed-merchants.ts
```

* **Merchant gerado:** `Active Solutions Test` (`id: test-merchant-001`)
* **Public Key:** `pk_live_routiq_001`
* **Secret Key:** `sk_live_routiq_001`

### 3.2 Endpoint de Seed do Pitch (`GET /api/seed`)

Limpa todas as transações de teste e injeta os 3 cenários canônicos (Sucesso
Orgânico, Silent Recovery e Fraude Barrada) com colunas JSONB nativas:

```bash
# Execução local via cURL
curl -X GET http://localhost:3000/api/seed
```

> **Atenção:** Este endpoint realiza `deleteMany({})`. Deve ser mantido
> desabilitado ou restrito a ambientes de desenvolvimento.

---

## 4. Testes de Carga e Benchmark de Concorrência (`/api/stress`)

O endpoint `/api/stress` valida a capacidade de escrita de alta concorrência do
motor contra o Google Cloud SQL.

### 4.1 Parâmetros do Benchmark

* **Volume Total:** 1.000 transações inseridas em batches paralelos de 100
  (`Promise.all`).
* **Variação:** Distribuição randômica de adquirentes (`Cielo`, `Rede`, `Stone`),
  bandeiras (`Visa`, `Mastercard`, `Amex`, `Elo`) e status.
* **SLA de Produção:** **≥ 400 operações por segundo** (tempo total de execução
  < 2.5 segundos).

### 4.2 Como Executar o Teste de Carga

```bash
# Teste contra ambiente local (com Cloud SQL Auth Proxy ativo)
curl -s http://localhost:3000/api/stress | jq .

# Teste contra o runtime de produção no Cloud Run
curl -s "https://smartpai-engine-728639463419.southamerica-east1.run.app/api/stress" | jq .
```

### 4.3 Formato Esperado da Resposta de Telemetria

```json
{
  "success": true,
  "metrics": {
    "totalInserted": 1000,
    "durationSeconds": 2.147,
    "throughputPerSecond": 465.77,
    "databaseProvider": "PostgreSQL (Cloud SQL)"
  }
}
```

### 4.4 Diagnóstico de Degradação de Throughput

Se o benchmark retornar `< 400 ops/seg`:
1. **Conexões do Pool:** Verifique se `lib/prisma.ts` está usando o singleton com
   `PrismaPg(pool)`.
2. **Latência de Túnel:** Se estiver rodando local, o `cloud-sql-proxy` adiciona
   RTT de rede. A medição oficial do SLA deve ser realizada dentro do Cloud Run
   (mesma VPC/Região `southamerica-east1`).
3. **Serialização BigInt:** Verifique se as queries raw utilizam cast explícito
   `::int`.

---

## 5. Simulação de Pagamentos via API REST (`/api/pay`)

### 5.1 Teste de Sucesso Direto (Visa ➔ Cielo)

```bash
curl -X POST http://localhost:3000/api/pay \
  -H "Authorization: Bearer sk_live_routiq_001" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 15000,
    "cardNumber": "4111111111111111",
    "customerName": "Reinaldo Teste Direto"
  }'
```

### 5.2 Teste de Silent Recovery (Valor `.99` ➔ Failover para Rede)

```bash
curl -X POST http://localhost:3000/api/pay \
  -H "Authorization: Bearer sk_live_routiq_001" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25099,
    "cardNumber": "5555555555554444",
    "customerName": "Caroline Teste Recovery"
  }'
```

---

## 6. Checklist de Homologação Pré-Demo / Pré-Release

Execute este checklist em sequência antes de qualquer pitch, demonstração ou
deploy de release:

1. [ ] **Verificar Banco:** Confirmar que o túnel Cloud SQL Proxy está
       respondendo na porta `5432`.
2. [ ] **Validar Tipos:** `npx tsc --noEmit` retornando zero erros.
3. [ ] **Reset de Massa:** Executar `GET /api/seed` para carregar transações
       limpas.
4. [ ] **Testar Roteamento:** Rodar `npx ts-node --project tsconfig.json tests/util/test-routing.ts`.
5. [ ] **Disparar Stress Test:** Executar `GET /api/stress` e confirmar
       throughput ≥ 400 ops/seg.
6. [ ] **Validar Frontend:** Acessar `/dashboard` e confirmar sincronização em
       tempo real (polling 5s) sem erros no console.
