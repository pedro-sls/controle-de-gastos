"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  expiredFinanceSessionState,
  getFinanceValidationState,
} from "@/features/finance/action-errors";
import { parseMoneyInput } from "@/features/finance/money";
import type { FinanceActionState } from "@/features/finance/types";
import { getCurrentIdentity } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import {
  entryKindSchema,
  transactionIdSchema,
  transactionSchema,
  type TransactionInput,
} from "./schemas";

type DatabaseError = { code?: string } | null;

function getTransactionDatabaseError(error: DatabaseError): FinanceActionState {
  const messages: Record<string, string> = {
    "22023": "Revise as contas e o valor da transferência.",
    "23503": "A conta ou categoria selecionada não está mais disponível.",
    "23514": "A movimentação não atende às regras financeiras configuradas.",
    "42501": "Você não tem permissão para usar uma das contas informadas.",
    P0002: "A movimentação não foi encontrada.",
  };

  return {
    status: "error",
    message:
      (error?.code && messages[error.code]) ??
      "Não foi possível salvar a movimentação. Tente novamente.",
  };
}

function getDirectPayload(input: TransactionInput) {
  if (input.kind === "transfer") {
    throw new Error("Transfer payload cannot be written as a transaction.");
  }

  return {
    account_id: input.accountId,
    category_id: input.categoryId,
    description: input.description.trim(),
    amount: parseMoneyInput(input.amount),
    type: input.kind,
    transaction_date: input.transactionDate,
    due_date: input.dueDate || null,
    status: input.status,
    paid_date: input.status === "paid" ? input.paidDate : null,
    payment_method: input.paymentMethod,
    is_fixed: input.kind === "expense" && input.isFixed,
    note: input.note.trim() || null,
  } as const;
}

function getTransferPayload(input: TransactionInput) {
  const payload = {
    p_source_account_id: input.accountId,
    p_destination_account_id: input.destinationAccountId,
    p_description: input.description.trim(),
    p_amount: parseMoneyInput(input.amount),
    p_transaction_date: input.transactionDate,
    p_status: input.status,
    ...(input.dueDate ? { p_due_date: input.dueDate } : {}),
    ...(input.status === "paid" ? { p_paid_date: input.paidDate } : {}),
    ...(input.note.trim() ? { p_note: input.note.trim() } : {}),
  };

  return payload;
}

function revalidateFinancialPaths() {
  revalidatePath("/movimentacoes");
  revalidatePath("/contas");
  revalidatePath("/dashboard");
}

export async function createTransactionAction(
  _previousState: FinanceActionState,
  input: TransactionInput,
): Promise<FinanceActionState> {
  const parsedInput = transactionSchema.safeParse(input);
  if (!parsedInput.success) return getFinanceValidationState(parsedInput.error);

  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;

  const supabase = await createClient();
  try {
    if (parsedInput.data.kind === "transfer") {
      const { error } = await supabase.rpc(
        "create_transfer",
        getTransferPayload(parsedInput.data),
      );
      if (error) return getTransactionDatabaseError(error);
    } else {
      const payload = getDirectPayload(parsedInput.data);
      const { error } = await supabase.from("transactions").insert({
        user_id: identity.id,
        ...payload,
      });
      if (error) return getTransactionDatabaseError(error);
    }
  } catch {
    return getTransactionDatabaseError(null);
  }

  revalidateFinancialPaths();
  redirect("/movimentacoes?status=criada");
}

export async function updateTransactionAction(
  entryId: string,
  _previousState: FinanceActionState,
  input: TransactionInput,
): Promise<FinanceActionState> {
  const parsedId = transactionIdSchema.safeParse(entryId);
  const parsedInput = transactionSchema.safeParse(input);
  if (!parsedId.success || !parsedInput.success) {
    return parsedInput.success
      ? { status: "error", message: "A movimentação informada não é válida." }
      : getFinanceValidationState(parsedInput.error);
  }

  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;

  const supabase = await createClient();
  try {
    if (parsedInput.data.kind === "transfer") {
      const { error } = await supabase.rpc("update_transfer", {
        p_transfer_id: parsedId.data,
        ...getTransferPayload(parsedInput.data),
      });
      if (error) return getTransactionDatabaseError(error);
    } else {
      const { data: existing, error: readError } = await supabase
        .from("transactions")
        .select("id, type")
        .eq("id", parsedId.data)
        .eq("user_id", identity.id)
        .is("transfer_id", null)
        .maybeSingle();

      if (readError) return getTransactionDatabaseError(readError);
      if (!existing) {
        return { status: "error", message: "Movimentação não encontrada." };
      }
      if (existing.type !== parsedInput.data.kind) {
        return {
          status: "error",
          message: "O tipo da movimentação não pode ser alterado na edição.",
        };
      }

      const { data, error } = await supabase
        .from("transactions")
        .update(getDirectPayload(parsedInput.data))
        .eq("id", parsedId.data)
        .eq("user_id", identity.id)
        .is("transfer_id", null)
        .select("id")
        .maybeSingle();

      if (error) return getTransactionDatabaseError(error);
      if (!data) {
        return { status: "error", message: "Movimentação não encontrada." };
      }
    }
  } catch {
    return getTransactionDatabaseError(null);
  }

  revalidateFinancialPaths();
  redirect("/movimentacoes?status=atualizada");
}

export async function deleteTransactionAction(
  entryId: string,
  entryKind: string,
  _previousState: FinanceActionState,
): Promise<FinanceActionState> {
  void _previousState;
  const parsedId = transactionIdSchema.safeParse(entryId);
  const parsedKind = entryKindSchema.safeParse(entryKind);
  if (!parsedId.success || !parsedKind.success) {
    return {
      status: "error",
      message: "A movimentação informada não é válida.",
    };
  }

  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;

  const supabase = await createClient();
  try {
    if (parsedKind.data === "transfer") {
      const { error } = await supabase.rpc("delete_transfer", {
        p_transfer_id: parsedId.data,
      });
      if (error) return getTransactionDatabaseError(error);
    } else {
      const { data, error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", parsedId.data)
        .eq("user_id", identity.id)
        .is("transfer_id", null)
        .select("id")
        .maybeSingle();
      if (error) return getTransactionDatabaseError(error);
      if (!data) {
        return { status: "error", message: "Movimentação não encontrada." };
      }
    }
  } catch {
    return getTransactionDatabaseError(null);
  }

  revalidateFinancialPaths();
  return { status: "success", message: "Movimentação excluída." };
}
