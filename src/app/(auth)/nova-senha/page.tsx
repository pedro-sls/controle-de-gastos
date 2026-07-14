import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/components/auth-card";
import { UpdatePasswordForm } from "@/features/auth/components/update-password-form";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Criar nova senha",
  description: "Defina uma nova senha para sua conta MeuSaldo.",
};

export default async function UpdatePasswordPage() {
  await requireUser();

  return (
    <AuthCard
      title="Crie uma nova senha"
      description="Escolha uma senha com pelo menos 8 caracteres. Depois, você entrará novamente."
    >
      <UpdatePasswordForm />
    </AuthCard>
  );
}
