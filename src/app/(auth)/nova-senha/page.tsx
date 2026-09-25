import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthFormMessage } from "@/features/auth/components/auth-form-message";
import { UpdatePasswordForm } from "@/features/auth/components/update-password-form";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Criar nova senha",
  description: "Defina uma nova senha para sua conta MeuSaldo.",
};

type UpdatePasswordPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  await requireUser();
  const params = await searchParams;
  const status = Array.isArray(params.status)
    ? params.status[0]
    : params.status;

  return (
    <AuthCard
      title="Crie uma nova senha"
      description="Escolha uma senha com pelo menos 8 caracteres. Depois, você entrará novamente."
    >
      <AuthFormMessage
        message={
          status === "convite-aceito"
            ? "Convite confirmado. Agora defina sua senha para concluir o acesso."
            : undefined
        }
        tone="success"
      />
      <UpdatePasswordForm />
    </AuthCard>
  );
}
