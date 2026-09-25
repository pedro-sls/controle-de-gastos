import { createBrowserClient } from "@supabase/ssr";

import { shouldUseSecureAuthCookies } from "@/config/app-url";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();

  return createBrowserClient<Database>(url, publishableKey, {
    cookieOptions: {
      secure: shouldUseSecureAuthCookies(),
    },
  });
}
