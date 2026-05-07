# SmartPai — Contexto para Claude

## O que é
Orquestrador financeiro multi-adquirente (Rede/Cielo) com contingência automática.

## Stack
Next.js 14, Node, Prisma, PostgreSQL (Cloud SQL), Cloud Run, VGS

## Estado atual
- [ ] Deploy Cloud Run pendente
- [x] Banco funcionando (Cloud SQL, instância: ???)
- [x] Merchant seed inserido (secretKey: test1234)
- [ ] Conexão Prisma estabilizada

## Decisões tomadas
- Migrar do Cloud Shell para Cloud Run
- Usar Unix socket no lugar do proxy local
- Pool: max 3, idleTimeout 10s

## Problemas conhecidos
- Prisma retornava P1000 intermitente por conexões zumbi no pool
- Connection string estava hardcoded no prisma.ts

## Próximo passo
Deploy no Cloud Run com Cloud SQL via socket
## Estado atual (atualizado)
- Linux ChromeOS (penguin) configurado como ambiente de dev
- Node v22, gcloud SDK, git instalados no penguin
- Chave SSH adicionada ao GitHub
- Próximo passo: git clone do repo + configurar proxy Cloud SQL local

## Ambiente
- Cloud SQL: precisa confirmar connection name (projeto:região:instância)
- Projeto GCP: confirmar ID do projeto ativo
- Pasta correta do MVP: smartpai-serverless-mvp/ dentro do repo