import { NextResponse } from "next/server";

import { getSupabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
};

export async function GET() {
  try {
    const { url, publishableKey } = getSupabaseEnv();
    const [authResponse, databaseResponse] = await Promise.all([
      fetch(new URL("/auth/v1/health", url), {
        cache: "no-store",
        signal: AbortSignal.timeout(3_000),
      }),
      fetch(new URL("/rest/v1/", url), {
        method: "HEAD",
        headers: { apikey: publishableKey },
        cache: "no-store",
        signal: AbortSignal.timeout(3_000),
      }),
    ]);

    if (!authResponse.ok || !databaseResponse.ok) {
      throw new Error("Supabase indisponível.");
    }

    return NextResponse.json(
      {
        status: "ok",
        services: { application: "ok", database: "ok" },
      },
      { headers: noStoreHeaders },
    );
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        services: { application: "ok", database: "unavailable" },
      },
      { status: 503, headers: noStoreHeaders },
    );
  }
}
