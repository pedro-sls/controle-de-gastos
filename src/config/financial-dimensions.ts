import {
  BadgeDollarSign,
  Banknote,
  BriefcaseBusiness,
  Building2,
  Bus,
  CircleEllipsis,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  Laptop,
  PiggyBank,
  ReceiptText,
  Repeat2,
  RotateCcw,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { Database } from "@/types/database";

export type AccountType = Database["public"]["Enums"]["account_type"];
export type CategoryType = Database["public"]["Enums"]["category_type"];

type FinancialDimensionOption<TValue extends string> = Readonly<{
  value: TValue;
  label: string;
  description: string;
}>;

export const accountTypeOptions = [
  {
    value: "checking",
    label: "Conta corrente",
    description: "Conta bancária usada no dia a dia.",
  },
  {
    value: "savings",
    label: "Poupança",
    description: "Conta reservada para guardar dinheiro.",
  },
  {
    value: "wallet",
    label: "Carteira",
    description: "Carteira física ou saldo separado.",
  },
  {
    value: "cash",
    label: "Dinheiro",
    description: "Valor mantido em espécie.",
  },
  {
    value: "digital",
    label: "Conta digital",
    description: "Conta de instituição financeira digital.",
  },
  {
    value: "other",
    label: "Outra",
    description: "Outro tipo de conta ou reserva.",
  },
] as const satisfies readonly FinancialDimensionOption<AccountType>[];

export const accountTypeLabels = {
  checking: "Conta corrente",
  savings: "Poupança",
  wallet: "Carteira",
  cash: "Dinheiro",
  digital: "Conta digital",
  other: "Outra",
} as const satisfies Readonly<Record<AccountType, string>>;

export const categoryTypeOptions = [
  {
    value: "expense",
    label: "Despesa",
    description: "Dinheiro que sai das suas contas.",
  },
  {
    value: "income",
    label: "Receita",
    description: "Dinheiro que entra nas suas contas.",
  },
] as const satisfies readonly FinancialDimensionOption<CategoryType>[];

export const categoryTypeLabels = {
  income: "Receita",
  expense: "Despesa",
} as const satisfies Readonly<Record<CategoryType, string>>;

/**
 * Paleta que inclui todas as cores provisionadas nas categorias padrão.
 * Cada opção possui um primeiro plano com contraste WCAG AA para texto normal.
 */
export const financialColorValues = [
  "#F97316",
  "#3B82F6",
  "#8B5CF6",
  "#EF4444",
  "#6366F1",
  "#EC4899",
  "#F59E0B",
  "#14B8A6",
  "#DC2626",
  "#64748B",
  "#737373",
  "#16A34A",
  "#0D9488",
  "#22C55E",
  "#15803D",
  "#0891B2",
  "#DB2777",
] as const;

export type FinancialColorValue = (typeof financialColorValues)[number];

export type FinancialColorOption = Readonly<{
  value: FinancialColorValue;
  label: string;
  foreground: "#000000" | "#FFFFFF";
}>;

export const financialColorOptions = [
  { value: "#F97316", label: "Laranja", foreground: "#000000" },
  { value: "#3B82F6", label: "Azul", foreground: "#000000" },
  { value: "#8B5CF6", label: "Violeta", foreground: "#000000" },
  { value: "#EF4444", label: "Coral", foreground: "#000000" },
  { value: "#6366F1", label: "Índigo", foreground: "#000000" },
  { value: "#EC4899", label: "Rosa", foreground: "#000000" },
  { value: "#F59E0B", label: "Âmbar", foreground: "#000000" },
  { value: "#14B8A6", label: "Turquesa", foreground: "#000000" },
  { value: "#DC2626", label: "Vermelho", foreground: "#FFFFFF" },
  { value: "#64748B", label: "Ardósia", foreground: "#FFFFFF" },
  { value: "#737373", label: "Cinza", foreground: "#FFFFFF" },
  { value: "#16A34A", label: "Verde", foreground: "#000000" },
  { value: "#0D9488", label: "Verde-petróleo", foreground: "#000000" },
  { value: "#22C55E", label: "Verde-claro", foreground: "#000000" },
  { value: "#15803D", label: "Verde-escuro", foreground: "#FFFFFF" },
  { value: "#0891B2", label: "Ciano", foreground: "#000000" },
  { value: "#DB2777", label: "Magenta", foreground: "#FFFFFF" },
] as const satisfies readonly FinancialColorOption[];

/**
 * Allowlist compartilhada pelos formulários e pelo resolvedor visual.
 * Os 17 ícones de categoria cobrem os 18 padrões ("Outros" é reutilizado).
 */
export const financialIconNames = [
  "BadgeDollarSign",
  "Banknote",
  "BriefcaseBusiness",
  "Building2",
  "Bus",
  "CircleEllipsis",
  "Gamepad2",
  "Gift",
  "GraduationCap",
  "HeartPulse",
  "House",
  "Landmark",
  "Laptop",
  "PiggyBank",
  "ReceiptText",
  "Repeat2",
  "RotateCcw",
  "ShoppingBag",
  "Smartphone",
  "TrendingUp",
  "Utensils",
  "Wallet",
] as const;

export type FinancialIconName = (typeof financialIconNames)[number];

export const financialIconMap = {
  BadgeDollarSign,
  Banknote,
  BriefcaseBusiness,
  Building2,
  Bus,
  CircleEllipsis,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  Laptop,
  PiggyBank,
  ReceiptText,
  Repeat2,
  RotateCcw,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  Utensils,
  Wallet,
} as const satisfies Readonly<Record<FinancialIconName, LucideIcon>>;

export const fallbackFinancialIconName =
  "CircleEllipsis" as const satisfies FinancialIconName;

export const accountIconOptions = [
  { value: "Building2", label: "Banco" },
  { value: "PiggyBank", label: "Poupança" },
  { value: "Wallet", label: "Carteira" },
  { value: "Banknote", label: "Dinheiro" },
  { value: "Smartphone", label: "Conta digital" },
  { value: "CircleEllipsis", label: "Outra" },
] as const satisfies readonly Readonly<{
  value: FinancialIconName;
  label: string;
}>[];

export const categoryIconOptions = [
  { value: "Utensils", label: "Alimentação" },
  { value: "Bus", label: "Transporte" },
  { value: "House", label: "Moradia" },
  { value: "HeartPulse", label: "Saúde" },
  { value: "GraduationCap", label: "Educação" },
  { value: "Gamepad2", label: "Lazer" },
  { value: "ShoppingBag", label: "Compras" },
  { value: "Repeat2", label: "Assinaturas" },
  { value: "Landmark", label: "Banco e dívidas" },
  { value: "ReceiptText", label: "Impostos e recibos" },
  { value: "CircleEllipsis", label: "Outros" },
  { value: "BriefcaseBusiness", label: "Trabalho" },
  { value: "Laptop", label: "Freelance" },
  { value: "BadgeDollarSign", label: "Vendas" },
  { value: "TrendingUp", label: "Rendimentos" },
  { value: "RotateCcw", label: "Reembolso" },
  { value: "Gift", label: "Presente" },
] as const satisfies readonly Readonly<{
  value: FinancialIconName;
  label: string;
}>[];

export function isFinancialIconName(value: string): value is FinancialIconName {
  return Object.prototype.hasOwnProperty.call(financialIconMap, value);
}

export function resolveFinancialIcon(
  value: string | null | undefined,
): LucideIcon {
  return value && isFinancialIconName(value)
    ? financialIconMap[value]
    : financialIconMap[fallbackFinancialIconName];
}
