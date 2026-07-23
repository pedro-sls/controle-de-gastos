import type { EmailOtpType } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

import { getAppUrl } from "@/config/app-url";
import {
  addStatusToRedirectPath,
  getSafeRedirectPath,
} from "@/features/auth/lib/safe-redirect";
import { createNoStoreRedirect } from "@/lib/auth/redirect-response";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_EMAIL_OTP_TYPES: EmailOtpType[] = ["email", "recovery"];

function isAllowedEmailOtpType(value: string | null): value is EmailOtpType {
  return Boolean(
    value && ALLOWED_EMAIL_OTP_TYPES.includes(value as EmailOtpType),
  );
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const fallback = type === "recovery" ? "/nova-senha" : "/dashboard";
  const nextPath = getSafeRedirectPath(
    request.nextUrl.searchParams.get("next"),
    fallback,
  );
  const appUrl = getAppUrl();

  if (tokenHash && isAllowedEmailOtpType(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      const successPath =
        type === "email"
          ? addStatusToRedirectPath(nextPath, "email-confirmado")
          : nextPath;

      return createNoStoreRedirect(new URL(successPath, appUrl));
    }
  }

  const errorPath = type === "recovery" ? "/recuperar-senha" : "/entrar";
  const errorUrl = new URL(errorPath, appUrl);
  errorUrl.searchParams.set("status", "link-invalido");

  return createNoStoreRedirect(errorUrl);
}
