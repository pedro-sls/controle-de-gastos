import { describe, expect, it } from "vitest";

import { getAccountConflictError, mapAccountPostgrestError } from "../errors";

describe("mapAccountPostgrestError", () => {
  it.each([
    ["23505", "duplicate"],
    ["23514", "invalid-data"],
    ["23503", "dependency"],
    ["42501", "forbidden"],
  ] as const)("mapeia o código %s como %s", (code, expected) => {
    expect(mapAccountPostgrestError({ code }, "update").code).toBe(expected);
  });

  it("explica o conflito de nome ao reativar", () => {
    expect(mapAccountPostgrestError({ code: "23505" }, "restore")).toEqual({
      code: "duplicate",
      message:
        "Não foi possível reativar a conta porque já existe outra conta ativa com esse nome.",
    });
  });

  it("não expõe mensagens brutas em erros desconhecidos", () => {
    const rawMessage = "token=segredo internal database failure";
    const result = mapAccountPostgrestError(
      { code: "XX000", message: rawMessage, details: rawMessage },
      "create",
    );

    expect(result).toEqual({
      code: "unexpected",
      message: "Não foi possível criar a conta. Tente novamente.",
    });
    expect(result.message).not.toContain(rawMessage);
  });

  it("trata valores que não são erros PostgREST", () => {
    expect(mapAccountPostgrestError(null, "archive")).toEqual({
      code: "unexpected",
      message: "Não foi possível arquivar a conta. Tente novamente.",
    });
  });
});

describe("getAccountConflictError", () => {
  it("retorna uma mensagem segura para concorrência otimista", () => {
    expect(getAccountConflictError()).toEqual({
      code: "conflict",
      message:
        "Esta conta foi alterada em outra sessão. Atualize a página e tente novamente.",
    });
  });
});
