import Link from "next/link";
import { MailCheck } from "lucide-react";
import { connection } from "next/server";

import type { Metadata } from "next";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isOpenRegistration } from "@/config/registration";
import { AuthCard } from "@/features/auth/components/auth-card";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta MeuSaldo com e-mail e senha.",
};

export default async function SignupPage() {
  await connection();
  const registrationIsOpen = isOpenRegistration();

  return (
    <AuthCard
      title={
        registrationIsOpen
          ? "Comece a organizar seu dinheiro"
          : "Acesso por convite"
      }
      description={
        registrationIsOpen
          ? "Crie sua conta e confirme o link enviado por e-mail."
          : "Na produção, cada pessoa entra com um convite enviado diretamente ao próprio e-mail."
      }
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
      {registrationIsOpen ? (
        <SignupForm />
      ) : (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-950">
          <MailCheck aria-hidden="true" />
          <AlertTitle>Cadastro público desativado</AlertTitle>
          <AlertDescription className="text-emerald-900">
            Se você recebeu um convite, abra a mensagem e use o link para
            definir sua senha. Caso contrário, solicite acesso ao responsável
            pelo MeuSaldo.
          </AlertDescription>
        </Alert>
      )}
    </AuthCard>
  );
}
