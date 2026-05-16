import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-white p-6">
      <h1 className="text-6xl font-black italic tracking-tighter uppercase mb-4">RoutIQ</h1>
      <p className="text-zinc-500 mb-8 font-mono text-sm uppercase tracking-widest">Financial Orchestration Engine v1.0</p>
      <Link href="/dashboard" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-sm transition-all">
        ENTRAR NO DASHBOARD
      </Link>
    </div>
  );
}