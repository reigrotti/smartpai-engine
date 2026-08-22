"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ArrowLeftRight,
  FileBarChart,
  Store,
  Puzzle,
  Users,
  Play,
  Link2,
  ShieldAlert,
  CreditCard,
  Route,
  ClipboardList,
  UserPlus,
  ChevronDown,
  Check,
  Globe,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEstabelecimento } from "@/contexts/estabelecimento-context"

const adminLinks = [
  { href: "/onboard", icon: UserPlus, label: "OnBoard" },
  { href: "/integracoes", icon: Puzzle, label: "Integrações" },
  { href: "/usuarios-admin", icon: Users, label: "Usuários" },
  { href: "/demo", icon: Play, label: "Demo" },
  { href: "/audit-admin", icon: ClipboardList, label: "Audit" },
]

const operationLinks = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/transacoes", icon: ArrowLeftRight, label: "Transações" },
  { href: "/relatorios", icon: FileBarChart, label: "Relatórios" },
  { href: "/link-pagamento", icon: Link2, label: "Link de Pagamento" },
  { href: "/risk", icon: ShieldAlert, label: "Risk" },
  { href: "/meios-pagamento", icon: CreditCard, label: "Meios de Pagamento" },
  { href: "/rotas", icon: Route, label: "Rotas" },
  { href: "/audit", icon: ClipboardList, label: "Audit" },
  { href: "/usuarios", icon: Users, label: "Usuários" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { selectedEstabelecimento, setSelectedEstabelecimento, estabelecimentos } = useEstabelecimento()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-6">
          <Link href="/" className="flex items-center gap-[10px]">
            {/* Isotipo PLiNIA - esfera #36103A com cicatriz NE e reflexo NW */}
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 80 80" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <circle cx="40" cy="40" r="38" fill="#36103A"/>
              <circle cx="26" cy="26" r="16" fill="white" opacity="0.12"/>
              <circle cx="56" cy="22" r="7" fill="#A47D5E"/>
            </svg>
            {/* Logotipo PLiNIA - Montserrat Black 900, kerning -0.04em */}
            <span 
              className="flex items-baseline text-[22px] font-black text-foreground"
              style={{ fontFamily: "'Montserrat', sans-serif", letterSpacing: "-0.04em" }}
            >
              PL
              {/* i customizado em verde #008529 */}
              <svg 
                style={{ height: "0.72em", width: "0.23em", marginLeft: "0.06em", marginRight: "0.02em" }}
                viewBox="0 0 32 100" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="16" cy="16" r="16" fill="#008529"/>
                <rect x="0" y="38" width="32" height="62" fill="#008529"/>
              </svg>
              NIA
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto p-4">
          {/* Seletor de Estabelecimento */}
          <div>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Estabelecimento
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center justify-between gap-2 rounded-lg bg-sidebar-accent px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-sidebar-accent/80">
                  <div className="flex items-center gap-3">
                    {selectedEstabelecimento ? (
                      <Store className="h-4 w-4 text-[#008529]" />
                    ) : (
                      <Globe className="h-4 w-4 text-[#008529]" />
                    )}
                    <span className="font-medium">
                      {selectedEstabelecimento ? selectedEstabelecimento.nomeFantasia : "Todos os Estabelecimentos"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[232px]">
                <DropdownMenuItem
                  onClick={() => setSelectedEstabelecimento(null)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Todos os Estabelecimentos</span>
                  </div>
                  {selectedEstabelecimento === null && (
                    <Check className="h-4 w-4 text-[#008529]" />
                  )}
                </DropdownMenuItem>
                {estabelecimentos.map((est) => (
                  <DropdownMenuItem
                    key={est.id}
                    onClick={() => setSelectedEstabelecimento(est)}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium">{est.nomeFantasia}</span>
                    {selectedEstabelecimento?.id === est.id && (
                      <Check className="h-4 w-4 text-[#008529]" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Administração Plinia */}
          <div>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Administração Plinia
            </h3>
            <ul className="space-y-1">
              {adminLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-[#008529]"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Operação */}
          <div>
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Operação
            </h3>
            <ul className="space-y-1">
              {operationLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-[#008529]"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>


      </div>
    </aside>
  )
}
