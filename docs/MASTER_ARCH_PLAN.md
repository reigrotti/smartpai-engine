# RoutIQ - Plano Diretor de Arquitetura (Master Arch Plan)
Version: 2.0.0 (Pitch-Ready)
Status: Approved & Homologated

## 1. Visão Executiva do Negócio
O RoutIQ é um orquestrador e roteador inteligente de pagamentos multitenant focado em otimização de margem e resiliência transacional pura. O core business do motor baseia-se em reduzir o custo de processamento por transação do lojista e capturar receitas que seriam perdidas por instabilidades nas adquirentes locais.

## 2. Camadas do Ecossistema e Fluxo de Dados
O motor opera de forma desacoplada em três grandes pilares, garantindo isolamento total de contexto:

[ Frontend / Dashboard ]  -> Next.js 14 + Redux Toolkit + Recharts
          |
          v (Server Actions / APIs Seguras)
[ Backend / Orchestrator ] -> Next.js App Router + paymentService.ts
          |
          v (Driver Adapter / Pool de Conexões Node-PG)
[ Banco / Data Layer ]    -> Cloud SQL (PostgreSQL) via Cloud SQL Proxy

### A. Política Estrita de Roteamento (Smart Routing)
- **Silent Recovery:** Transações com decimais exatos em `.99` (ex: R$ 250,99) simulam cenários de teste de estresse de Soft Decline na Cielo. O motor intercepta a falha silenciosamente e faz o failover imediato para a Rede, salvando a conversão do carrinho sem que o cliente final perceba.
- **Trava de Hard Decline:** Se uma adquirente responder com erro estrito de cartão (fraude confirmada, cartão bloqueado ou saldo insuficiente), o parâmetro `isSoftDecline` avaliado será `false`. O loop de retentativas é quebrado imediatamente para mitigar ataques de card-washing e economizar custos de API do lojista.

### B. Governança de Infraestrutura e Banco de Dados (DB Layer)
- **Driver Adapters:** Devido às restrições de concorrência em ambientes serverless (Google Cloud Run), o Prisma 7.8.0 é proibido de gerenciar conexões TCP cruas. É mandatório o uso do `@prisma/adapter-pg` acoplado ao pool de conexões estável do driver `pg.Pool`.
- **Integridade de Identificadores (Anti-Alucinação):** Identificadores genéricos gerados em runtime estão banidos. O motor valida o estado físico das transações usando estritamente a chave de índice `pspReference` ou `externalId` (exclusivo para conciliação de Webhooks do PIX).

## 3. Matriz de Segurança e Compliance (Zero PCI Scope)
O RoutIQ não armazena, processa ou trafega números de cartão de crédito abertos (PANs), códigos de segurança (CVVs) ou senhas. Toda a comunicação outbound passa pelo proxy reverso do VGS (Very Good Security), operando sob isolamento criptográfico rígido. Chaves privadas e tokens de sandbox (Cielo e Rede) residem estritamente criptografados em variáveis de ambiente (`.env`).

## 4. Webhook Resiliente (Idempotência Pura)
Para liquidações instantâneas via PIX, o endpoint `/api/webhooks/pix` opera com checagem de conciliação prévia baseada no `external_id` enviado pelo gateway parceiro. Se o status da transação no banco já constar como `SUCCESS` ou `AUTHORIZED`, o payload duplicado é rejeitado com sucesso (HTTP 200 - Idempotency Lock), neutralizando falhas de Double Spending.
