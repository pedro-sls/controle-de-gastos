import { describe, expect, it } from "vitest";

import {
  loginSchema,
  passwordResetRequestSchema,
  passwordUpdateSchema,
  signupSchema,
} from "../schemas";

describe("loginSchema", () => {
  it("normaliza o e-mail e não aplica a regra de senha nova", () => {
    const result = loginSchema.parse({
      email: "  pessoa@example.com  ",
      password: "curta",
    });

    expect(result).toEqual({
      email: "pessoa@example.com",
      password: "curta",
    });
  });

  it("rejeita campos ausentes e e-mail inválido", () => {
    expect(loginSchema.safeParse({ email: "", password: "" }).success).toBe(
      false,
    );
    expect(
      loginSchema.safeParse({ email: "invalido", password: "segredo" }).success,
    ).toBe(false);
  });
});

describe("signupSchema", () => {
  const validSignup = {
    fullName: "Pessoa da Silva",
    email: "pessoa@example.com",
    password: "12345678",
    passwordConfirmation: "12345678",
  };

  it("aceita os limites válidos de senha", () => {
    expect(signupSchema.safeParse(validSignup).success).toBe(true);
    expect(
      signupSchema.safeParse({
        ...validSignup,
        password: "a".repeat(72),
        passwordConfirmation: "a".repeat(72),
      }).success,
    ).toBe(true);
  });

  it("rejeita senhas com 7 ou 73 caracteres", () => {
    expect(
      signupSchema.safeParse({
        ...validSignup,
        password: "a".repeat(7),
        passwordConfirmation: "a".repeat(7),
      }).success,
    ).toBe(false);
    expect(
      signupSchema.safeParse({
        ...validSignup,
        password: "a".repeat(73),
        passwordConfirmation: "a".repeat(73),
      }).success,
    ).toBe(false);
  });

  it("rejeita nome fora do limite e confirmação divergente", () => {
    expect(
      signupSchema.safeParse({ ...validSignup, fullName: "P" }).success,
    ).toBe(false);
    expect(
      signupSchema.safeParse({
        ...validSignup,
        passwordConfirmation: "senha-diferente",
      }).success,
    ).toBe(false);
  });
});

describe("password schemas", () => {
  it("valida o e-mail da solicitação de recuperação", () => {
    expect(
      passwordResetRequestSchema.safeParse({ email: "pessoa@example.com" })
        .success,
    ).toBe(true);
    expect(
      passwordResetRequestSchema.safeParse({ email: "pessoa" }).success,
    ).toBe(false);
  });

  it("exige uma senha nova válida e confirmações iguais", () => {
    expect(
      passwordUpdateSchema.safeParse({
        password: "nova-senha-segura",
        passwordConfirmation: "nova-senha-segura",
      }).success,
    ).toBe(true);
    expect(
      passwordUpdateSchema.safeParse({
        password: "nova-senha-segura",
        passwordConfirmation: "outra-senha-segura",
      }).success,
    ).toBe(false);
  });
});
