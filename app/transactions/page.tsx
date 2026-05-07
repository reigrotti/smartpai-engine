'use client';
import { useEffect, useState } from 'react';
import { Search, Filter, Download, CreditCard, ArrowRightLeft } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setTransactions(data.recent || []))
      .catch(err => console.error("Erro ao carregar transações", err));
  }, []);

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight italic uppercase flex items-center gap-3">
            <ArrowRightLeft className="text-blue-500" size={24} /> 
            Audit <span className="text-blue-500">Log</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Sincronizado com Smart Engine</p>
        </div>
        <button className="bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 text-blue-400 hover:text-white px-5 py-2.5 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest">
          Download CSV
        </button>
      </div>

      <div className="bg-slate-900/20 border border-slate-800/60 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="p-6 border-b border-slate-800/40 bg-slate-950/20 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 text-slate-600" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por ID ou Merchant..." 
              className="bg-slate-900/40 border border-slate-800/50 rounded-2xl py-2.5 pl-12 pr-4 text-xs w-full focus:outline-none focus:border-blue-500/40 transition-all text-slate-400 placeholder:text-slate-700" 
            />
          </div>
          <button className="bg-slate-800/40 p-3 rounded-2xl text-slate-500 hover:text-white border border-slate-800/50 transition-all">
            <Filter size={18}/>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-[10px] uppercase tracking-[0.2em] text-slate-600 font-black border-b border-slate-800/40">
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Merchant</th>
                <th className="px-8 py-5">Engine</th>
                <th className="px-8 py-4 text-right">Volume</th>
                <th className="px-8 py-4 text-right">Intelligence</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800/30">
              {transactions.length > 0 ? (
                transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-blue-500/[0.02] transition-all group">
                    <td className="px-8 py-6 font-mono text-[10px] text-slate-500">
                      {new Date(t.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-bold text-sm tracking-tight">{t.merchant?.name || 'Client'}</span>
                        <span className="text-slate-600 text-[9px] font-mono tracking-tighter">TRX-{t.id.slice(-6).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${t.provider === 'Cielo' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                        {t.provider.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-mono font-bold text-white">
                      R$ {t.amount.toFixed(2)}
                    </td>
                    <td className="px-8 py-6 text-right font-black text-[10px] tracking-widest">
                      <div className="flex items-center justify-end gap-3">
                        <span className={t.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'}>
                          {t.status === 'approved' ? 'CAPTURED' : 'FAILOVER'}
                        </span>
                        <div className={`h-1.5 w-1.5 rounded-full ${t.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`}></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-slate-600 font-mono text-xs uppercase tracking-widest italic">
                    Nenhum registro encontrado no Smart Engine
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
