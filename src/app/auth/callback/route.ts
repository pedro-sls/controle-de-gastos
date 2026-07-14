import { NextResponse, type NextRequest } from "next/server";

import { getAppUrl } from "@/config/app-url";
import { getSafeRedirectPath } from "@/features/auth/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";

function noStoreRedirect(url: URL) {
  const response = NextResponse.redirect(url, 303);
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getSafeRedirectPath(
    request.nextUrl.searchParams.get("next"),
  );
  const appUrl = getAppUrl();

  if (!code) {
    const errorPath =
      nextPath === "/nova-senha" ? "/recuperar-senha" : "/entrar";
    const errorUrl = new URL(errorPath, appUrl);
    errorUrl.searchParams.set("status", "link-invalido");

    return noStoreRedirect(errorUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorPath =
      nextPath === "/nova-senha" ? "/recuperar-senha" : "/entrar";
    const errorUrl = new URL(errorPath, appUrl);
    errorUrl.searchParams.set("status", "link-invalido");

    return noStoreRedirect(errorUrl);
  }

  return noStoreRedirect(new URL(nextPath, appUrl));
}
