---
name: devops-gcp
description: >-
  Use esta skill ao planejar, executar ou depurar pipelines de build, deploy no
  Google Cloud Platform (GCP), configurações do Cloud Run, conexão com Cloud SQL
  (PostgreSQL), túneis com Cloud SQL Auth Proxy, manifestos Knative e variáveis
  de ambiente. Ative sempre que o trabalho envolver: plinia-engine-template.yaml,
  cloud-sql-proxy, Dockerfile, gcloud run, migrações de banco em produção ou
  CI/CD.
---

# DevOps & GCP Cloud Run — Runbook de Deploy e Infraestrutura

Este documento consolida a arquitetura de infraestrutura na nuvem, os manifestos
declarativos e os comandos oficiais de build, deploy, banco de dados e
monitoramento do **RoutIQ** (`smartpai-engine`) no **Google Cloud Platform
(GCP)**.

---

## 1. Topologia de Infraestrutura GCP

| Recurso | Identificador / Configuração | Descrição |
|---|---|---|
| **Projeto GCP** | `plinia-core-dev` (ID numérico: `728639463419`) | Projeto host dos recursos serverless e banco |
| **Região Principal** | `southamerica-east1` (São Paulo, Brasil) | Baixa latência para adquirentes locais (Cielo/Rede) |
| **Cloud Run Service** | `smartpai-engine` / `plinia-engine-dev` | Container serverless Next.js 14 |
| **Cloud SQL Instance** | `plinia-core-dev:southamerica-east1:smartpai-db-instance` | PostgreSQL gerenciado com SSL e sidecar proxy |
| **Artifact Registry** | `southamerica-east1-docker.pkg.dev/plinia-core-dev/cloud-run-source-deploy/smartpai-engine` | Repositório de imagens Docker geradas no build |
| **Cloud Storage** | `gs://run-sources-plinia-core-dev-southamerica-east1/...` | Bucket temporário de empacotamento de código-fonte |
| **Service Account** | `728639463419-compute@developer.gserviceaccount.com` | Identidade de execução com roles de Cloud SQL Client |

---

## 2. Comandos Oficiais de Deploy

### 2.1 Deploy Direto via Cloud Run Source Deploy (Recomendado)

O Cloud Run empacota automaticamente o repositório utilizando Google Cloud
Buildpacks com o runtime otimizado para Next.js:

```bash
gcloud run deploy smartpai-engine \
  --source . \
  --project plinia-core-dev \
  --region southamerica-east1 \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances plinia-core-dev:southamerica-east1:smartpai-db-instance \
  --service-account 728639463419-compute@developer.gserviceaccount.com \
  --set-env-vars DATABASE_URL="postgresql://postgres:senha_dev@10.128.0.2:5432/postgres" \
  --cpu 1 \
  --memory 512Mi \
  --concurrency 80 \
  --max-instances 3 \
  --timeout 300
```

### 2.2 Deploy Declarativo via Manifesto Knative YAML

Para aplicar configurações versionadas diretamente do arquivo
`plinia-engine-template.yaml`:

```bash
# 1. Aplicar ou atualizar o serviço no Cloud Run
gcloud run services replace plinia-engine-template.yaml \
  --project plinia-core-dev \
  --region southamerica-east1

# 2. Direcionar 100% do tráfego para a revisão mais recente
gcloud run services update-traffic smartpai-engine \
  --project plinia-core-dev \
  --region southamerica-east1 \
  --to-latest
```

### 2.3 Deploy com Imagem Docker Customizada (Container Registry)

Caso opte pelo build de imagem via Artifact Registry / Cloud Build:

```bash
# 1. Build da imagem no Artifact Registry
gcloud builds submit \
  --project plinia-core-dev \
  --tag southamerica-east1-docker.pkg.dev/plinia-core-dev/cloud-run-source-deploy/smartpai-engine:latest .

# 2. Deploy da imagem construída
gcloud run deploy smartpai-engine \
  --image southamerica-east1-docker.pkg.dev/plinia-core-dev/cloud-run-source-deploy/smartpai-engine:latest \
  --project plinia-core-dev \
  --region southamerica-east1 \
  --platform managed \
  --allow-unauthenticated
```

---

## 3. Gestão de Banco de Dados e Conexões

### 3.1 Ambiente Local de Desenvolvimento (Cloud SQL Auth Proxy)

Para conectar o ambiente local ao Cloud SQL gerenciado:

```bash
# Iniciar o proxy em segundo plano ou em terminal separado
./cloud-sql-proxy plinia-core-dev:southamerica-east1:smartpai-db-instance --port 5432
```

**Configuração do `.env` local:**
```env
DATABASE_URL="postgresql://postgres:test123@127.0.0.1:5432/postgres"
```

### 3.2 Execução de Migrações em Produção

**Atenção:** Em produção no Cloud Run, **nunca** execute `prisma migrate dev`.
Utilize:

```bash
# 1. Gerar os clientes tipados localmente
npx prisma generate

# 2. Aplicar migrações pendentes contra o banco de produção (via Cloud SQL Proxy)
DATABASE_URL="postgresql://postgres:senha_prod@127.0.0.1:5432/postgres" npx prisma migrate deploy
```

---

## 4. Pipeline de CI/CD e Checklist Pré-Deploy

Antes de disparar qualquer deploy para `southamerica-east1`, a seguinte esteira
de validação é obrigatória:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Validação de Tipos: npx tsc --noEmit (0 erros)           │
├─────────────────────────────────────────────────────────────┤
│ 2. Linting: npm run lint                                    │
├─────────────────────────────────────────────────────────────┤
│ 3. Build & Prisma Generate: npm run build                   │
├─────────────────────────────────────────────────────────────┤
│ 4. Teste de Roteamento Local: tests/util/test-routing.ts    │
├─────────────────────────────────────────────────────────────┤
│ 5. Deploy GCP: gcloud run deploy / replace                  │
└─────────────────────────────────────────────────────────────┘
```

### Exemplo de Pipeline GitHub Actions (`.github/workflows/deploy.yml`)

```yaml
name: Deploy RoutIQ Engine to Cloud Run

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Typecheck
        run: npx tsc --noEmit

      - name: Build Next.js
        run: npm run build

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: smartpai-engine
          region: southamerica-east1
          source: ./
          env_vars: |
            DATABASE_URL=${{ secrets.PROD_DATABASE_URL }}
```

---

## 5. Telemetria, Logs e Monitoramento

### 5.1 Leitura de Logs em Tempo Real

```bash
# Streaming de logs do Cloud Run
gcloud run services logs tail smartpai-engine \
  --project plinia-core-dev \
  --region southamerica-east1

# Leitura das últimas 50 linhas de log
gcloud run services logs read smartpai-engine \
  --project plinia-core-dev \
  --region southamerica-east1 \
  --limit 50
```

### 5.2 Validação de Métricas de Performance e SLA

Após o deploy, valide a saúde da esteira executando o benchmark de throughput:

```bash
# Disparar teste de carga na URL do Cloud Run
curl -s "https://smartpai-engine-728639463419.southamerica-east1.run.app/api/stress" | jq .
```

**SLA de Produção:** O retorno deve comprovar throughput ≥ 400 ops/seg sem
falhas de concorrência ou esgotamento de conexões no pool do PostgreSQL.
