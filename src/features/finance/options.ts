import {
  BadgeDollarSign,
  Banknote,
  BriefcaseBusiness,
  Bus,
  CircleDollarSign,
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
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export const financeColors = [
  "#16A34A",
  "#0D9488",
  "#0891B2",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#DB2777",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#64748B",
  "#737373",
] as const;

export const accountTypes = [
  { value: "checking", label: "Conta corrente" },
  { value: "savings", label: "Poupança" },
  { value: "wallet", label: "Carteira" },
  { value: "cash", label: "Dinheiro" },
  { value: "digital", label: "Conta digital" },
  { value: "other", label: "Outra" },
] as const;

export const accountIcons = [
  { value: "WalletCards", label: "Contas" },
  { value: "Landmark", label: "Banco" },
  { value: "PiggyBank", label: "Poupança" },
  { value: "Wallet", label: "Carteira" },
  { value: "Banknote", label: "Dinheiro" },
  { value: "Smartphone", label: "Digital" },
  { value: "CircleDollarSign", label: "Financeiro" },
] as const;

export const categoryIcons = [
  { value: "Utensils", label: "Alimentação" },
  { value: "Bus", label: "Transporte" },
  { value: "House", label: "Moradia" },
  { value: "HeartPulse", label: "Saúde" },
  { value: "GraduationCap", label: "Educação" },
  { value: "Gamepad2", label: "Lazer" },
  { value: "ShoppingBag", label: "Compras" },
  { value: "Repeat2", label: "Assinaturas" },
  { value: "Landmark", label: "Dívidas ou impostos" },
  { value: "ReceiptText", label: "Comprovantes" },
  { value: "BriefcaseBusiness", label: "Salário" },
  { value: "Laptop", label: "Freelance" },
  { value: "BadgeDollarSign", label: "Vendas" },
  { value: "TrendingUp", label: "Rendimentos" },
  { value: "RotateCcw", label: "Reembolso" },
  { value: "Gift", label: "Presente" },
  { value: "CircleEllipsis", label: "Outros" },
] as const;

export const categoryTypes = [
  { value: "expense", label: "Despesa" },
  { value: "income", label: "Receita" },
] as const;

const iconMap: Record<string, LucideIcon> = {
  BadgeDollarSign,
  Banknote,
  BriefcaseBusiness,
  Bus,
  CircleDollarSign,
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
  WalletCards,
};

export function getFinanceIcon(name: string | null | undefined) {
  return (name && iconMap[name]) || CircleDollarSign;
}

export function getAccountTypeLabel(type: string) {
  return accountTypes.find((option) => option.value === type)?.label ?? "Conta";
}

export function getCategoryTypeLabel(type: string) {
  return (
    categoryTypes.find((option) => option.value === type)?.label ?? "Categoria"
  );
}

export function getFinanceColor(
  value: string | null | undefined,
  fallback: (typeof financeColors)[number] = financeColors[0],
) {
  return financeColors.find((color) => color === value) ?? fallback;
}

export function getAccountIconValue(value: string | null | undefined) {
  return (
    accountIcons.find((option) => option.value === value)?.value ??
    accountIcons[0].value
  );
}

export function getCategoryIconValue(value: string | null | undefined) {
  return (
    categoryIcons.find((option) => option.value === value)?.value ??
    "CircleEllipsis"
  );
}
