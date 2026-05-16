'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard').then(res => res.json()).then(setData);
  }, []);

  if (!data) return <div className="p-10 text-zinc-500 animate-pulse">CARREGANDO ENGINE...</div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-8 font-sans">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Overview</h1>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Active Solutions Infrastructure</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20 font-bold uppercase">
            Sistema Online
          </span>
        </div>
      </header>

      {/* Grid de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {data.stats.map((item: any, idx: number) => (
          <div key={idx} className="bg-zinc-900 border border-zinc-800 p-5 rounded-sm shadow-xl">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{item.acquirer}</p>
            <div className="flex justify-between items-baseline">
              <p className="text-2xl font-bold">R$ {(item._sum.amount / 100).toFixed(2)}</p>
              <p className="text-xs text-indigo-400 font-mono">{item.status}</p>
            </div>
            <p className="text-zinc-600 text-[10px] mt-2 italic">{item._count.id} transações</p>
          </div>
        ))}
      </div>

      {/* Tabela de Transações Recentes */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-sm">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xs font-black uppercase tracking-widest">Live Feed</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800 bg-zinc-950/50">
                <th className="p-4 uppercase">PSP Reference</th>
                <th className="p-4 uppercase">Merchant</th>
                <th className="p-4 uppercase">Valor</th>
                <th className="p-4 uppercase">Acquirer</th>
                <th className="p-4 uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data.recentTransactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 text-indigo-400">{tx.pspReference}</td>
                  <td className="p-4 text-zinc-400">{tx.merchant?.name}</td>
                  <td className="p-4 font-bold">R$ {(tx.amount / 100).toFixed(2)}</td>
                  <td className="p-4">{tx.acquirer}</td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded uppercase text-[9px] font-bold">
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