import Link from "next/link";

import type { Metadata } from "next";

import { getSafeRedirectPath } from "@/features/auth/lib/safe-redirect";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre com segurança na sua conta MeuSaldo.",
};

const notices = {
  "autenticacao-necessaria": {
    message: "Entre para acessar esta área.",
    tone: "info",
  },
  "link-invalido": {
    message: "Este link é inválido ou expirou. Solicite um novo.",
    tone: "error",
  },
  "senha-alterada": {
    message: "Senha atualizada. Entre novamente com a nova senha.",
    tone: "success",
  },
  "sessao-encerrada": {
    message: "Sua sessão foi encerrada com segurança.",
    tone: "success",
  },
  "sessao-expirada": {
    message: "Sua sessão expirou. Entre novamente para continuar.",
    tone: "error",
  },
} as const;

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    status?: string | string[];
  }>;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const status = firstValue(params.status);
  const notice =
    status && status in notices
      ? notices[status as keyof typeof notices]
      : undefined;

  return (
    <AuthCard
      title="Que bom ter você de volta"
      description="Entre para acompanhar seu saldo e organizar o próximo passo."
      footer={
        <p className="text-muted-foreground text-sm">
          Ainda não tem uma conta?{" "}
          <Link
            href="/cadastro"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      }
    >
      <LoginForm
        nextPath={getSafeRedirectPath(firstValue(params.next))}
        notice={notice?.message}
        noticeTone={notice?.tone}
      />
    </AuthCard>
  );
}
