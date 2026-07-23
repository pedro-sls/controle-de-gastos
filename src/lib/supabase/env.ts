const ENVIRONMENT_VARIABLES = {
  url: "NEXT_PUBLIC_SUPABASE_URL",
  publishableKey: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
} as const;

function getJwtRole(value: string) {
  const [, encodedPayload] = value.split(".");

  if (!encodedPayload) {
    return undefined;
  }

  try {
    const normalizedPayload = encodedPayload
      .replaceAll("-", "+")
      .replaceAll("_", "/")
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");
    const payload = JSON.parse(atob(normalizedPayload)) as {
      role?: unknown;
    };

    return typeof payload.role === "string" ? payload.role : undefined;
  } catch {
    return undefined;
  }
}

function validateSupabaseUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${ENVIRONMENT_VARIABLES.url} deve conter uma URL válida.`);
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(
      `${ENVIRONMENT_VARIABLES.url} deve usar o protocolo HTTP ou HTTPS.`,
    );
  }

  if (
    url.protocol === "http:" &&
    !["localhost", "127.0.0.1"].includes(url.hostname)
  ) {
    throw new Error(
      `${ENVIRONMENT_VARIABLES.url} deve usar HTTPS fora do ambiente local.`,
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
      `${ENVIRONMENT_VARIABLES.url} deve conter apenas a origem do projeto Supabase.`,
    );
  }

  return url.origin;
}

function validatePublishableKey(value: string) {
  const role = getJwtRole(value);

  if (value.startsWith("sb_secret_") || role === "service_role") {
    throw new Error(
      `${ENVIRONMENT_VARIABLES.publishableKey} não pode conter uma chave secreta ou service_role.`,
    );
  }

  if (!value.startsWith("sb_publishable_") && role !== "anon") {
    throw new Error(
      `${ENVIRONMENT_VARIABLES.publishableKey} deve conter uma chave publicável ou anon válida.`,
    );
  }

  return value;
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    const missingVariables = [
      !url ? ENVIRONMENT_VARIABLES.url : null,
      !publishableKey ? ENVIRONMENT_VARIABLES.publishableKey : null,
    ].filter((variable) => variable !== null);

    throw new Error(
      `Variáveis de ambiente ausentes: ${missingVariables.join(", ")}. Consulte o arquivo .env.example.`,
    );
  }

  return {
    url: validateSupabaseUrl(url),
    publishableKey: validatePublishableKey(publishableKey),
  };
}
