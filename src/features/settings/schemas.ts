import { z } from "zod";

import {
  currencyOptions,
  dateFormatOptions,
  localeOptions,
  themeOptions,
  timezoneOptions,
} from "./options";

function values<const T extends readonly { value: string }[]>(options: T) {
  return options.map((item) => item.value) as [
    T[number]["value"],
    ...T[number]["value"][],
  ];
}

export const settingsSchema = z.object({
  fullName: z.string().trim().max(120, "Use no máximo 120 caracteres."),
  currencyCode: z.enum(values(currencyOptions)),
  locale: z.enum(values(localeOptions)),
  timezone: z.enum(values(timezoneOptions)),
  financialMonthStart: z
    .number()
    .int()
    .min(1, "Use um dia entre 1 e 28.")
    .max(28, "Use um dia entre 1 e 28."),
  theme: z.enum(values(themeOptions)),
  dateFormat: z.enum(values(dateFormatOptions)),
});

export const themePreferenceSchema = z.enum(["system", "light", "dark"]);
export type SettingsInput = z.infer<typeof settingsSchema>;
