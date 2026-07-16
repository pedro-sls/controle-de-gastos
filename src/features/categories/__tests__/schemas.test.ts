import { describe, expect, it } from "vitest";

import { categoryEditSchema, categorySchema } from "../schemas";

const validCategory = {
  name: "Mercado",
  type: "expense",
  color: "#F97316",
  icon: "ShoppingBag",
} as const;

describe("category schemas", () => {
  it("accepts curated category values", () => {
    expect(categorySchema.safeParse(validCategory).success).toBe(true);
  });

  it("rejects arbitrary type, color and icon values", () => {
    expect(
      categorySchema.safeParse({
        ...validCategory,
        type: "transfer",
        color: "orange",
        icon: "UnknownIcon",
      }).success,
    ).toBe(false);
  });

  it("does not include type in an edit payload", () => {
    const result = categoryEditSchema.parse(validCategory);
    expect(result).toEqual({
      name: validCategory.name,
      color: validCategory.color,
      icon: validCategory.icon,
    });
    expect(result).not.toHaveProperty("type");
  });
});
