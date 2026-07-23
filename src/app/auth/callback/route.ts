import type { NextRequest } from "next/server";

import { getAppUrl } from "@/config/app-url";
import {
  addStatusToRedirectPath,
  getSafeRedirectPath,
} from "@/features/auth/lib/safe-redirect";
import { createNoStoreRedirect } from "@/lib/auth/redirect-response";
import { createClient } from "@/lib/supabase/server";

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

    return createNoStoreRedirect(errorUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorPath =
      nextPath === "/nova-senha" ? "/recuperar-senha" : "/entrar";
    const errorUrl = new URL(errorPath, appUrl);
    errorUrl.searchParams.set("status", "link-invalido");

    return createNoStoreRedirect(errorUrl);
  }

  const successPath =
    nextPath === "/nova-senha"
      ? nextPath
      : addStatusToRedirectPath(nextPath, "email-confirmado");

  return createNoStoreRedirect(new URL(successPath, appUrl));
}
