import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import { getToday } from "../transactions/dates";
import { getDefaultReportPeriod } from "./calculations";
import {
  reportFilterSchema,
  reportSnapshotSchema,
  type ReportSnapshot,
} from "./schemas";

export type ReportData = {
  snapshot: ReportSnapshot;
  currency: string;
  locale: string;
  timezone: string;
};

export async function getReportData(filters?: {
  startDate?: string;
  endDate?: string;
}): Promise<ReportData> {
  const identity = await requireUser();
  const supabase = await createClient();
  const { data: settings, error: settingsError } = await supabase
    .from("user_settings")
    .select("currency_code, locale, timezone")
    .eq("user_id", identity.id)
    .single();
  if (settingsError)
    throw new Error("Não foi possível carregar as preferências.");

  const defaults = getDefaultReportPeriod(getToday(settings.timezone));
  const parsedFilters = reportFilterSchema.safeParse({
    startDate: filters?.startDate || defaults.startDate,
    endDate: filters?.endDate || defaults.endDate,
  });
  const period = parsedFilters.success ? parsedFilters.data : defaults;
  const { data, error } = await supabase.rpc("get_financial_report", {
    p_period_start: period.startDate,
    p_period_end: period.endDate,
  });
  if (error) throw new Error("Não foi possível gerar o relatório.");
  const snapshot = reportSnapshotSchema.safeParse(data);
  if (!snapshot.success) {
    throw new Error("O relatório retornou um formato inesperado.");
  }

  return {
    snapshot: snapshot.data,
    currency: settings.currency_code,
    locale: settings.locale,
    timezone: settings.timezone,
  };
}
