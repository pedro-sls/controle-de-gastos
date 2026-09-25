import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import type { SettingsInput } from "./schemas";

export async function getUserSettings(): Promise<SettingsInput> {
  const identity = await requireUser();
  const supabase = await createClient();
  const [profileResult, settingsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", identity.id)
      .single(),
    supabase
      .from("user_settings")
      .select(
        "currency_code, locale, timezone, financial_month_start, theme, date_format",
      )
      .eq("user_id", identity.id)
      .single(),
  ]);
  if (profileResult.error || settingsResult.error) {
    throw new Error("Não foi possível carregar as configurações.");
  }
  return {
    fullName: profileResult.data.full_name ?? "",
    currencyCode: settingsResult.data
      .currency_code as SettingsInput["currencyCode"],
    locale: settingsResult.data.locale as SettingsInput["locale"],
    timezone: settingsResult.data.timezone as SettingsInput["timezone"],
    financialMonthStart: settingsResult.data.financial_month_start,
    theme: settingsResult.data.theme,
    dateFormat: settingsResult.data.date_format as SettingsInput["dateFormat"],
  };
}

export async function getThemePreference() {
  const identity = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_settings")
    .select("theme")
    .eq("user_id", identity.id)
    .single();
  if (error) throw new Error("Não foi possível carregar o tema.");
  return data.theme;
}
