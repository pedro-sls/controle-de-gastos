import { describe, expect, it } from "vitest";

import { buildTransactionHref, parseTransactionFilters } from "../filters";

describe("transaction filters", () => {
  it("uses only the first value and safe defaults", () => {
    expect(
      parseTransactionFilters({
        tipo: ["income", "expense"],
        estado: "overdue",
        pagina: "2",
      }),
    ).toMatchObject({ kind: "income", status: "overdue", page: 2 });
  });

  it("builds a canonical URL without default values", () => {
    const filters = parseTransactionFilters({
      busca: "mercado",
      tipo: "expense",
      pagina: "3",
    });

    expect(buildTransactionHref(filters)).toBe(
      "/movimentacoes?busca=mercado&tipo=expense&pagina=3",
    );
    expect(buildTransactionHref(filters, { page: 1, search: "" })).toBe(
      "/movimentacoes?tipo=expense",
    );
  });
});
