"use client"

import { createContext, useContext, useState, ReactNode } from "react"

// Tipos
export interface Estabelecimento {
  id: string
  nomeFantasia: string
  cnpj: string
}

// Estabelecimentos mockados (em produção viriam da API/banco de dados)
export const estabelecimentos: Estabelecimento[] = [
  { id: "1", nomeFantasia: "Loja Central", cnpj: "12.345.678/0001-90" },
  { id: "2", nomeFantasia: "E-Commerce Brasil", cnpj: "98.765.432/0001-10" },
  { id: "3", nomeFantasia: "Marketplace Plus", cnpj: "11.222.333/0001-44" },
  { id: "4", nomeFantasia: "Tech Store", cnpj: "55.666.777/0001-88" },
]

interface EstabelecimentoContextType {
  selectedEstabelecimento: Estabelecimento | null
  setSelectedEstabelecimento: (est: Estabelecimento | null) => void
  estabelecimentos: Estabelecimento[]
}

const EstabelecimentoContext = createContext<EstabelecimentoContextType | undefined>(undefined)

export function EstabelecimentoProvider({ children }: { children: ReactNode }) {
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState<Estabelecimento | null>(null)

  return (
    <EstabelecimentoContext.Provider 
      value={{ 
        selectedEstabelecimento, 
        setSelectedEstabelecimento,
        estabelecimentos 
      }}
    >
      {children}
    </EstabelecimentoContext.Provider>
  )
}

export function useEstabelecimento() {
  const context = useContext(EstabelecimentoContext)
  if (context === undefined) {
    throw new Error("useEstabelecimento must be used within an EstabelecimentoProvider")
  }
  return context
}
