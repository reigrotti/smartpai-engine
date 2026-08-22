export type ConditionField = "bandeira" | "bin" | "valor" | "volume" | "parcelamento"
export type ConditionOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "notin"

// Um único critério (ex.: Bandeira é uma de [Visa, Elo])
export interface Criterion {
  id: string
  field: ConditionField
  operator: ConditionOperator
  // Suporta múltiplos valores (ex.: Visa + Mastercard). Campos numéricos usam values[0].
  values: string[]
}

// Node de condição: combina múltiplos critérios com E (AND)
export interface ConditionNodeData {
  criteria: Criterion[]
  [key: string]: unknown
}

export interface ProcessorNodeData {
  integrationId: string
  name: string
  kind: "acquirer" | "antifraud"
  [key: string]: unknown
}

export interface TerminalNodeData {
  outcome: "approve" | "decline"
  [key: string]: unknown
}

export const BANDEIRAS = ["Visa", "Mastercard", "Elo", "Amex", "Hipercard"] as const

// À vista + parcelado de 2x a 12x
export const PARCELAMENTOS = [
  "À vista",
  ...Array.from({ length: 11 }, (_, i) => `${i + 2}x`),
] as const

export const FIELD_LABELS: Record<ConditionField, string> = {
  bandeira: "Bandeira",
  bin: "BIN",
  valor: "Valor (R$)",
  volume: "Volume (%)",
  parcelamento: "Condição de pagamento",
}

export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  eq: "é igual a",
  neq: "é diferente de",
  gt: "maior que",
  gte: "maior ou igual a",
  lt: "menor que",
  lte: "menor ou igual a",
  in: "é uma de",
  notin: "não é uma de",
}

// Campos que permitem seleção de múltiplos valores (chips)
export const MULTI_VALUE_FIELDS: ConditionField[] = ["bandeira", "parcelamento", "bin"]

// Operadores permitidos por campo
export const OPERATORS_BY_FIELD: Record<ConditionField, ConditionOperator[]> = {
  bandeira: ["in", "notin"],
  bin: ["in", "notin"],
  valor: ["eq", "gt", "gte", "lt", "lte"],
  volume: ["lte", "lt", "gte", "gt", "eq"],
  parcelamento: ["in", "notin"],
}

// Opções fixas para campos de múltipla escolha
export const OPTIONS_BY_FIELD: Partial<Record<ConditionField, readonly string[]>> = {
  bandeira: BANDEIRAS,
  parcelamento: PARCELAMENTOS,
}

// Cria um novo critério padrão
export function createCriterion(): Criterion {
  return {
    id: `crit-${Math.random().toString(36).slice(2, 9)}`,
    field: "bandeira",
    operator: "in",
    values: [],
  }
}
