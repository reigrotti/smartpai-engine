'use client';
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Zap, ShieldCheck, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function RoutIQDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDash = () => fetch('/api/dashboard').then(res => res.json()).then(setData);
    fetchDash();
    const interval = setInterval(fetchDash, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="p-12 animate-pulse text-blue-500 font-mono italic">Sincronizando com Smart Engine...</div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header Info */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tighter italic">Analytics <span className="text-blue-600">Overview</span></h2>
          <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Performance em Tempo Real</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl text-blue-400 text-xs font-mono">
          STRESS_TEST_NODE: ACTIVE
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Auth Rate</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-mono text-white">92.4%</span>
            <span className="flex items-center text-emerald-500 text-xs font-bold"><ArrowUpRight size={14}/> 2.1%</span>
          </div>
        </div>
        {data.stats?.map((s:any, i:number) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{s.provider} — {s.status}</p>
            <div className="text-2xl font-mono text-white">R$ {s._sum.amount?.toLocaleString()}</div>
            <p className="text-[10px] text-slate-600 mt-1">{s._count.id} transações processadas</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Gráfico de Autorização */}
        <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-[32px] h-[450px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Taxa de Autorização (%)</h3>
            <Activity className="text-blue-500" size={18} />
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={data.chartData}>
              <defs>
                <linearGradient id="chartBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px'}} />
              <Area type="monotone" dataKey="approved" stroke="#3b82f6" fillOpacity={1} fill="url(#chartBlue)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Recuperação */}
        <div className="bg-slate-900/20 border border-slate-800 p-8 rounded-[32px] h-[450px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Volume Recuperado via Failover</h3>
            <ShieldCheck className="text-emerald-500" size={18} />
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px'}} />
              <Bar dataKey="approved" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Audit */}
      <div className="text-center py-10 border-t border-slate-900">
        <p className="text-[10px] font-mono text-slate-700 tracking-[0.5em] uppercase italic">SmartPai Orchestration Intelligence © 2026</p>
      </div>
    </div>
  );
}
