import { describe, expect, it } from "vitest";

import { budgetSchema } from "../schemas";

describe("budget schema", () => {
  it("accepts a general monthly budget", () => {
    expect(
      budgetSchema.safeParse({
        categoryId: "",
        periodMonth: "2026-07-01",
        limitAmount: "1.500,00",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid periods and non-positive limits", () => {
    expect(
      budgetSchema.safeParse({
        categoryId: "",
        periodMonth: "2026-07-02",
        limitAmount: "0",
      }).success,
    ).toBe(false);
  });
});
