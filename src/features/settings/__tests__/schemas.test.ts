import { describe, expect, it } from "vitest";

import { settingsSchema } from "../schemas";

const settings = {
  fullName: "Pessoa Teste",
  currencyCode: "BRL",
  locale: "pt-BR",
  timezone: "America/Recife",
  financialMonthStart: 5,
  theme: "system",
  dateFormat: "dd/MM/yyyy",
};

describe("settings schema", () => {
  it("accepts supported preferences", () => {
    expect(settingsSchema.safeParse(settings).success).toBe(true);
  });

  it("rejects unsafe timezone and invalid month start", () => {
    expect(
      settingsSchema.safeParse({
        ...settings,
        timezone: "Mars/Olympus",
        financialMonthStart: 31,
      }).success,
    ).toBe(false);
  });
});
