import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import type { RecurrenceInput } from "./schemas";

export type RecurrenceDTO = {
  id: string;
  input: RecurrenceInput;
  accountName: string;
  categoryName: string;
  isActive: boolean;
};

const columns =
  "id, account_id, category_id, description, amount, type, frequency, start_date, end_date, next_execution_date, is_active, default_status, payment_method, is_fixed, note";

export async function getRecurrences(): Promise<RecurrenceDTO[]> {
  const identity = await requireUser();
  const supabase = await createClient();
  const [recurrencesResult, accountsResult, categoriesResult] =
    await Promise.all([
      supabase
        .from("recurring_transactions")
        .select(columns)
        .eq("user_id", identity.id)
        .order("is_active", { ascending: false })
        .order("next_execution_date"),
      supabase.from("accounts").select("id, name").eq("user_id", identity.id),
      supabase.from("categories").select("id, name").eq("user_id", identity.id),
    ]);

  if (
    recurrencesResult.error ||
    accountsResult.error ||
    categoriesResult.error
  ) {
    throw new Error("Não foi possível carregar as recorrências.");
  }
  const accountMap = new Map(
    (accountsResult.data ?? []).map((item) => [item.id, item.name]),
  );
  const categoryMap = new Map(
    (categoriesResult.data ?? []).map((item) => [item.id, item.name]),
  );

  return (recurrencesResult.data ?? []).map((row) => ({
    id: row.id,
    input: {
      type: row.type,
      accountId: row.account_id,
      categoryId: row.category_id,
      description: row.description,
      amount: row.amount.toFixed(2).replace(".", ","),
      frequency: row.frequency,
      startDate: row.start_date,
      endDate: row.end_date ?? "",
      nextExecutionDate: row.next_execution_date,
      defaultStatus: row.default_status,
      paymentMethod: row.payment_method,
      isFixed: row.is_fixed,
      note: row.note ?? "",
    },
    accountName: accountMap.get(row.account_id) ?? "Conta indisponível",
    categoryName: categoryMap.get(row.category_id) ?? "Categoria indisponível",
    isActive: row.is_active,
  }));
}

export async function getRecurrenceById(id: string) {
  const recurrences = await getRecurrences();
  return recurrences.find((item) => item.id === id) ?? null;
}
