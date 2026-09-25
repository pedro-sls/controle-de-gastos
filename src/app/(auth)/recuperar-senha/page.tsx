import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/components/auth-card";
import { PasswordResetForm } from "@/features/auth/components/password-reset-form";

export const metadata: Metadata = {
  title: "Recuperar senha",
  description: "Solicite com segurança a redefinição da sua senha MeuSaldo.",
};

type PasswordResetPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

export default async function PasswordResetPage({
  searchParams,
}: PasswordResetPageProps) {
  const { status } = await searchParams;
  const normalizedStatus = Array.isArray(status) ? status[0] : status;

  return (
    <AuthCard
      title="Recupere seu acesso"
      description="Informe seu e-mail. Se houver uma conta, enviaremos um link para criar uma nova senha."
      footer={
        <Link
          href="/entrar"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar para o login
        </Link>
      }
    >
      <PasswordResetForm
        notice={
          normalizedStatus === "link-invalido"
            ? "O link de recuperação é inválido ou expirou. Solicite um novo."
            : undefined
        }
      />
    </AuthCard>
  );
}
