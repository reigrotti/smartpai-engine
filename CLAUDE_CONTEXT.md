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