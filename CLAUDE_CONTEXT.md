# SmartPai Engine — Contexto de Handover

## Projeto
Orquestrador financeiro multi-adquirente (Rede/Cielo) com contingência automática.
Repositório: https://github.com/reigrotti/smartpai-engine

## Stack
Next.js 14, Node 22, Prisma 7, PostgreSQL 15, Cloud SQL (GCP), ChromeOS Penguin

## Infraestrutura GCP
- Projeto: smartpai-serverless-mvp
- Instância Cloud SQL: smartpai-serverless-mvp:southamerica-east1:smartpai-db-instance
- IP público: 35.199.100.217
- Banco: postgres / usuário: postgres / senha: test123

## Ambiente de desenvolvimento atual
- Máquina: ChromeOS com Linux (penguin) — substitui o Cloud Shell
- Pasta do projeto: ~/smartpai-engine
- Node v22, gcloud SDK, git instalados
- Chave SSH configurada no GitHub

## Como subir o ambiente local
Aba 1 — Proxy:
~/cloud-sql-proxy --port 5432 smartpai-serverless-mvp:southamerica-east1:smartpai-db-instance

Aba 2 — Servidor:
cd ~/smartpai-engine
npm run dev

## Dados de teste no banco
- id: test-merchant-001
- name: RoutIQ MVP
- publicKey: pub_test
- secretKey: test1234  ← ATENÇÃO: senha do banco é test123, secretKey do merchant é test1234

## Estado atual (último passo executado)
1. ✅ Ambiente penguin configurado
2. ✅ Código do Cloud Shell enviado para GitHub
3. ✅ Projeto clonado no penguin
4. ✅ npm install + prisma generate funcionando
5. ✅ Proxy conectando ao Cloud SQL
6. ✅ Next.js subindo na porta 3000
7. ✅ API /api/pay respondendo (erro de lógica, não infra)
8. ⏳ PRÓXIMO PASSO: corrigir schema e config do Prisma 7

## Problema atual
Prisma 7 não aceita `url` no schema.prisma — deve ficar no prisma.config.ts.
Schema atual não tem @unique em publicKey e secretKey — impede busca por secretKey.

## Correções pendentes a executar

### 1. prisma.config.ts
export default {
  datasource: {
    url: "postgresql://postgres:test123@127.0.0.1:5432/postgres",
  },
}

### 2. prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Merchant {
  id        String   @id @default(cuid())
  name      String
  publicKey String   @unique
  secretKey String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

### 3. Após editar os dois arquivos:
npx prisma db push
npx prisma generate

### 4. Teste final esperado:
curl -X POST http://localhost:3000/api/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test1234" \
  -d '{"amount": 100}'

Resposta esperada:
{"success":true,"merchant":"RoutIQ MVP","message":"Autenticação bem-sucedida!..."}

## Decisões arquiteturais tomadas
- Migrar do Cloud Shell para ChromeOS penguin (ambiente estável)
- Próximo passo após estabilizar dev: deploy no Cloud Run
- Usar Unix socket no Cloud Run (sem proxy)
- Pool Prisma: max 3, idleTimeout 10s
- Autenticação via secretKey no header Authorization Bearer

## Problemas já resolvidos
- P1000 intermitente: era pool de conexões zumbi no Cloud Shell
- Connection string hardcoded no lib/prisma.ts
- Dois projetos sobrepostos na mesma pasta (legado na raiz, MVP em subpasta)
- Scripts ausentes no package.json
- Schema sem @unique impedindo busca por secretKey
