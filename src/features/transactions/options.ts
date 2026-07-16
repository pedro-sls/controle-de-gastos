export const transactionKinds = [
  { value: "expense", label: "Despesa" },
  { value: "income", label: "Receita" },
  { value: "transfer", label: "Transferência" },
] as const;

export const transactionStatuses = [
  { value: "paid", label: "Pago" },
  { value: "pending", label: "Pendente" },
  { value: "canceled", label: "Cancelado" },
] as const;

export const paymentMethods = [
  { value: "pix", label: "Pix" },
  { value: "cash", label: "Dinheiro" },
  { value: "debit_card", label: "Cartão de débito" },
  { value: "credit_card", label: "Cartão de crédito" },
  { value: "boleto", label: "Boleto" },
  { value: "bank_transfer", label: "Transferência bancária" },
  { value: "other", label: "Outro" },
] as const;

export const transactionStatusFilters = [
  { value: "all", label: "Todos os estados" },
  ...transactionStatuses,
  { value: "overdue", label: "Vencido" },
] as const;

export const transactionKindFilters = [
  { value: "all", label: "Todos os tipos" },
  ...transactionKinds,
] as const;

export function getTransactionKindLabel(kind: string) {
  return (
    transactionKinds.find((option) => option.value === kind)?.label ??
    "Movimentação"
  );
}

export function getTransactionStatusLabel(status: string) {
  if (status === "overdue") return "Vencido";
  return (
    transactionStatuses.find((option) => option.value === status)?.label ??
    "Estado desconhecido"
  );
}

export function getPaymentMethodLabel(method: string) {
  return (
    paymentMethods.find((option) => option.value === method)?.label ?? "Outro"
  );
}
