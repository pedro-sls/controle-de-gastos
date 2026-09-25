export type BudgetStatus = "healthy" | "attention" | "near_limit" | "exceeded";

export function getBudgetStatus(
  usedAmount: number,
  limitAmount: number,
): BudgetStatus {
  if (usedAmount >= limitAmount) return "exceeded";
  if (usedAmount >= limitAmount * 0.9) return "near_limit";
  if (usedAmount >= limitAmount * 0.75) return "attention";
  return "healthy";
}

export function getBudgetStatusLabel(status: BudgetStatus) {
  return {
    healthy: "Dentro do limite",
    attention: "Atenção",
    near_limit: "Próximo do limite",
    exceeded: "Limite ultrapassado",
  }[status];
}

export function getBudgetRemaining(usedAmount: number, limitAmount: number) {
  return limitAmount - usedAmount;
}

export function getBudgetProgressWidth(percentage: number) {
  return Math.min(100, Math.max(0, percentage));
}

export function shiftMonth(periodMonth: string, amount: number) {
  const [year, month] = periodMonth.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1 + amount, 1));
  return date.toISOString().slice(0, 7);
}

export function formatBudgetPeriod(periodMonth: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${periodMonth.slice(0, 7)}-01T00:00:00.000Z`));
}
