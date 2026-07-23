import { describe, expect, it } from "vitest";

import {
  getAuthErrorMessage,
  isAuthRateLimitError,
  isEmailNotConfirmedError,
} from "../lib/auth-error";

describe("getAuthErrorMessage", () => {
  it.each([
    [{ code: "invalid_credentials" }, "E-mail ou senha incorretos."],
    [
      { code: "email_not_confirmed" },
      "Sua conta foi criada, mas o e-mail ainda não foi confirmado. Abra a mensagem de confirmação antes de entrar.",
    ],
    [
      { code: "over_email_send_rate_limit", status: 429 },
      "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    ],
    [
      { code: "refresh_token_not_found" },
      "Sua sessão expirou. Entre novamente para continuar.",
    ],
  ])("traduz o erro conhecido %#", (error, message) => {
    expect(getAuthErrorMessage(error, "login")).toBe(message);
  });

  it("não expõe a mensagem bruta de um erro desconhecido", () => {
    const providerMessage = "internal provider detail with token abc123";
    const message = getAuthErrorMessage(
      { code: "unknown", message: providerMessage },
      "signup",
    );

    expect(message).toBe(
      "Não foi possível concluir o cadastro. Tente novamente.",
    );
    expect(message).not.toContain(providerMessage);
  });

  it("identifica rate limit sem depender somente do status HTTP", () => {
    expect(isAuthRateLimitError({ code: "over_email_send_rate_limit" })).toBe(
      true,
    );
    expect(isAuthRateLimitError({ status: 429 })).toBe(true);
    expect(isAuthRateLimitError({ code: "invalid_credentials" })).toBe(false);
  });

  it("identifica quando o próximo passo é confirmar o e-mail", () => {
    expect(isEmailNotConfirmedError({ code: "email_not_confirmed" })).toBe(
      true,
    );
    expect(isEmailNotConfirmedError({ code: "invalid_credentials" })).toBe(
      false,
    );
  });
});
