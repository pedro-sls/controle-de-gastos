"use server";

import { revalidatePath } from "next/cache";

import {
  expiredFinanceSessionState,
  getFinanceValidationState,
} from "@/features/finance/action-errors";
import type { FinanceActionState } from "@/features/finance/types";
import { getCurrentIdentity } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import {
  settingsSchema,
  themePreferenceSchema,
  type SettingsInput,
} from "./schemas";

function settingsError(): FinanceActionState {
  return {
    status: "error",
    message: "Não foi possível salvar as configurações. Tente novamente.",
  };
}

export async function updateSettingsAction(
  _previousState: FinanceActionState,
  input: SettingsInput,
): Promise<FinanceActionState> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return getFinanceValidationState(parsed.error);
  const identity = await getCurrentIdentity();
  if (!identity) return expiredFinanceSessionState;
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_user_preferences", {
    p_full_name: parsed.data.fullName,
    p_currency_code: parsed.data.currencyCode,
    p_locale: parsed.data.locale,
    p_timezone: parsed.data.timezone,
    p_financial_month_start: parsed.data.financialMonthStart,
    p_theme: parsed.data.theme,
    p_date_format: parsed.data.dateFormat,
  });
  if (error) return settingsError();
  revalidatePath("/", "layout");
  return { status: "success", message: "Configurações salvas com sucesso." };
}

export async function updateThemePreferenceAction(theme: string) {
  const parsed = themePreferenceSchema.safeParse(theme);
  if (!parsed.success) return;
  const identity = await getCurrentIdentity();
  if (!identity) return;
  const supabase = await createClient();
  await supabase
    .from("user_settings")
    .update({ theme: parsed.data })
    .eq("user_id", identity.id);
}
