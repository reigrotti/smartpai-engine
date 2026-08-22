---
name: frontend-architect
description: >-
  Use esta skill ao criar, modificar ou depurar qualquer componente visual,
  página ou layout de frontend no projeto smartpai-engine (RoutIQ). Cobre a
  arquitetura do Next.js 14 App Router, o Design System (Tailwind CSS Dark
  Fintech, Lucide React, Recharts), os padrões de gerenciamento de estado
  (polling, seletores multi-tenant, Server Actions) e a formatação de dados
  financeiros. Ative sempre que o trabalho envolver: app/dashboard/**,
  app/transactions/**, app/settings/**, app/performance/**, app/checkout/**,
  app/layout.tsx, app/globals.css ou tailwind.config.ts.
---

# Frontend Architect — Design System & UI Runbook RoutIQ

Este documento descreve os padrões de arquitetura visual, componentes,
bibliotecas de interface e estratégias de estado observados no frontend do
**RoutIQ** (`smartpai-engine`).

---

## 1. Visão Geral da Arquitetura do Frontend

O frontend é construído sobre o **Next.js 14 App Router** com React 18,
TypeScript 5, Tailwind CSS e Recharts. Toda a interface segue uma identidade
visual **Dark Theme Fintech** (inspirada em Adyen, Stripe e terminal Bloomberg).

### 1.1 Mapa de Páginas e Telas

```
app/
├── layout.tsx              # Root layout persistente (Sidebar Adyen-style + Header com status)
├── globals.css             # Tokens base e background #09090b
├── page.tsx                # Landing / Splash Screen minimalista com redirecionamento
├── dashboard/page.tsx      # Dashboard analítico principal (KPIs, Recharts, Live Feed)
├── transactions/page.tsx   # Audit log de transações, filtros e busca
├── settings/page.tsx       # Gerenciamento de chaves (PublicKey / SecretKey via Server Actions)
├── performance/page.tsx    # Métricas de eficiência por adquirente e health score circular
└── checkout/page.tsx       # Visão operacional compacta / terminal de checkout
```

---

## 2. Design System e Identidade Visual

### 2.1 Paleta de Cores

O projeto adota uma paleta escura de alto contraste com tons de cinza/zinco e
acentos semânticos para métricas financeiras:

| Elemento / Função | Classe Tailwind / Hex | Descrição |
|---|---|---|
| **Background Base** | `bg-[#09090b]` / `bg-zinc-950` | Fundo dark profundo para toda a aplicação |
| **Containers / Cards** | `bg-zinc-900/40` + `border-zinc-800/80` | Glassmorphism com `backdrop-blur-md` |
| **Destaque Primário** | `text-indigo-400` / `bg-indigo-600` | Identidade RoutIQ, ações e botões principais |
| **Sucesso / Aprovado** | `text-emerald-400` / `bg-emerald-500/10` | Transações autorizadas, taxas > 80% |
| **Alerta / Pendente** | `text-amber-400` / `bg-amber-500/10` | Status pendentes, alertas de failover |
| **Erro / Recusado** | `text-red-400` / `bg-red-500/10` | Transações negadas, Hard Declines |
| **Silent Recovery** | `bg-indigo-500/10 text-indigo-400` | Badge `Saved` para transações recuperadas |

### 2.2 Tipografia e Fontes

- **Fonte Principal:** Google Font `Inter` carregada em `app/layout.tsx`.
- **Fonte Mono / Telemetria:** `font-mono` aplicada em valores monetários
  (`tabular-nums`), timestamps, chaves de API, `pspReference` e status de motor.
- **Hierarquia:**
  - Títulos de Seção: `text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono`
  - KPIs: `text-3xl font-black tabular-nums tracking-tighter font-mono`
  - Badges: `text-[8px]` a `text-[10px] uppercase font-black tracking-wider`

### 2.3 Biblioteca de Ícones (`lucide-react`)

Utilize ícones consistentes de `lucide-react` para representar conceitos de negócio:

```typescript
import { 
  ArrowUpRight,   // Taxa de aprovação positiva
  RefreshCcw,     // Recuperação / Retry
  ShieldCheck,    // Segurança / Zero PCI
  Zap,            // Volume bruto / Throughput
  Layers,         // Fila de contingência
  RefreshCw,      // Spinner de loading
  AlertTriangle,  // Alertas e falhas
  Key,            // Credenciais de merchant
  Eye, EyeOff,    // Revelar / ocultar secret key
  Save,           // Ações de persistência
  Search, Filter  // Tabelas de auditoria
} from 'lucide-react';
```

---

## 3. Padrões de Estado e Consumo de Dados

### 3.1 Polling em Tempo Real (`useEffect` + Interval)

Como o painel atua como telemetria de produção, o padrão utilizado nas páginas
analíticas é o polling periódico com desativação de cache do navegador:

```typescript
'use client';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<'ACTIVE_SOLUTIONS' | 'DEMO_STORE'>('ACTIVE_SOLUTIONS');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard?merchant=${selectedMerchant}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to sync with Analytics Engine:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // 5s polling
    return () => clearInterval(interval);          // Cleanup obrigatório
  }, [selectedMerchant]);
```

### 3.2 Seletor Multi-Tenant e Modo Demo

O estado `selectedMerchant` alterna dinamicamente o escopo analítico:
- `ACTIVE_SOLUTIONS`: Dados reais de produção/sandbox direto do Cloud SQL.
- `DEMO_STORE`: Ativa multiplicadores de escala no backend (`?merchant=DEMO_STORE`) para apresentações de pitch.

### 3.3 Formulários com Server Actions (`app/settings/page.tsx`)

Para salvar configurações e chaves sem expor endpoints REST desnecessários:

```typescript
'use client';
import { useState } from 'react';
import { saveMerchantKeys } from '../actions/merchant';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [keys, setKeys] = useState({ publicKey: '', secretKey: '' });

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);

    const result = await saveMerchantKeys(keys);

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert(result.error || 'Erro ao salvar.');
    }
    setLoading(false);
  };
```

---

## 4. Padrões de Visualização de Dados (Recharts)

### 4.1 Gráfico de Barras Financeiro (`Volume per Provider`)

```typescript
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

<div className="h-[280px] w-full">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={chartData} barGap={6}>
      <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
      <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
      <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
      <Tooltip 
        contentStyle={{ 
          backgroundColor: '#09090b', 
          border: '1px solid #27272a', 
          fontSize: '11px', 
          borderRadius: '8px', 
          fontFamily: 'monospace' 
        }}
        cursor={{ fill: '#141416', opacity: 0.4 }}
      />
      <Legend 
        verticalAlign="top" 
        height={36} 
        iconType="circle" 
        wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', textTransform: 'uppercase' }} 
      />
      <Bar dataKey="Approved" name="Aprovado (R$)" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={45} />
      <Bar dataKey="Failed" name="Negado (R$)" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={45} />
    </BarChart>
  </ResponsiveContainer>
</div>
```

---

## 5. Regras de Formatação Financeira e Normalização

### 5.1 Conversão de Moeda (Centavos para Reais)

O backend persiste valores inteiros em centavos (ex: `15000` = R$ 150,00). O frontend deve formatar com:

```typescript
// Formatação canônica
const valorEmReais = (tx.amount / 100).toLocaleString('pt-BR', { 
  minimumFractionDigits: 2,
  maximumFractionDigits: 2 
});
// Exibição: R$ 150,00
```

### 5.2 Badge de Contingência (`recoveredByRoutIQ`)

Sempre que a transação for salva pelo failover de adquirente, renderize a tag de distinção:

```tsx
<td className="p-4 flex items-center gap-2">
  <span className="text-zinc-300">{tx.acquirer}</span>
  {tx.recoveredByRoutIQ && (
    <span className="bg-indigo-500/10 text-indigo-400 text-[8px] px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase font-black tracking-wider shadow-inner">
      Saved
    </span>
  )}
</td>
```

### 5.3 Badges de Status Transacional

```tsx
<span className={`px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${
  tx.status === 'AUTHORIZED' || tx.status === 'SUCCESS'
    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
    : tx.status === 'PENDING'
      ? 'bg-amber-500/5 border-amber-500/20 text-amber-400'
      : 'bg-red-500/5 border-red-500/20 text-red-400'
}`}>
  {tx.status}
</span>
```

---

## 6. Layout Shell e Navegação (`app/layout.tsx`)

O layout raiz fornece:
1. **Sidebar Fixa (Adyen-style):** 64px width, links para `/dashboard`, `/transactions`, `/settings`.
2. **Top Header Stick:** Indicador de status do motor com `animate-pulse`, seletor de Merchant e versão `v1.2.0-STABLE`.
3. **Container Principal:** `ml-64` para compensar a barra lateral fixa.

---

## 7. Checklist de Qualidade de UI

Ao desenvolver ou alterar componentes de frontend:

1. **Responsividade:** Garantir que grids colapsem adequadamente em telas menores (`grid-cols-1 md:grid-cols-3`).
2. **Tabular Nums:** Usar `tabular-nums` em colunas numéricas e valores para evitar saltos visuais durante o polling.
3. **Empty States & Loading:** Sempre incluir spinners (`RefreshCw` com `animate-spin`) e fallbacks para listas vazias.
4. **Sem Vazamento de Credenciais:** O frontend **nunca** deve invocar adquirentes diretamente ou exibir credenciais em plain-text sem mascaramento.
5. **Zero Erros de TypeScript:** Validar sempre com `npx tsc --noEmit`.
