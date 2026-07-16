import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type AccountDTO = {
  id: string;
  name: string;
  type: "checking" | "savings" | "wallet" | "cash" | "digital" | "other";
  initialBalance: number;
  currentBalance: number;
  institution: string | null;
  color: string | null;
  icon: string | null;
  archivedAt: string | null;
};

const accountColumns =
  "id, name, type, initial_balance, current_balance, institution, color, icon, archived_at";

function toAccountDTO(row: {
  id: string | null;
  name: string | null;
  type: AccountDTO["type"] | null;
  initial_balance: number | null;
  current_balance: number | null;
  institution: string | null;
  color: string | null;
  icon: string | null;
  archived_at: string | null;
}): AccountDTO | null {
  if (!row.id || !row.name || !row.type) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    type: row.type,
    initialBalance: row.initial_balance ?? 0,
    currentBalance: row.current_balance ?? row.initial_balance ?? 0,
    institution: row.institution,
    color: row.color,
    icon: row.icon,
    archivedAt: row.archived_at,
  };
}

export async function getAccounts(): Promise<AccountDTO[]> {
  const identity = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("account_balances")
    .select(accountColumns)
    .eq("user_id", identity.id)
    .order("name");

  if (error) {
    throw new Error("Não foi possível carregar as contas.");
  }

  return (data ?? []).map(toAccountDTO).filter((account) => account !== null);
}

export async function getAccountById(id: string): Promise<AccountDTO | null> {
  const identity = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("account_balances")
    .select(accountColumns)
    .eq("id", id)
    .eq("user_id", identity.id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a conta.");
  }

  return data ? toAccountDTO(data) : null;
}
