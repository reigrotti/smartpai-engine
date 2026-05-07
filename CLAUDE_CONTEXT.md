# SmartPai Engine — Contexto de Handover

## Estado Atual: ESTABILIZADO ✅
- **Data:** 07/05/2026
- **Status:** Conexão Local -> Cloud SQL via Proxy funcionando 100%.
- **Autenticação:** Rota `/api/pay` validando Merchant via `secretKey` com sucesso.

## Infraestrutura
- **Ambiente:** ChromeOS Penguin (Linux) - Node v22.
- **Banco:** Google Cloud SQL (PostgreSQL 15).
- **Prisma:** Versão 7 (Configuração via `prisma.config.ts`).

## Próximos Passos
1. Criar Dockerfile para o projeto.
2. Configurar deploy automático no Cloud Run.
3. Implementar a lógica real de processamento de pagamento (integração VGS/Adquirentes).

## Como Rodar (Recapitulando)
1. **Aba Proxy:** `~/cloud-sql-proxy --port 5432 smartpai-serverless-mvp:southamerica-east1:smartpai-db-instance`
2. **Aba Server:** `npm run dev`
3. **Teste:** Usar `Bearer test1234` no Header Authorization.

## Sprint 2 — Concluída ✅
- **Funcionalidade:** Motor de Orquestração e Failover.
- **Estrutura:** Implementada Interface `IProvider` e Provedores `Cielo` e `Rede`.
- **Resultado:** O sistema agora tenta múltiplos provedores automaticamente em caso de falha.
- **Mocks:** Cielo configurada para falhar em valores de R$ 500 para testes de contingência.

## Sprint 2 — BI & Portal Finalizado ✅
- **Visual:** Portal Analytics com Sidebar, Recharts (Area/Bar) e Dark Mode completo.
- **Backend:** Endpoint de dashboard otimizado com queryRaw para série temporal.
- **Ambiente:** Penguin Crostini estabilizado com Tailwind 3.4 e Prisma Engine local.
