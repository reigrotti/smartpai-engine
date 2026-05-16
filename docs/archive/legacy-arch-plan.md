# RoutIQ - Master Architecture Plan (SSOT)

## 1. Identidade do Projeto
- **Diretório Raiz:** `~/smartpai-serverless-mvp`
- **Stack:** Next.js 14+, Prisma 7 (Driver Adapter), Cloud SQL (Postgres).

## 2. Configurações de Conexão (Verificadas)
- **Modo:** Cloud SQL Proxy (Aba 2) rodando em `127.0.0.1:5432`.
- **Credenciais:** Usuário `postgres` | Senha `test1234` | DB `postgres`.
- **Fonte da Verdade:** Arquivo `.env` na raiz.

## 3. Mapeamento de Pastas (Ordem na Casa)
- **Database:** `prisma/schema.prisma`
- **Conexão Prisma:** `lib/prisma.ts` (Importado em todas as rotas)
- **Serviços de Pagamento:** `lib/services/`
  - `cielo.ts`
  - `rede.ts`
  - `payment-service.ts` (Orquestrador)
- **API Oficial:** `app/api/pay/route.ts`

## 4. Regras de Ouro
1. **Ignorar `src/`**: Manter código apenas na raiz e em `lib/` para evitar duplicidade.
2. **Zero PCI**: Manter integração com VGS em mente para os tokens.
3. **Fallback**: Ordem obrigatória é Rede (Primária) -> Cielo (Contingência).

## 5. Histórico de Limpeza (2026-05-06)
- Removida pasta `src/` para evitar duplicidade com a raiz.
- Removidos arquivos `.bak` e logs de erro.
- Definida a pasta `lib/services` como a única detentora da lógica de gateways.