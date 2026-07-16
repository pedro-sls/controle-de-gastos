import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import { getToday } from "../transactions/dates";
import { getTransactions } from "../transactions/queries";
import {
  calculateDailyAvailable,
  dashboardSnapshotSchema,
  fillCashFlow,
} from "./calculations";
import { getFinancialPeriod } from "./period";

export async function getDashboardData() {
  const identity = await requireUser();
  const supabase = await createClient();
  const { data: settings, error: settingsError } = await supabase
    .from("user_settings")
    .select("financial_month_start, timezone")
    .eq("user_id", identity.id)
    .single();

  if (settingsError) {
    throw new Error("Não foi possível carregar o período financeiro.");
  }

  const today = getToday(settings.timezone);
  const period = getFinancialPeriod(today, settings.financial_month_start);
  const [snapshotResult, recentResult] = await Promise.all([
    supabase.rpc("get_dashboard_snapshot", {
      p_period_start: period.startDate,
      p_period_end: period.endDate,
    }),
    getTransactions({
      search: "",
      kind: "all",
      status: "all",
      accountId: "",
      categoryId: "",
      from: "",
      to: "",
      page: 1,
    }),
  ]);

  if (snapshotResult.error) {
    throw new Error("Não foi possível calcular o resumo financeiro.");
  }

  const parsedSnapshot = dashboardSnapshotSchema.safeParse(snapshotResult.data);
  if (!parsedSnapshot.success) {
    throw new Error("O resumo financeiro retornou um formato inesperado.");
  }

  const snapshot = parsedSnapshot.data;
  const spending = calculateDailyAvailable(
    snapshot.paid_income,
    snapshot.paid_expense,
    snapshot.committed_expense,
    period.daysRemaining,
  );

  return {
    today,
    period,
    snapshot,
    ...spending,
    cashFlow: fillCashFlow(
      period.startDate,
      period.endDate,
      snapshot.cash_flow,
    ),
    recentTransactions: recentResult.items.slice(0, 5),
    hasAccounts: recentResult.accounts.some((account) => !account.archivedAt),
  };
}
