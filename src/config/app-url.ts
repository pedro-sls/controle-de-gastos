const APP_URL_VARIABLE = "NEXT_PUBLIC_APP_URL";

export function getAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configuredUrl) {
    throw new Error(
      `Variável de ambiente ausente: ${APP_URL_VARIABLE}. Consulte o arquivo .env.example.`,
    );
  }

  let url: URL;

  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error(`${APP_URL_VARIABLE} deve conter uma URL válida.`);
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`${APP_URL_VARIABLE} deve usar o protocolo HTTP ou HTTPS.`);
  }

  if (
    url.protocol === "http:" &&
    !["localhost", "127.0.0.1"].includes(url.hostname)
  ) {
    throw new Error(
      `${APP_URL_VARIABLE} deve usar HTTPS fora do ambiente local.`,
    );
  }

  if (
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      `${APP_URL_VARIABLE} deve conter apenas a origem pública da aplicação.`,
    );
  }

  return url.origin;
}

export function shouldUseSecureAuthCookies() {
  return new URL(getAppUrl()).protocol === "https:";
}

export function getAuthCallbackUrl(nextPath: string) {
  const callbackUrl = new URL("/auth/callback", getAppUrl());
  callbackUrl.searchParams.set("next", nextPath);

  return callbackUrl.toString();
}
