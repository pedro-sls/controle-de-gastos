"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  categoryEditSchema,
  categoryIdSchema,
  categorySchema,
  type CategoryInput,
} from "@/features/categories/schemas";
import {
  expiredFinanceSessionState,
  getFinanceDatabaseError,
  getFinanceValidationState,
} from "@/features/finance/action-errors";
import type { FinanceActionState } from "@/features/finance/types";
import { getCurrentIdentity } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function createCategoryAction(
  _previousState: FinanceActionState,
  input: CategoryInput,
): Promise<FinanceActionState> {
  const parsedInput = categorySchema.safeParse(input);
  if (!parsedInput.success) return getFinanceValidationState(parsedInput.error);

  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;

  const supabase = await createClient();
  try {
    const { error } = await supabase.from("categories").insert({
      user_id: identity.id,
      name: parsedInput.data.name.trim(),
      type: parsedInput.data.type,
      color: parsedInput.data.color,
      icon: parsedInput.data.icon,
      is_default: false,
    });

    if (error) {
      return getFinanceDatabaseError(
        error,
        "Já existe uma categoria ativa desse tipo com esse nome.",
      );
    }
  } catch {
    return getFinanceDatabaseError(null, "");
  }

  revalidatePath("/categorias");
  redirect("/categorias?status=criada");
}

export async function updateCategoryAction(
  categoryId: string,
  _previousState: FinanceActionState,
  input: CategoryInput,
): Promise<FinanceActionState> {
  const parsedId = categoryIdSchema.safeParse(categoryId);
  const parsedInput = categoryEditSchema.safeParse(input);
  if (!parsedId.success || !parsedInput.success) {
    return parsedInput.success
      ? { status: "error", message: "A categoria informada não é válida." }
      : getFinanceValidationState(parsedInput.error);
  }

  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;

  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("categories")
      .update({
        name: parsedInput.data.name.trim(),
        color: parsedInput.data.color,
        icon: parsedInput.data.icon,
      })
      .eq("id", parsedId.data)
      .eq("user_id", identity.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return getFinanceDatabaseError(
        error,
        "Já existe uma categoria ativa desse tipo com esse nome.",
      );
    }
    if (!data) return { status: "error", message: "Categoria não encontrada." };
  } catch {
    return getFinanceDatabaseError(null, "");
  }

  revalidatePath("/categorias");
  revalidatePath(`/categorias/${parsedId.data}/editar`);
  redirect("/categorias?status=atualizada");
}

export async function setCategoryArchivedAction(
  categoryId: string,
  archived: boolean,
  _previousState: FinanceActionState,
): Promise<FinanceActionState> {
  void _previousState;
  const parsedId = categoryIdSchema.safeParse(categoryId);
  if (!parsedId.success) {
    return { status: "error", message: "A categoria informada não é válida." };
  }

  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;

  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("categories")
      .update({ archived_at: archived ? new Date().toISOString() : null })
      .eq("id", parsedId.data)
      .eq("user_id", identity.id)
      .select("id")
      .maybeSingle();

    if (error) {
      return getFinanceDatabaseError(
        error,
        "Não é possível reativar: já existe uma categoria ativa desse tipo com esse nome.",
      );
    }
    if (!data) return { status: "error", message: "Categoria não encontrada." };
  } catch {
    return getFinanceDatabaseError(null, "");
  }

  revalidatePath("/categorias");
  return {
    status: "success",
    message: archived ? "Categoria arquivada." : "Categoria reativada.",
  };
}
