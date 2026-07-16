import { describe, expect, it } from "vitest";

import { formatDate, isValidDateInput } from "../dates";
import { transactionFilterSchema, transactionSchema } from "../schemas";

const validExpense = {
  kind: "expense" as const,
  accountId: "10000000-0000-4000-8000-000000000001",
  destinationAccountId: "",
  categoryId: "10000000-0000-4000-8000-000000000002",
  description: "Mercado",
  amount: "125,90",
  transactionDate: "2026-07-16",
  dueDate: "2026-07-20",
  status: "paid" as const,
  paidDate: "2026-07-16",
  paymentMethod: "pix" as const,
  isFixed: false,
  note: "",
};

describe("transactionSchema", () => {
  it("accepts a complete expense", () => {
    expect(transactionSchema.safeParse(validExpense).success).toBe(true);
  });

  it("requires a positive amount", () => {
    const result = transactionSchema.safeParse({
      ...validExpense,
      amount: "0",
    });
    expect(result.success).toBe(false);
  });

  it("requires distinct accounts for transfers", () => {
    const result = transactionSchema.safeParse({
      ...validExpense,
      kind: "transfer",
      categoryId: "",
      destinationAccountId: validExpense.accountId,
      paymentMethod: "bank_transfer",
    });
    expect(result.success).toBe(false);
  });

  it("requires a category for income and expense", () => {
    const result = transactionSchema.safeParse({
      ...validExpense,
      categoryId: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects due dates before the transaction date", () => {
    const result = transactionSchema.safeParse({
      ...validExpense,
      dueDate: "2026-07-15",
    });
    expect(result.success).toBe(false);
  });

  it("requires paidDate only for paid entries", () => {
    expect(
      transactionSchema.safeParse({ ...validExpense, paidDate: "" }).success,
    ).toBe(false);
    expect(
      transactionSchema.safeParse({
        ...validExpense,
        status: "pending",
        paidDate: "2026-07-16",
      }).success,
    ).toBe(false);
  });

  it("allows fixed classification only for expenses", () => {
    const result = transactionSchema.safeParse({
      ...validExpense,
      kind: "income",
      isFixed: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("transactionFilterSchema", () => {
  it("normalizes invalid filters to safe defaults", () => {
    expect(
      transactionFilterSchema.parse({
        search: "teste",
        kind: "invalid",
        status: "invalid",
        accountId: "invalid",
        categoryId: "invalid",
        from: "2026-02-30",
        to: "invalid",
        page: "-5",
      }),
    ).toEqual({
      search: "teste",
      kind: "all",
      status: "all",
      accountId: "",
      categoryId: "",
      from: "",
      to: "",
      page: 1,
    });
  });
});

describe("transaction dates", () => {
  it("validates calendar dates without timezone drift", () => {
    expect(isValidDateInput("2024-02-29")).toBe(true);
    expect(isValidDateInput("2026-02-29")).toBe(false);
  });

  it("formats ISO dates in pt-BR", () => {
    expect(formatDate("2026-07-16")).toBe("16/07/2026");
  });
});
