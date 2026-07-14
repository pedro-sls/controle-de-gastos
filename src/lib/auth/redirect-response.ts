import { NextResponse } from "next/server";

export function createNoStoreRedirect(url: URL, status = 303) {
  const response = NextResponse.redirect(url, status);
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}
