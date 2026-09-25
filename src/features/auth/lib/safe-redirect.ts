const INTERNAL_URL_ORIGIN = "https://internal.meusaldo.invalid";

/**
 * Accepts only a same-origin path. This value can safely be used as the target
 * of a redirect after authentication without allowing an open redirect.
 */
export function getSafeRedirectPath(
  candidate: string | null | undefined,
  fallback = "/dashboard",
) {
  if (!candidate) {
    return fallback;
  }

  const value = candidate.trim();

  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/u.test(value)
  ) {
    return fallback;
  }

  try {
    const decodedValue = decodeURIComponent(value);

    if (
      !decodedValue.startsWith("/") ||
      decodedValue.startsWith("//") ||
      decodedValue.includes("\\")
    ) {
      return fallback;
    }

    const url = new URL(value, INTERNAL_URL_ORIGIN);

    if (url.origin !== INTERNAL_URL_ORIGIN) {
      return fallback;
    }

    const normalizedPath = `${url.pathname}${url.search}${url.hash}`;

    // URL normaliza dot-segments, inclusive versões percent-encoded. O
    // resultado precisa ser validado de novo porque pode passar a iniciar com
    // `//` e ganhar semântica de URL externa no redirecionamento seguinte.
    if (
      !normalizedPath.startsWith("/") ||
      normalizedPath.startsWith("//") ||
      normalizedPath.includes("\\") ||
      /[\u0000-\u001f\u007f]/u.test(normalizedPath)
    ) {
      return fallback;
    }

    return normalizedPath;
  } catch {
    return fallback;
  }
}

export function addStatusToRedirectPath(path: string, status: string) {
  const safePath = getSafeRedirectPath(path);
  const url = new URL(safePath, INTERNAL_URL_ORIGIN);
  url.searchParams.set("status", status);

  return `${url.pathname}${url.search}${url.hash}`;
}
