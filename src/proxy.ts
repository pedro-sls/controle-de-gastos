import { NextResponse, type NextRequest } from "next/server";

import { getSafeRedirectPath } from "@/features/auth/lib/safe-redirect";
import { copyAuthState, refreshSession } from "@/lib/supabase/proxy";

const GUEST_ONLY_PATHS = ["/entrar", "/cadastro", "/recuperar-senha"];
const PRIVATE_PATH_PREFIXES = [
  "/dashboard",
  "/nova-senha",
  "/contas",
  "/categorias",
  "/movimentacoes",
  "/orcamentos",
  "/recorrencias",
  "/relatorios",
  "/configuracoes",
];

function matchesPath(pathname: string, paths: string[]) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function proxy(request: NextRequest) {
  const session = await refreshSession(request);
  const { pathname, search } = request.nextUrl;
  const isPrivatePath = matchesPath(pathname, PRIVATE_PATH_PREFIXES);

  if (isPrivatePath && !session.isAuthenticated) {
    if (pathname === "/nova-senha") {
      const recoveryUrl = new URL("/recuperar-senha", request.url);
      recoveryUrl.searchParams.set("status", "link-invalido");

      return copyAuthState(
        session.response,
        NextResponse.redirect(recoveryUrl, 303),
      );
    }

    const loginUrl = new URL("/entrar", request.url);
    loginUrl.searchParams.set(
      "status",
      session.hadSessionCookie ? "sessao-expirada" : "autenticacao-necessaria",
    );
    loginUrl.searchParams.set(
      "next",
      getSafeRedirectPath(`${pathname}${search}`),
    );

    return copyAuthState(
      session.response,
      NextResponse.redirect(loginUrl, 303),
    );
  }

  if (session.isAuthenticated && matchesPath(pathname, GUEST_ONLY_PATHS)) {
    return copyAuthState(
      session.response,
      NextResponse.redirect(new URL("/dashboard", request.url), 303),
    );
  }

  return session.response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
