# SmartPai Engine — Contexto de Handover
Atualizado: 2026-05-07

## Projeto
Orquestrador financeiro multi-adquirente (Rede/Cielo) com contingência automática.
Repositório: https://github.com/reigrotti/smartpai-engine

## Stack
Next.js 14, Node 22, Prisma 7.7.0, PostgreSQL 15, Cloud SQL (GCP), VGS, ChromeOS Penguin + VS Code

## Infraestrutura GCP
- Projeto: smartpai-serverless-mvp
- Instância Cloud SQL: smartpai-serverless-mvp:southamerica-east1:smartpai-db-instance
- IP público: 35.199.100.217
- Banco: postgres / usuário: postgres / senha: test123

## VGS (Very Good Security)
- Vault ID: tntjjh2tydt (Sandbox)
- Vault URL: tntjjh2tydt.sandbox.verygoodproxy.com
- Rota inbound: routiq-inbound (ID: ef973212-4d3b-4fbb-8bab-1878d4d9647b)
- Upstream: https://onset-crushable-handprint.ngrok-free.dev
- Operações: Redact $.card_number e $.card_cvc no body
- Intercept CORS: ATIVADO
- Status: FUNCIONANDO ✅

## Ambiente de desenvolvimento
- Máquina: ChromeOS Linux (penguin)
- Editor: VS Code com extensões (ESLint, Prettier, Prisma, Tailwind)
- Pasta: ~/smartpai-engine
- Node v22, gcloud SDK, git instalados
- Chave SSH configurada no GitHub
- Ctrl+V configurado no terminal do VS Code

## Como subir o ambiente (3 abas no terminal do VS Code)
Aba 1 — Proxy Cloud SQL:
~/cloud-sql-proxy --port 5432 smartpai-serverless-mvp:southamerica-east1:smartpai-db-instance

Aba 2 — Servidor:
cd ~/smartpai-engine && npm run dev

Aba 3 — Ngrok:
ngrok http 3000 --domain=onset-crushable-handprint.ngrok-free.dev

## Dados de teste no banco
- id: test-merchant-001
- name: RoutIQ MVP
- publicKey: pub_test
- secretKey: test1234

## Status das Sprints
✅ Sprint 1: Infraestrutura (Cloud SQL, Prisma, API /pay autenticando)
✅ Sprint 2: VGS Collect integrado, checkout PCI compliant funcionando
✅ Sprint 2b: Portal Analytics com Recharts, dark mode, sidebar, failover Cielo→Rede
✅ Sprint 3: Telas Transactions e Performance, navegação com Next/Link
⏳ Próximo: Webhooks PIX + Deploy Cloud Run

## Próximos passos
1. Webhook PIX em app/api/webhooks/pix/route.ts
2. Deploy Cloud Run:
   gcloud run deploy smartpai \
     --source . \
     --region southamerica-east1 \
     --add-cloudsql-instances smartpai-serverless-mvp:southamerica-east1:smartpai-db-instance \
     --set-env-vars DATABASE_URL="..." \
     --allow-unauthenticated

## Workflow de desenvolvimento
- Editar código: VS Code (nunca nano ou heredoc)
- Terminal: integrado no VS Code (Ctrl+`)
- Git: terminal ou painel Source Control

## Problemas resolvidos
- P1000 intermitente: pool de conexões zumbi no Cloud Shell
- Cloud Shell substituído pelo ChromeOS penguin + VS Code
- Dois projetos sobrepostos na mesma pasta
- Prisma 7: URL deve ficar em prisma.config.ts, não no schema.prisma
- VGS CORS: Intercept CORS ativado em Vault Settings → Advanced
- VGS tokenize() substituído por submit()
- EOF corrompeu checkout/page.tsx: corrigido via nano
- prisma.config.ts e .env.local adicionados ao .gitignore
## Mudança de ambiente (importante)
- Antes: código editado via nano/heredoc no terminal ou editor do Cloud Shell
- Agora: VS Code instalado no penguin como editor principal
- Motivo: nano e heredoc causavam corrupção de arquivos (EOF, paste mode)
- VS Code abre com: code ~/smartpai-engine
- Ctrl+V funciona no terminal do VS Code (configurado manualmente)
- Todo código deve ser editado no VS Code, nunca no terminal
## 🚀 STATUS: MVP EM PRODUÇÃO
- **Cloud Run URL:** https://smartpai-engine-728639463419.southamerica-east1.run.app
- **Checkout:** https://smartpai-engine-728639463419.southamerica-east1.run.app/checkout
- **Deploy:** Cloud Run (southamerica-east1) com Cloud SQL via Unix Socket
- **Data:** 2026-05-07
- **Senha DB correta:** test123 (não test1234 — erro histórico do Gemini)

## ✅ O que está funcionando em produção
- Checkout PCI compliant via VGS Collect
- Tokenização de cartão (Vault: tntjjh2tydt)
- Autenticação por merchant via Bearer token
- Processamento via Cielo com fallback para Rede
- Cloud SQL via Unix socket (sem proxy)
- Portal Analytics, Transações e Performance
- VGS rota inbound apontando para Cloud Run (não mais ngrok)

## ⚠️ Atenção para próximas sessões
- A senha do banco é **test123** — o Gemini às vezes usa test1234 (errado)
- O ambiente local (penguin) ainda usa proxy para dev
- Nunca editar código via nano ou heredoc — usar VS Code
- prisma.config.ts tem a senha e NÃO vai para o GitHub
# SmartPai Engine — Contexto de Handover (Pós-Sprint 3)
Data: 2026-05-07 | Status: Produção Estabilizada ✅

## 🚀 Status da Infraestrutura
- **Cloud Run URL:** https://smartpai-engine-728639463419.southamerica-east1.run.app
- **Conector Cloud SQL:** Unix Socket (Instância: smartpai-db-instance)
- **Persistência:** API `/api/pay` agora persiste o `externalId` (ID do Provedor) corretamente.

## ✅ Sprint 3: Entregas Realizadas
- **Webhooks PIX:** Endpoint `/api/webhooks/pix` operacional com lógica de idempotência e busca segura via `findUnique`.
- **Integridade de Dados:** Resolvido o bug de campos NULL no banco de dados.
- **Ambiente de Build:** `tsconfig.json` e `package.json` sanitizados para deploy contínuo via Buildpacks.

## 🛠️ Notas Técnicas para o Daniel
1. **Webhook:** O sistema retorna `404` para IDs inexistentes e `200 (Already processed)` para duplicatas, evitando loops de processamento.
2. **Logs:** Monitoramento via `gcloud run services logs read`.
3. **Prisma:** Sempre rodar `prisma generate` no build (já configurado no `package.json`).

## ⏳ Próximos Passos (Sprint 4)
1. Webhooks reais para notificações de adquirentes (Cielo/Rede).
2. Interface de gestão de Merchant no Portal.
3. Configuração de domínios customizados.