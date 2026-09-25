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
  generationDateSchema,
  recurrenceIdSchema,
  recurrenceSchema,
  type RecurrenceInput,
} from "./schemas";

function payload(input: RecurrenceInput) {
  return {
    account_id: input.accountId,
    category_id: input.categoryId,
    description: input.description.trim(),
    amount: parseMoneyInput(input.amount),
    type: input.type,
    frequency: input.frequency,
    start_date: input.startDate,
    end_date: input.endDate || null,
    next_execution_date: input.nextExecutionDate,
    default_status: input.defaultStatus,
    payment_method: input.paymentMethod,
    is_fixed: input.type === "expense" && input.isFixed,
    note: input.note.trim() || null,
  };
}

function databaseError(error: { code?: string } | null): FinanceActionState {
  const message =
    error?.code === "23503"
      ? "A conta ou categoria selecionada não está disponível."
      : error?.code === "23514"
        ? "A recorrência não atende às regras de datas ou classificação."
        : "Não foi possível salvar a recorrência. Tente novamente.";
  return { status: "error", message };
}

function revalidateRecurrences() {
  revalidatePath("/recorrencias");
  revalidatePath("/movimentacoes");
  revalidatePath("/dashboard");
  revalidatePath("/relatorios");
}

export async function createRecurrenceAction(
  _previousState: FinanceActionState,
  input: RecurrenceInput,
): Promise<FinanceActionState> {
  const parsed = recurrenceSchema.safeParse(input);
  if (!parsed.success) return getFinanceValidationState(parsed.error);
  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;
  const supabase = await createClient();
  const { error } = await supabase.from("recurring_transactions").insert({
    user_id: identity.id,
    ...payload(parsed.data),
  });
  if (error) return databaseError(error);
  revalidateRecurrences();
  redirect("/recorrencias?status=criada");
}

export async function updateRecurrenceAction(
  recurrenceId: string,
  _previousState: FinanceActionState,
  input: RecurrenceInput,
): Promise<FinanceActionState> {
  const parsedId = recurrenceIdSchema.safeParse(recurrenceId);
  const parsed = recurrenceSchema.safeParse(input);
  if (!parsedId.success || !parsed.success) {
    return parsed.success
      ? { status: "error", message: "A recorrência informada não é válida." }
      : getFinanceValidationState(parsed.error);
  }
  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;
  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase
    .from("recurring_transactions")
    .select("type")
    .eq("id", parsedId.data)
    .eq("user_id", identity.id)
    .maybeSingle();
  if (readError) return databaseError(readError);
  if (!existing) {
    return { status: "error", message: "Recorrência não encontrada." };
  }
  if (existing.type !== parsed.data.type) {
    return {
      status: "error",
      message: "O tipo da recorrência não pode ser alterado na edição.",
    };
  }
  const { data, error } = await supabase
    .from("recurring_transactions")
    .update(payload(parsed.data))
    .eq("id", parsedId.data)
    .eq("user_id", identity.id)
    .select("id")
    .maybeSingle();
  if (error) return databaseError(error);
  if (!data) return { status: "error", message: "Recorrência não encontrada." };
  revalidateRecurrences();
  redirect("/recorrencias?status=atualizada");
}

export async function setRecurrenceActiveAction(
  recurrenceId: string,
  active: boolean,
  _previousState: FinanceActionState,
): Promise<FinanceActionState> {
  void _previousState;
  const parsedId = recurrenceIdSchema.safeParse(recurrenceId);
  if (!parsedId.success) {
    return {
      status: "error",
      message: "A recorrência informada não é válida.",
    };
  }
  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_transactions")
    .update({ is_active: active })
    .eq("id", parsedId.data)
    .eq("user_id", identity.id)
    .select("id")
    .maybeSingle();
  if (error) return databaseError(error);
  if (!data) return { status: "error", message: "Recorrência não encontrada." };
  revalidateRecurrences();
  return {
    status: "success",
    message: active ? "Recorrência retomada." : "Recorrência pausada.",
  };
}

export async function deleteRecurrenceAction(
  recurrenceId: string,
  _kind: string,
  _previousState: FinanceActionState,
): Promise<FinanceActionState> {
  void _kind;
  void _previousState;
  const parsedId = recurrenceIdSchema.safeParse(recurrenceId);
  if (!parsedId.success) {
    return {
      status: "error",
      message: "A recorrência informada não é válida.",
    };
  }
  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recurring_transactions")
    .delete()
    .eq("id", parsedId.data)
    .eq("user_id", identity.id)
    .select("id")
    .maybeSingle();
  if (error?.code === "23503") {
    return {
      status: "error",
      message:
        "Esta recorrência já gerou movimentações. Pause-a para preservar o histórico.",
    };
  }
  if (error) return databaseError(error);
  if (!data) return { status: "error", message: "Recorrência não encontrada." };
  revalidateRecurrences();
  return { status: "success", message: "Recorrência excluída." };
}

export async function generateOccurrencesAction(
  _previousState: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  void _previousState;
  const parsedDate = generationDateSchema.safeParse(formData.get("untilDate"));
  if (!parsedDate.success) return getFinanceValidationState(parsedDate.error);
  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("generate_recurring_occurrences", {
    p_until_date: parsedDate.data,
  });
  if (error) return databaseError(error);
  revalidateRecurrences();
  return {
    status: "success",
    message:
      data === 1
        ? "1 movimentação foi gerada."
        : `${data ?? 0} movimentações foram geradas. Nenhuma ocorrência foi duplicada.`,
  };
}
