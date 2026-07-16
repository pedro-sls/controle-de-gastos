import { z } from "zod";

import { isValidDateInput } from "../transactions/dates";
import { getPeriodDates } from "./period";

const moneyValue = z.coerce.number().finite().nonnegative();

export const dashboardSnapshotSchema = z.object({
  total_balance: z.coerce.number().finite(),
  negative_accounts: z.coerce.number().int().nonnegative(),
  paid_income: moneyValue,
  paid_expense: moneyValue,
  pending_income: moneyValue,
  pending_expense: moneyValue,
  committed_expense: moneyValue,
  overdue_expense: moneyValue,
  overdue_count: z.coerce.number().int().nonnegative(),
  upcoming_expense: moneyValue,
  upcoming_count: z.coerce.number().int().nonnegative(),
  cash_flow: z.array(
    z.object({
      date: z.string().refine(isValidDateInput),
      income: moneyValue,
      expense: moneyValue,
    }),
  ),
  expense_categories: z.array(
    z.object({
      id: z.uuid(),
      name: z.string().min(1).max(80),
      color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .nullable(),
      amount: moneyValue,
    }),
  ),
});

export type DashboardSnapshot = z.infer<typeof dashboardSnapshotSchema>;

export function calculateDailyAvailable(
  paidIncome: number,
  paidExpense: number,
  committedExpense: number,
  daysRemaining: number,
) {
  const availableForPeriod = Math.max(
    0,
    paidIncome - paidExpense - committedExpense,
  );

  return {
    availableForPeriod,
    dailyAvailable: daysRemaining > 0 ? availableForPeriod / daysRemaining : 0,
  };
}

export function fillCashFlow(
  startDate: string,
  endDate: string,
  cashFlow: DashboardSnapshot["cash_flow"],
) {
  const values = new Map(cashFlow.map((item) => [item.date, item]));
  return getPeriodDates(startDate, endDate).map((date) => ({
    date,
    income: values.get(date)?.income ?? 0,
    expense: values.get(date)?.expense ?? 0,
  }));
}
