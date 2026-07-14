import { CircleCheck, LogOut, ShieldCheck } from "lucide-react";

import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { logoutAction } from "@/features/auth/actions";
import { AuthFormMessage } from "@/features/auth/components/auth-form-message";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Área protegida",
  description: "Área autenticada do MeuSaldo.",
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
    <main className="relative min-h-dvh overflow-hidden px-4 py-10 sm:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_top_left,oklch(0.91_0.08_155),transparent_58%)] opacity-70"
      />
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-emerald-700 uppercase">
              MeuSaldo
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Sua sessão está protegida
            </h1>
          </div>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="outline"
              className="h-11 w-full sm:w-auto"
            >
              <LogOut aria-hidden="true" />
              Sair
            </Button>
          </form>
        </header>

        <div className="mt-8 max-w-xl">
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

        <Card className="mt-8 max-w-2xl gap-6 rounded-2xl py-6 shadow-xl shadow-black/5 sm:py-8">
          <CardHeader className="px-6 sm:px-8">
            <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </span>
            <h2 className="text-xl font-semibold">Autenticação concluída</h2>
            <CardDescription className="leading-6">
              Esta página valida a proteção de rota da Etapa 3. O dashboard
              financeiro completo será construído nas próximas etapas.
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
      </div>
    </main>
  );
}
