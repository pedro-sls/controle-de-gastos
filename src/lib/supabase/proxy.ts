import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

const AUTH_CACHE_HEADERS = ["cache-control", "expires", "pragma"] as const;

export type RefreshedSession = {
  isAuthenticated: boolean;
  hadSessionCookie: boolean;
  response: NextResponse;
};

export async function refreshSession(
  request: NextRequest,
): Promise<RefreshedSession> {
  const hadSessionCookie = request.cookies.getAll().some(({ name }) => {
    return (
      name.startsWith("sb-") &&
      name.includes("-auth-token") &&
      !name.includes("code-verifier")
    );
  });
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  // Não execute lógica entre a criação do cliente e esta chamada. getClaims()
  // valida o JWT e permite ao cliente renovar os cookies antes da resposta.
  try {
    const { data, error } = await supabase.auth.getClaims();

    return {
      isAuthenticated: !error && typeof data?.claims?.sub === "string",
      hadSessionCookie,
      response,
    };
  } catch {
    return {
      isAuthenticated: false,
      hadSessionCookie,
      response,
    };
  }
}

export function copyAuthState(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  AUTH_CACHE_HEADERS.forEach((header) => {
    const value = source.headers.get(header);

    if (value) {
      target.headers.set(header, value);
    }
  });

  target.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0",
  );
  target.headers.set("Pragma", "no-cache");
  target.headers.set("Expires", "0");

  return target;
}
