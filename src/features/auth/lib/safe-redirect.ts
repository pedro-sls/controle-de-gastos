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

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
