import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#020617] text-slate-200`}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 border-r border-slate-800 bg-slate-950/50 p-6 hidden md:flex flex-col gap-8">
            <div className="flex items-center gap-2 px-2">
              <div className="w-6 h-6 bg-emerald-500 rounded-md"></div>
              <span className="font-bold text-white tracking-tight text-lg">RoutIQ.</span>
            </div>
            <nav className="flex flex-col gap-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Merchant Portal</div>
              <button className="flex items-center gap-3 px-3 py-2 bg-slate-900 text-emerald-400 rounded-xl font-medium text-sm border border-emerald-500/10">
                <span>📊 Analytics</span>
              </button>
              <button className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:bg-slate-900 rounded-xl font-medium text-sm transition-all">
                <span>⇄ Transações</span>
              </button>
              <button className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:bg-slate-900 rounded-xl font-medium text-sm transition-all">
                <span>📈 Performance</span>
              </button>
            </nav>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
