import { describe, expect, it } from "vitest";

import { financialColorValues } from "@/config/financial-dimensions";

import { accountFormSchema, accountTypes } from "../schemas";

const validAccount = {
  name: "Conta principal",
  type: "checking",
  initialBalance: "1.234,56",
  institution: "Banco Exemplo",
  color: financialColorValues[0],
  icon: "Building2",
} as const;

describe("accountFormSchema", () => {
  it.each(accountTypes)("aceita o tipo de conta %s", (type) => {
    expect(accountFormSchema.safeParse({ ...validAccount, type }).success).toBe(
      true,
    );
  });

  it.each(["0", "-0,01", "999.999.999.999,99", "-999999999999.99"])(
    "aceita o saldo inicial %s dentro de numeric(14,2)",
    (initialBalance) => {
      expect(
        accountFormSchema.safeParse({ ...validAccount, initialBalance })
          .success,
      ).toBe(true);
    },
  );

  it("normaliza textos e aplica vazios aos campos opcionais omitidos", () => {
    const result = accountFormSchema.parse({
      name: "  Reserva  ",
      type: "savings",
      initialBalance: "  -20,50  ",
    });

    expect(result).toEqual({
      name: "Reserva",
      type: "savings",
      initialBalance: "-20,50",
      institution: "",
      color: "",
      icon: "",
    });
  });

  it.each(["", "R$", "1,234", "1e3", "1.000.000.000.000,00"])(
    "rejeita o saldo inicial inválido %s",
    (initialBalance) => {
      expect(
        accountFormSchema.safeParse({ ...validAccount, initialBalance })
          .success,
      ).toBe(false);
    },
  );

  it("rejeita nome vazio ou acima de 80 caracteres", () => {
    expect(
      accountFormSchema.safeParse({ ...validAccount, name: "   " }).success,
    ).toBe(false);
    expect(
      accountFormSchema.safeParse({ ...validAccount, name: "a".repeat(81) })
        .success,
    ).toBe(false);
  });

  it("rejeita instituição acima de 120 caracteres", () => {
    expect(
      accountFormSchema.safeParse({
        ...validAccount,
        institution: "a".repeat(121),
      }).success,
    ).toBe(false);
  });

  it("rejeita tipo, cor e ícone fora das allowlists", () => {
    expect(
      accountFormSchema.safeParse({ ...validAccount, type: "credit" }).success,
    ).toBe(false);
    expect(
      accountFormSchema.safeParse({ ...validAccount, color: "#123456" })
        .success,
    ).toBe(false);
    expect(
      accountFormSchema.safeParse({ ...validAccount, icon: "<script>" })
        .success,
    ).toBe(false);
  });
});
