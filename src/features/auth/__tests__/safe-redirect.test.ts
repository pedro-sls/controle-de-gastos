import { describe, expect, it } from "vitest";

import {
  addStatusToRedirectPath,
  getSafeRedirectPath,
} from "../lib/safe-redirect";

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
    "/%2e%2e//example.com",
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

  it("rejeita dot-segments após a decodificação do query param", () => {
    const url = new URL(
      "https://meusaldo.example/callback?next=/%252e%252e//evil.example",
    );

    expect(getSafeRedirectPath(url.searchParams.get("next"), "/seguro")).toBe(
      "/seguro",
    );
  });
});

describe("addStatusToRedirectPath", () => {
  it("adiciona o feedback preservando query string e fragmento", () => {
    expect(
      addStatusToRedirectPath(
        "/dashboard?periodo=mes#resumo",
        "entrada-concluida",
      ),
    ).toBe("/dashboard?periodo=mes&status=entrada-concluida#resumo");
  });

  it("substitui um status anterior sem duplicar o parâmetro", () => {
    expect(
      addStatusToRedirectPath("/dashboard?status=antigo", "email-confirmado"),
    ).toBe("/dashboard?status=email-confirmado");
  });

  it("mantém um destino seguro ao receber um caminho externo", () => {
    expect(
      addStatusToRedirectPath("https://evil.example", "entrada-concluida"),
    ).toBe("/dashboard?status=entrada-concluida");
  });
});
