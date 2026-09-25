import Link from "next/link";
import { ExternalLink, MailCheck } from "lucide-react";

import type { Metadata } from "next";

import { getSafeRedirectPath } from "@/features/auth/lib/safe-redirect";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre com segurança na sua conta MeuSaldo.",
};

const notices = {
  "confirmacao-pendente": {
    message:
      "Conta criada com sucesso. Agora confirme seu e-mail para liberar o acesso.",
    tone: "success",
  },
  "autenticacao-necessaria": {
    message: "Entre para acessar esta área.",
    tone: "info",
  },
  "link-invalido": {
    message: "Este link é inválido ou expirou. Solicite um novo.",
    tone: "error",
  },
  "convite-invalido": {
    message:
      "Este convite é inválido ou expirou. Peça ao responsável para enviar um novo convite.",
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

function getLocalEmailInboxUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!configuredUrl) {
    return undefined;
  }

  try {
    const url = new URL(configuredUrl);

    if (!["localhost", "127.0.0.1"].includes(url.hostname)) {
      return undefined;
    }

    return `${url.protocol}//${url.hostname}:54324`;
  } catch {
    return undefined;
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const status = firstValue(params.status);
  const notice =
    status && status in notices
      ? notices[status as keyof typeof notices]
      : undefined;
  const localEmailInboxUrl = getLocalEmailInboxUrl();

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
      {status === "confirmacao-pendente" ? (
        <section className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-950">
          <div className="flex gap-3">
            <MailCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <div className="space-y-3">
              <div>
                <h2 className="font-semibold">
                  Falta apenas confirmar o e-mail
                </h2>
                <p className="mt-1 text-sm leading-6 text-emerald-900">
                  Não existe aprovação manual. Sua conta fica ativa assim que
                  você clicar no link enviado.
                </p>
              </div>
              <ol className="list-decimal space-y-1 pl-5 text-sm leading-6">
                <li>Abra a mensagem “Confirme sua conta no MeuSaldo”.</li>
                <li>Clique em “Confirmar minha conta”.</li>
                <li>Você será levado ao dashboard com o acesso liberado.</li>
              </ol>
              {localEmailInboxUrl ? (
                <a
                  href={localEmailInboxUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
                >
                  Abrir caixa de e-mail local
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              ) : (
                <p className="text-sm leading-6">
                  Confira também as pastas de spam e promoções.
                </p>
              )}
            </div>
          </div>
        </section>
      ) : null}
      <LoginForm
        nextPath={getSafeRedirectPath(firstValue(params.next))}
        notice={notice?.message}
        noticeTone={notice?.tone}
      />
    </AuthCard>
  );
}
