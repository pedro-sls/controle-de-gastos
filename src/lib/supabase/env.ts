const ENVIRONMENT_VARIABLES = {
  url: "NEXT_PUBLIC_SUPABASE_URL",
  publishableKey: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
} as const;

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

  try {
    new URL(url);
  } catch {
    throw new Error(`${ENVIRONMENT_VARIABLES.url} deve conter uma URL válida.`);
  }

  return { url, publishableKey };
}
