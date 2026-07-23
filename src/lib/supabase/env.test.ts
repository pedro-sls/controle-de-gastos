import { afterEach, describe, expect, it } from "vitest";

import { getSupabaseEnv } from "./env";

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const anonJwt = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.signature";
const serviceRoleJwt =
  "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.signature";

afterEach(() => {
  if (originalUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
  }

  if (originalKey === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
  }
});

describe("getSupabaseEnv", () => {
  it.each([
    ["https://project.supabase.co", "sb_publishable_public-key"],
    ["http://127.0.0.1:54321", anonJwt],
  ])("aceita uma configuração pública segura", (url, publishableKey) => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = url;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = publishableKey;

    expect(getSupabaseEnv()).toEqual({ url, publishableKey });
  });

  it.each([
    "ftp://project.supabase.co",
    "http://project.supabase.co",
    "https://user:password@project.supabase.co",
    "https://project.supabase.co/rest/v1",
    "not-a-url",
  ])("rejeita a URL insegura %s", (url) => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = url;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
      "sb_publishable_public-key";

    expect(() => getSupabaseEnv()).toThrow();
  });

  it.each(["sb_secret_private-key", serviceRoleJwt])(
    "rejeita a chave privilegiada %s",
    (key) => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = key;

      expect(() => getSupabaseEnv()).toThrow(
        "não pode conter uma chave secreta ou service_role",
      );
    },
  );

  it("rejeita uma chave que não é publicável", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "chave-desconhecida";

    expect(() => getSupabaseEnv()).toThrow(
      "deve conter uma chave publicável ou anon válida",
    );
  });
});
