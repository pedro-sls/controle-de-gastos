"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  expiredFinanceSessionState,
  getFinanceDatabaseError,
  getFinanceValidationState,
} from "@/features/finance/action-errors";
import { parseMoneyInput } from "@/features/finance/money";
import type { FinanceActionState } from "@/features/finance/types";
import { getCurrentIdentity } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import { budgetIdSchema, budgetSchema, type BudgetInput } from "./schemas";

function getPayload(input: BudgetInput) {
  return {
    category_id: input.categoryId || null,
    period_month: input.periodMonth,
    limit_amount: parseMoneyInput(input.limitAmount),
  };
}

function revalidateBudgets() {
  revalidatePath("/orcamentos");
  revalidatePath("/dashboard");
  revalidatePath("/relatorios");
}

export async function createBudgetAction(
  _previousState: FinanceActionState,
  input: BudgetInput,
): Promise<FinanceActionState> {
  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) return getFinanceValidationState(parsed.error);
  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;
  const supabase = await createClient();
  try {
    const { error } = await supabase.from("budgets").insert({
      user_id: identity.id,
      ...getPayload(parsed.data),
    });
    if (error) {
      return getFinanceDatabaseError(
        error,
        parsed.data.categoryId
          ? "Já existe um limite para essa categoria neste mês."
          : "Já existe um limite geral para este mês.",
      );
    }
  } catch {
    return getFinanceDatabaseError(null, "");
  }
  revalidateBudgets();
  redirect(
    `/orcamentos?mes=${parsed.data.periodMonth.slice(0, 7)}&status=criado`,
  );
}

export async function updateBudgetAction(
  budgetId: string,
  _previousState: FinanceActionState,
  input: BudgetInput,
): Promise<FinanceActionState> {
  const parsedId = budgetIdSchema.safeParse(budgetId);
  const parsed = budgetSchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return parsed.success
      ? { status: "error", message: "O orçamento informado não é válido." }
      : getFinanceValidationState(parsed.error);
  }
  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("budgets")
      .update(getPayload(parsed.data))
      .eq("id", parsedId.data)
      .eq("user_id", identity.id)
      .select("id")
      .maybeSingle();
    if (error) {
      return getFinanceDatabaseError(
        error,
        "Já existe um limite igual para este mês.",
      );
    }
    if (!data) return { status: "error", message: "Orçamento não encontrado." };
  } catch {
    return getFinanceDatabaseError(null, "");
  }
  revalidateBudgets();
  redirect(
    `/orcamentos?mes=${parsed.data.periodMonth.slice(0, 7)}&status=atualizado`,
  );
}

export async function deleteBudgetAction(
  budgetId: string,
  _kind: string,
  _previousState: FinanceActionState,
): Promise<FinanceActionState> {
  void _kind;
  void _previousState;
  const parsedId = budgetIdSchema.safeParse(budgetId);
  if (!parsedId.success) {
    return { status: "error", message: "O orçamento informado não é válido." };
  }
  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", parsedId.data)
    .eq("user_id", identity.id)
    .select("id")
    .maybeSingle();
  if (error) return getFinanceDatabaseError(error, "");
  if (!data) return { status: "error", message: "Orçamento não encontrado." };
  revalidateBudgets();
  return { status: "success", message: "Orçamento excluído." };
}
