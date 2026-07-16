import { describe, expect, it } from "vitest";

import { accountSchema } from "../schemas";

const validAccount = {
  name: "Conta principal",
  type: "checking",
  initialBalance: "100,50",
  institution: "Banco local",
  color: "#16A34A",
  icon: "WalletCards",
} as const;

describe("accountSchema", () => {
  it("accepts a complete account", () => {
    expect(accountSchema.safeParse(validAccount).success).toBe(true);
  });

  it("rejects invalid money, color and icon values", () => {
    const result = accountSchema.safeParse({
      ...validAccount,
      initialBalance: "1,234",
      color: "red",
      icon: "<script>",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(["initialBalance", "color", "icon"]),
      );
    }
  });

  it("bounds names and institutions", () => {
    expect(
      accountSchema.safeParse({ ...validAccount, name: " ".repeat(81) })
        .success,
    ).toBe(false);
    expect(
      accountSchema.safeParse({
        ...validAccount,
        institution: "a".repeat(121),
      }).success,
    ).toBe(false);
  });
});
