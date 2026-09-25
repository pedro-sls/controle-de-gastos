import { describe, expect, it } from "vitest";

import { recurrenceSchema } from "../schemas";

const validInput = {
  type: "expense",
  accountId: "10000000-0000-4000-8000-000000000001",
  categoryId: "10000000-0000-4000-8000-000000000002",
  description: "Aluguel",
  amount: "1.200,00",
  frequency: "monthly",
  startDate: "2026-07-01",
  endDate: "",
  nextExecutionDate: "2026-07-01",
  defaultStatus: "pending",
  paymentMethod: "boleto",
  isFixed: true,
  note: "",
} as const;

describe("recurrence schema", () => {
  it("accepts a valid fixed expense", () => {
    expect(recurrenceSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejects invalid date ranges", () => {
    expect(
      recurrenceSchema.safeParse({
        ...validInput,
        endDate: "2026-06-30",
      }).success,
    ).toBe(false);
  });

  it("rejects fixed income", () => {
    expect(
      recurrenceSchema.safeParse({
        ...validInput,
        type: "income",
      }).success,
    ).toBe(false);
  });
});
