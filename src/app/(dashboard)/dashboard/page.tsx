import { CircleCheck, LayoutPanelTop, ShieldCheck } from "lucide-react";

import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { AuthFormMessage } from "@/features/auth/components/auth-form-message";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Visão geral financeira do MeuSaldo.",
};

type DashboardPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const identity = await requireUser();
  const { status } = await searchParams;
  const normalizedStatus = Array.isArray(status) ? status[0] : status;

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.12em] text-emerald-800 uppercase dark:text-emerald-300">
          Visão geral
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Seu espaço financeiro está pronto
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl text-base leading-7 sm:text-lg">
          A navegação e a sessão protegida já funcionam em qualquer tamanho de
          tela. Os dados e cálculos do dashboard serão incluídos na Etapa 7.
        </p>
      </header>

      <div className="max-w-xl">
        <AuthFormMessage
          message={
            normalizedStatus === "erro-logout"
              ? "Não foi possível encerrar sua sessão. Tente novamente."
              : normalizedStatus === "senha-alterada"
                ? "Senha atualizada com sucesso."
                : undefined
          }
          tone={normalizedStatus === "erro-logout" ? "error" : "success"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-6 rounded-2xl py-6 shadow-sm sm:py-8">
          <CardHeader className="px-6 sm:px-8">
            <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </span>
            <h2 className="text-lg font-medium">Sessão protegida</h2>
            <CardDescription className="leading-6">
              A identidade é validada novamente no servidor antes de carregar
              esta página.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 sm:px-8">
            <div className="bg-muted/70 flex items-start gap-3 rounded-xl p-4">
              <CircleCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-emerald-700"
              />
              <div>
                <p className="font-medium">Sessão ativa</p>
                <p className="text-muted-foreground mt-1 text-sm break-all">
                  {identity.email ?? "Usuário autenticado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-6 rounded-2xl py-6 shadow-sm sm:py-8">
          <CardHeader className="px-6 sm:px-8">
            <span className="bg-muted text-muted-foreground mb-3 flex size-11 items-center justify-center rounded-xl">
              <LayoutPanelTop aria-hidden="true" className="size-5" />
            </span>
            <h2 className="text-lg font-medium">Layout responsivo</h2>
            <CardDescription className="leading-6">
              Sidebar no computador, barra inferior no celular e acesso rápido
              para uma nova movimentação.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8">
            <div className="bg-muted/70 flex items-start gap-3 rounded-xl p-4">
              <CircleCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-400"
              />
              <p className="text-sm leading-6">
                Tema claro, escuro ou do sistema salvo no navegador.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
