import { afterEach, describe, expect, it, vi } from "vitest";

import { getRegistrationMode, isOpenRegistration } from "./registration";

const originalRegistrationMode = process.env.REGISTRATION_MODE;

afterEach(() => {
  vi.unstubAllEnvs();

  if (originalRegistrationMode === undefined) {
    delete process.env.REGISTRATION_MODE;
  } else {
    process.env.REGISTRATION_MODE = originalRegistrationMode;
  }
});

describe("getRegistrationMode", () => {
  it.each(["open", "invite_only"] as const)(
    "aceita o modo de cadastro %s",
    (mode) => {
      process.env.REGISTRATION_MODE = mode;

      expect(getRegistrationMode()).toBe(mode);
    },
  );

  it("mantém o cadastro aberto por padrão fora de produção", () => {
    delete process.env.REGISTRATION_MODE;
    vi.stubEnv("NODE_ENV", "test");

    expect(getRegistrationMode()).toBe("open");
    expect(isOpenRegistration()).toBe(true);
  });

  it("fecha o cadastro por padrão em produção", () => {
    delete process.env.REGISTRATION_MODE;
    vi.stubEnv("NODE_ENV", "production");

    expect(getRegistrationMode()).toBe("invite_only");
    expect(isOpenRegistration()).toBe(false);
  });

  it("rejeita valores desconhecidos", () => {
    process.env.REGISTRATION_MODE = "manual";

    expect(() => getRegistrationMode()).toThrow(
      'REGISTRATION_MODE deve ser "open" ou "invite_only".',
    );
  });
});
