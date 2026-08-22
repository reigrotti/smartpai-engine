'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpRight, RefreshCcw, ShieldCheck, Zap, Layers, RefreshCw, AlertTriangle } from 'lucide-react';

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
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedMerchant]);

  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw size={24} className="text-indigo-500 animate-spin" />
        <div className="text-zinc-500 font-mono animate-pulse uppercase tracking-widest text-[10px]">
          Initializing Analytics Engine...
        </div>
      </div>
    );
  }

  const isDemo = selectedMerchant === 'DEMO_STORE';

  // O Front-end agora lê puramente o dado processado e enviado pela API (Limpo e sem duplicidade)
  const totalVolume = data.stats?.reduce((acc: number, curr: any) => acc + (curr._sum?.amount || 0), 0) / 100 || 0;
  
  const recoveredVolume = data.stats?.reduce((acc: number, curr: any) => {
    const isRecovered = curr.recoveredByRoutIQ === true || curr.recovered_by_routiq === true;
    if (curr.status === 'AUTHORIZED' && isRecovered) return acc + (curr._sum?.amount || 0);
    return acc;
  }, 0) / 100 || 0;

  const approvedVolume = data.stats?.filter((s: any) => s.status === 'AUTHORIZED' || s.status === 'SUCCESS')
    .reduce((acc: number, curr: any) => acc + (curr._sum?.amount || 0), 0) / 100 || 0;
  
  const declinedVolume = data.stats?.filter((s: any) => s.status === 'DECLINED')
    .reduce((acc: number, curr: any) => acc + (curr._sum?.amount || 0), 0) / 100 || 0;

  // Taxa comercial para a demo vs cálculo síncrono para produção
  const authRate = isDemo 
    ? 91.4 
    : (approvedVolume + declinedVolume > 0) 
      ? parseFloat(((approvedVolume / (approvedVolume + declinedVolume)) * 100).toFixed(1)) 
      : 0;

  // Processamento do Gráfico direto da API
  const acquirerMap: Record<string, { name: string; Approved: number; Failed: number }> = {};
  if (data.stats && Array.isArray(data.stats)) {
    data.stats.forEach((s: any) => {
      const name = s.acquirer || 'Unknown';
      if (!acquirerMap[name]) acquirerMap[name] = { name, Approved: 0, Failed: 0 };
      const amount = (s._sum?.amount || 0) / 100;
      if (s.status === 'AUTHORIZED' || s.status === 'SUCCESS') acquirerMap[name].Approved += amount;
      else if (s.status === 'DECLINED') acquirerMap[name].Failed += amount;
    });
  }
  const chartData = Object.values(acquirerMap);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto px-4 py-2">
      
      {/* SELETOR MULTITENANT PREMIUM */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
            <span>Ambiente de Controle</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span className="text-zinc-400">v1.2.0-STABLE</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 font-mono">Orchestrator Control Panel</h1>
        </div>
        
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 font-mono text-xs">
          <button 
            type="button"
            onClick={() => setSelectedMerchant('ACTIVE_SOLUTIONS')}
            className={`px-4 py-1.5 rounded-md font-medium transition-all uppercase tracking-wider ${
              selectedMerchant === 'ACTIVE_SOLUTIONS' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Active Solutions (Live)
          </button>
          <button 
            type="button"
            onClick={() => setSelectedMerchant('DEMO_STORE')}
            className={`px-4 py-1.5 rounded-md font-medium transition-all uppercase tracking-wider ${
              selectedMerchant === 'DEMO_STORE' ? 'bg-indigo-600 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Demo Store
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: Gross Volume */}
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-6 rounded-xl shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Gross Volume</p>
            <Zap size={14} className="text-zinc-600" />
          </div>
          <h3 className="text-3xl font-black tabular-nums tracking-tighter text-zinc-100 font-mono">
            R$ {totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <div className="mt-2 text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
            {isDemo ? 'Simulação de Escala Ativa' : 'Processamento em Tempo Real'}
          </div>
        </div>

        {/* Card: Recovered Volume */}
        <div className="bg-indigo-600/[0.04] backdrop-blur-md border border-indigo-500/20 p-6 rounded-xl relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Recovered by RoutIQ</p>
            <RefreshCcw size={14} className="text-indigo-400 animate-pulse" />
          </div>
          <h3 className="text-3xl font-black tabular-nums tracking-tighter text-indigo-400 font-mono">
            R$ {recoveredVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <div className="mt-2 text-[10px] text-indigo-400/70 font-mono flex items-center gap-1 uppercase tracking-wider">
            <Layers size={10} /> Retentativa Silenciosa Ativa
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-[0.02]">
            <ShieldCheck size={120} className="text-indigo-400" />
          </div>
        </div>

        {/* Card: Authorization Rate */}
        <div className={`backdrop-blur-md border p-6 rounded-xl shadow-2xl transition-all duration-300 ${
          authRate > 80 ? 'bg-emerald-500/[0.02] border-emerald-500/20' : 'bg-amber-500/[0.02] border-amber-500/20'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <p className={`text-[10px] font-bold uppercase tracking-widest font-mono ${authRate > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              Authorization Rate
            </p>
            {authRate > 80 ? <ArrowUpRight size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-amber-500" />}
          </div>
          <h3 className={`text-3xl font-black tabular-nums tracking-tighter font-mono ${authRate > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {authRate}%
          </h3>
          <div className={`mt-2 text-[10px] font-mono uppercase tracking-wider ${authRate > 80 ? 'text-emerald-500/80' : 'text-amber-500/80'}`}>
            {authRate > 80 ? 'SLA Saudável / Operação Estável' : 'Alerta: Soft Declines Identificados'}
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800/80 p-6 rounded-xl shadow-2xl">
        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono mb-8">Volume per Provider</h2>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontSize: '11px', borderRadius: '8px', fontFamily: 'monospace' }}
                cursor={{ fill: '#141416', opacity: 0.4 }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', textTransform: 'uppercase' }} />
              <Bar dataKey="Approved" name="Aprovado (R$)" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={45} />
              <Bar dataKey="Failed" name="Negado (R$)" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Feed */}
      <div className="bg-zinc-900/20 backdrop-blur-md border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/40 flex justify-between items-center">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">Live Transaction Feed</h2>
          <span className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-mono uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" /> Engine Streaming
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800/60 font-mono text-[10px] bg-zinc-950/20">
                <th className="p-4 uppercase tracking-wider font-semibold">PSP Reference</th>
                <th className="p-4 uppercase tracking-wider font-semibold">Merchant</th>
                <th className="p-4 uppercase tracking-wider font-semibold">Amount</th>
                <th className="p-4 uppercase tracking-wider font-semibold">Gateway</th>
                <th className="p-4 uppercase tracking-wider font-semibold">Mapeamento de Erro (SSOT)</th>
                <th className="p-4 text-right uppercase tracking-wider font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 font-mono text-[11px] text-zinc-300">
              {data.recentTransactions?.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-zinc-800/30 transition-all duration-150">
                  <td className="p-4 text-indigo-400/90 font-medium">{tx.pspReference}</td>
                  <td className="p-4 text-zinc-400">{isDemo ? 'STORE_FRANCHISE_PRO' : (tx.merchant?.name || 'MAIN_MERCHANT')}</td>
                  <td className="p-4 font-bold tracking-tight text-zinc-100">
                    {tx.currency} {((isDemo ? tx.amount * 2.85 : tx.amount) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <span className="text-zinc-300">{tx.acquirer}</span>
                    {tx.recoveredByRoutIQ && (
                      <span className="bg-indigo-500/10 text-indigo-400 text-[8px] px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase font-black tracking-wider shadow-inner">
                        Saved
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-zinc-400 text-[10px]">
                      {tx.status === 'AUTHORIZED' || tx.status === 'SUCCESS' ? 'Aprovado' : tx.normalizedError}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase shadow-sm border ${
                      tx.status === 'AUTHORIZED' || tx.status === 'SUCCESS'
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                        : tx.status === 'PENDING'
                          ? 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                          : 'bg-red-500/5 border-red-500/20 text-red-400'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}