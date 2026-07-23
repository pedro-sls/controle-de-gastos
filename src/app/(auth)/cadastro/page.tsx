import Link from "next/link";

import type { Metadata } from "next";

import { AuthCard } from "@/features/auth/components/auth-card";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta MeuSaldo com e-mail e senha.",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Comece a organizar seu dinheiro"
      description="Crie sua conta e confirme o link enviado por e-mail. Não existe aprovação manual."
      footer={
        <p className="text-muted-foreground text-sm">
          Já tem uma conta?{" "}
          <Link
            href="/entrar"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
