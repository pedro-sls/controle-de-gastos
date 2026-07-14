import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthIdentity = {
  id: string;
  email: string | null;
};

export const getCurrentIdentity = cache(
  async (): Promise<AuthIdentity | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const subject = data?.claims?.sub;
    const email = data?.claims?.email;

    if (error || typeof subject !== "string") {
      return null;
    }

    return {
      id: subject,
      email: typeof email === "string" ? email : null,
    };
  },
);

export async function requireUser() {
  const identity = await getCurrentIdentity();

  if (!identity) {
    redirect("/entrar?status=autenticacao-necessaria");
  }

  return identity;
}
