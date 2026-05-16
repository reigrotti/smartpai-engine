'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, RefreshCcw, ShieldCheck, Zap } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json);
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); // Live update a cada 5s
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="p-8 text-zinc-500 font-mono animate-pulse uppercase tracking-widest text-xs">Initializing Analytics Engine...</div>;

  // Formatação para o gráfico de barras
  const chartData = data.stats.map((s: any) => ({
    name: s.acquirer || 'Unknown',
    amount: s._sum.amount / 100
  }));

  const totalVolume = data.stats.reduce((acc: number, curr: any) => acc + (curr._sum.amount || 0), 0) / 100;
  const recoveredVolume = (data.recoveryStats?.amount || 0) / 100;

  return (
    <div className="space-y-8">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Volume</p>
            <Zap size={14} className="text-zinc-500" />
          </div>
          <h3 className="text-3xl font-black tabular-nums tracking-tighter">
            R$ {totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Recovered by RoutIQ</p>
            <RefreshCcw size={14} className="text-indigo-400" />
          </div>
          <h3 className="text-3xl font-black tabular-nums tracking-tighter text-indigo-400">
            R$ {recoveredVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <ShieldCheck size={100} className="text-indigo-400" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Auth Rate</p>
            <ArrowUpRight size={14} className="text-green-500" />
          </div>
          <h3 className="text-3xl font-black tabular-nums tracking-tighter">98.2%</h3>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-8">Volume per Acquirer</h2>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', fontSize: '12px' }}
                cursor={{ fill: '#18181b' }}
              />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Feed - Adyen Style */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden text-xs">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
          <h2 className="font-bold uppercase tracking-widest text-zinc-400">Live Transaction Feed</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800 font-mono">
                <th className="p-4 uppercase tracking-tighter">PSP Reference</th>
                <th className="p-4 uppercase tracking-tighter">Merchant</th>
                <th className="p-4 uppercase tracking-tighter">Amount</th>
                <th className="p-4 uppercase tracking-tighter">Acquirer</th>
                <th className="p-4 text-right uppercase tracking-tighter">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 font-mono">
              {data.recentTransactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-indigo-500/5 transition-colors">
                  <td className="p-4 text-indigo-400">{tx.pspReference}</td>
                  <td className="p-4 text-zinc-400">{tx.merchant?.name}</td>
                  <td className="p-4 font-bold tracking-tighter text-zinc-200 uppercase">
                    {tx.currency} {(tx.amount / 100).toFixed(2)}
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    {tx.acquirer}
                    {tx.recoveredByRoutIQ && (
                      <span className="bg-indigo-500/20 text-indigo-400 text-[8px] px-1.5 py-0.5 rounded border border-indigo-500/30 uppercase font-black">
                        Saved
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tx.status === 'AUTHORIZED' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
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