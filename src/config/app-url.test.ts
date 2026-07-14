import { afterEach, describe, expect, it } from "vitest";

import { getAppUrl, getAuthCallbackUrl } from "./app-url";

const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

afterEach(() => {
  if (originalAppUrl === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  }
});

describe("getAppUrl", () => {
  it("normaliza uma origem HTTP confiável", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://meusaldo.example/";

    expect(getAppUrl()).toBe("https://meusaldo.example");
  });

  it.each([
    "javascript:alert(1)",
    "http://meusaldo.example",
    "https://user:password@meusaldo.example",
    "https://meusaldo.example/subpath",
    "https://meusaldo.example?redirect=evil",
    "not-a-url",
  ])("rejeita a configuração insegura %s", (configuredUrl) => {
    process.env.NEXT_PUBLIC_APP_URL = configuredUrl;

    expect(() => getAppUrl()).toThrow();
  });
});

describe("getAuthCallbackUrl", () => {
  it("gera um callback na origem configurada", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

    expect(getAuthCallbackUrl("/nova-senha")).toBe(
      "http://localhost:3000/auth/callback?next=%2Fnova-senha",
    );
  });
});
