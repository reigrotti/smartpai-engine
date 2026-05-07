import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#020617] text-slate-200`}>
        <div className="flex min-h-screen">
          <aside className="w-72 border-r border-slate-800/60 bg-slate-950/40 p-8 hidden md:flex flex-col gap-10 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 bg-blue-600 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center justify-center font-black text-white italic">R</div>
              <span className="font-black text-white tracking-tighter text-xl italic uppercase">RoutIQ<span className="text-blue-500">.</span></span>
            </div>
            <nav className="flex flex-col gap-3">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] px-3 mb-2">Systems</div>
              <Link href="/" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-900/50 text-slate-400 hover:text-blue-400 rounded-2xl font-bold text-xs transition-all border border-transparent hover:border-blue-500/10">
                📊 Analytics
              </Link>
              <Link href="/transactions" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-900/50 text-slate-400 hover:text-blue-400 rounded-2xl font-bold text-xs transition-all border border-transparent hover:border-blue-500/10">
                ⇄ Transações
              </Link>
              <Link href="/performance" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-900/50 text-slate-400 hover:text-blue-400 rounded-2xl font-bold text-xs transition-all border border-transparent hover:border-blue-500/10">
                📈 Performance
              </Link>
            </nav>
          </aside>
          <main className="flex-1 overflow-y-auto bg-[#020617]">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
