'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldCheck, Zap, AlertTriangle, TrendingUp } from 'lucide-react';

export default function PerformancePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard').then(res => res.json()).then(setData);
  }, []);

  const providerStats = data?.stats?.map((s: any) => ({
    name: `${s.provider} (${s.status})`,
    volume: s._sum.amount || 0,
    color: s.status === 'approved' ? '#10b981' : '#f43f5e'
  })) || [];

  return (
    <div className="p-8">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-white tracking-tight italic uppercase">Engine <span className="text-blue-500">Performance</span></h2>
        <p className="text-slate-500 text-xs font-bold tracking-[0.2em] mt-1">Comparativo de Eficiência por Adquirente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card de Score */}
        <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] flex flex-col justify-center items-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
               <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="440" strokeDashoffset="44" className="text-blue-500" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-4xl font-mono font-bold text-white">90%</span>
               <span className="text-[10px] text-slate-500 font-bold uppercase">Health</span>
             </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-300 font-medium">Otimização de Failover</p>
            <p className="text-xs text-emerald-500 font-bold mt-1">+12.4% Recuperação hoje</p>
          </div>
        </div>

        {/* Gráfico de Barras Comparativo */}
        <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 p-8 rounded-[32px] h-[400px]">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
            <Zap size={14} className="text-blue-500" /> Distribuição de Volume (TPV)
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={providerStats} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#475569" fontSize={10} hide />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b'}} />
              <Bar dataKey="volume" radius={[0, 4, 4, 0]} barSize={20}>
                {providerStats.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
