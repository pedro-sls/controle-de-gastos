"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  accountIdSchema,
  accountSchema,
  type AccountInput,
} from "@/features/accounts/schemas";
import {
  expiredFinanceSessionState,
  getFinanceDatabaseError,
  getFinanceValidationState,
} from "@/features/finance/action-errors";
import { parseMoneyInput } from "@/features/finance/money";
import type { FinanceActionState } from "@/features/finance/types";
import { getCurrentIdentity } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function getAccountPayload(input: AccountInput) {
  return {
    name: input.name.trim(),
    type: input.type,
    initial_balance: parseMoneyInput(input.initialBalance),
    institution: input.institution.trim() || null,
    color: input.color,
    icon: input.icon,
  };
}

export async function createAccountAction(
  _previousState: FinanceActionState,
  input: AccountInput,
): Promise<FinanceActionState> {
  const parsedInput = accountSchema.safeParse(input);
  if (!parsedInput.success) return getFinanceValidationState(parsedInput.error);

  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;

  const supabase = await createClient();

  try {
    const { error } = await supabase.from("accounts").insert({
      user_id: identity.id,
      ...getAccountPayload(parsedInput.data),
    });

    if (error) {
      return getFinanceDatabaseError(
        error,
        "Já existe uma conta ativa com esse nome.",
      );
    }
  } catch {
    return getFinanceDatabaseError(null, "");
  }

  revalidatePath("/contas");
  redirect("/contas?status=criada");
}

export async function updateAccountAction(
  accountId: string,
  _previousState: FinanceActionState,
  input: AccountInput,
): Promise<FinanceActionState> {
  const parsedId = accountIdSchema.safeParse(accountId);
  const parsedInput = accountSchema.safeParse(input);
  if (!parsedId.success || !parsedInput.success) {
    return parsedInput.success
      ? { status: "error", message: "A conta informada não é válida." }
      : getFinanceValidationState(parsedInput.error);
  }

  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("accounts")
      .update(getAccountPayload(parsedInput.data))
      .eq("id", parsedId.data)
      .eq("user_id", identity.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return getFinanceDatabaseError(
        error,
        "Já existe uma conta ativa com esse nome.",
      );
    }
    if (!data) return { status: "error", message: "Conta não encontrada." };
  } catch {
    return getFinanceDatabaseError(null, "");
  }

  revalidatePath("/contas");
  revalidatePath(`/contas/${parsedId.data}/editar`);
  redirect("/contas?status=atualizada");
}

export async function setAccountArchivedAction(
  accountId: string,
  archived: boolean,
  _previousState: FinanceActionState,
): Promise<FinanceActionState> {
  void _previousState;
  const parsedId = accountIdSchema.safeParse(accountId);
  if (!parsedId.success) {
    return { status: "error", message: "A conta informada não é válida." };
  }

  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;

  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("accounts")
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq("id", parsedId.data)
      .eq("user_id", identity.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return getFinanceDatabaseError(
        error,
        "Não é possível reativar: já existe uma conta ativa com esse nome.",
      );
    }
    if (!data) return { status: "error", message: "Conta não encontrada." };
  } catch {
    return getFinanceDatabaseError(null, "");
  }

  revalidatePath("/contas");
  return {
    status: "success",
    message: archived ? "Conta arquivada." : "Conta reativada.",
  };
}
