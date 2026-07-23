import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import type { BudgetStatus } from "./calculations";

export type BudgetDTO = {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  periodMonth: string;
  limitAmount: number;
  usedAmount: number;
  percentageUsed: number;
  status: BudgetStatus;
};

export async function getBudgets(periodMonth: string): Promise<BudgetDTO[]> {
  const identity = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_progress")
    .select(
      "id, category_id, period_month, limit_amount, used_amount, percentage_used, status",
    )
    .eq("user_id", identity.id)
    .eq("period_month", periodMonth)
    .order("category_id", { nullsFirst: true });

  if (error) throw new Error("Não foi possível carregar os orçamentos.");

  const categoryIds = (data ?? [])
    .map((row) => row.category_id)
    .filter((id): id is string => Boolean(id));
  const { data: categories, error: categoryError } = categoryIds.length
    ? await supabase
        .from("categories")
        .select("id, name, color")
        .eq("user_id", identity.id)
        .in("id", categoryIds)
    : { data: [], error: null };

  if (categoryError)
    throw new Error("Não foi possível carregar as categorias.");
  const categoryMap = new Map(
    (categories ?? []).map((item) => [item.id, item]),
  );

  return (data ?? []).flatMap((row) => {
    if (!row.id || !row.period_month || row.limit_amount == null) return [];
    const category = row.category_id ? categoryMap.get(row.category_id) : null;
    return [
      {
        id: row.id,
        categoryId: row.category_id,
        categoryName: category?.name ?? null,
        categoryColor: category?.color ?? null,
        periodMonth: row.period_month,
        limitAmount: row.limit_amount,
        usedAmount: row.used_amount ?? 0,
        percentageUsed: row.percentage_used ?? 0,
        status: (row.status ?? "healthy") as BudgetStatus,
      },
    ];
  });
}

export async function getBudgetById(id: string): Promise<BudgetDTO | null> {
  const identity = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_progress")
    .select(
      "id, category_id, period_month, limit_amount, used_amount, percentage_used, status",
    )
    .eq("id", id)
    .eq("user_id", identity.id)
    .maybeSingle();

  if (error) throw new Error("Não foi possível carregar o orçamento.");
  if (!data?.id || !data.period_month || data.limit_amount == null) return null;

  let category: { name: string; color: string | null } | null = null;
  if (data.category_id) {
    const result = await supabase
      .from("categories")
      .select("name, color")
      .eq("id", data.category_id)
      .eq("user_id", identity.id)
      .maybeSingle();
    if (result.error) throw new Error("Não foi possível carregar a categoria.");
    category = result.data;
  }

  return {
    id: data.id,
    categoryId: data.category_id,
    categoryName: category?.name ?? null,
    categoryColor: category?.color ?? null,
    periodMonth: data.period_month,
    limitAmount: data.limit_amount,
    usedAmount: data.used_amount ?? 0,
    percentageUsed: data.percentage_used ?? 0,
    status: (data.status ?? "healthy") as BudgetStatus,
  };
}
