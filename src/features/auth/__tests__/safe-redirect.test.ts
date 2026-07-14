import { describe, expect, it } from "vitest";

import { getSafeRedirectPath } from "../lib/safe-redirect";

describe("getSafeRedirectPath", () => {
  it.each([
    ["/dashboard", "/dashboard"],
    ["/movimentacoes?periodo=mes#lista", "/movimentacoes?periodo=mes#lista"],
    [" /configuracoes ", "/configuracoes"],
  ])("aceita o caminho interno %s", (candidate, expected) => {
    expect(getSafeRedirectPath(candidate)).toBe(expected);
  });

  it.each([
    "https://example.com",
    "//example.com/path",
    "/\\example.com",
    "/%5Cexample.com",
    "/%2F%2Fexample.com",
    "javascript:alert(1)",
    "data:text/html,conteudo",
    "/caminho\nmalicioso",
    "%E0%A4%A",
  ])("rejeita o destino não confiável %s", (candidate) => {
    expect(getSafeRedirectPath(candidate, "/seguro")).toBe("/seguro");
  });

  it("usa o fallback quando o destino não foi informado", () => {
    expect(getSafeRedirectPath(null)).toBe("/dashboard");
  });
});
