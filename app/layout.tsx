import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RoutIQ | Financial Orchestration',
  description: 'Smart Routing & Recovery Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#09090b] text-zinc-100 antialiased`}>
        <div className="flex min-h-screen">
          {/* Sidebar - Estilo Adyen */}
          <aside className="w-64 border-r border-zinc-800 bg-[#09090b] flex flex-col fixed h-full">
            <div className="p-6 border-b border-zinc-800">
              <h1 className="text-2xl font-black italic tracking-tighter text-indigo-500">ROUTIQ</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-4">Analytics</div>
              <a href="/dashboard" className="block px-3 py-2 text-sm font-medium bg-zinc-900 rounded-lg text-white border border-zinc-800">Overview</a>
              <a href="/transactions" className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Transactions</a>
              <div className="pt-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-4">Settings</div>
              <a href="/settings" className="block px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">API Keys</a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 ml-64">
            {/* Header / Merchant Selector */}
            <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#09090b]/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-tighter text-zinc-400">Merchant:</span>
                <select className="bg-transparent text-xs font-black uppercase border-none focus:ring-0 cursor-pointer text-indigo-400">
                  <option>Active Solutions (Live)</option>
                  <option>Demo Store</option>
                </select>
              </div>
              <div className="text-[10px] font-mono text-zinc-600">v1.2.0-STABLE</div>
            </header>

            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}