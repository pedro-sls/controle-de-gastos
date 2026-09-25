import nextEnvironment from "@next/env";

const { loadEnvConfig } = nextEnvironment;
loadEnvConfig(process.cwd(), false);

const errors = [];

function readRequired(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    errors.push(`${name} não foi definida.`);
    return undefined;
  }

  return value;
}

function readHttpsOrigin(name) {
  const value = readRequired(name);

  if (!value) return undefined;

  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      errors.push(`${name} deve conter somente uma origem HTTPS.`);
      return undefined;
    }

    if (["localhost", "127.0.0.1"].includes(url.hostname)) {
      errors.push(`${name} não pode apontar para o ambiente local.`);
      return undefined;
    }

    return url.origin;
  } catch {
    errors.push(`${name} deve conter uma URL válida.`);
    return undefined;
  }
}

readHttpsOrigin("NEXT_PUBLIC_APP_URL");
readHttpsOrigin("NEXT_PUBLIC_SUPABASE_URL");

const publishableKey = readRequired("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

if (
  publishableKey &&
  (!publishableKey.startsWith("sb_publishable_") ||
    publishableKey.startsWith("sb_secret_"))
) {
  errors.push(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY deve usar uma chave sb_publishable_.",
  );
}

if (process.env.REGISTRATION_MODE?.trim() !== "invite_only") {
  errors.push(
    'REGISTRATION_MODE deve ser "invite_only" antes deste lançamento.',
  );
}

if (errors.length > 0) {
  console.error("Configuração de produção inválida:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Configuração de produção validada.");
