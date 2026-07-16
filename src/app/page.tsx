import Link from "next/link";
import { ArrowRight, CheckCircle2, WalletCards } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="relative isolate flex min-h-screen items-center overflow-hidden px-6 py-16 sm:px-10">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top_left,oklch(0.91_0.08_155),transparent_58%)] opacity-70"
      />

      <section className="mx-auto w-full max-w-5xl">
        <div className="bg-card text-muted-foreground mb-10 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm shadow-sm">
          <CheckCircle2
            aria-hidden="true"
            className="size-4 text-emerald-600"
          />
          Etapas 1 a 7 concluídas
        </div>

        <div className="grid items-end gap-12 lg:grid-cols-[1.4fr_0.8fr]">
          <div>
            <div className="bg-foreground text-background mb-5 flex size-12 items-center justify-center rounded-2xl shadow-lg">
              <WalletCards aria-hidden="true" className="size-6" />
            </div>
            <p className="mb-3 text-sm font-semibold tracking-[0.18em] text-emerald-700 uppercase">
              {siteConfig.name}
            </p>
            <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl">
              Clareza para cuidar do seu dinheiro todos os dias.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-8">
              {siteConfig.description} Crie sua conta com segurança e comece a
              preparar sua visão financeira.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cadastro"
                className={cn(buttonVariants(), "h-11 px-5")}
              >
                Criar conta
                <ArrowRight aria-hidden="true" data-icon="inline-end" />
              </Link>
              <Link
                href="/entrar"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 px-5",
                )}
              >
                Já tenho uma conta
              </Link>
            </div>
          </div>

          <aside className="bg-card/90 rounded-3xl border p-6 shadow-xl shadow-black/5 backdrop-blur">
            <p className="text-sm font-medium">Etapa atual</p>
            <p className="mt-2 text-2xl font-semibold">
              Dashboard financeiro disponível
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              Acompanhe saldos, pendências, alertas, gráficos e quanto ainda
              pode gastar por dia com uma estimativa conservadora.
            </p>
            <Link
              href="/dashboard"
              className={cn(buttonVariants(), "mt-6 h-11 w-full")}
            >
              Acessar área protegida
              <ArrowRight aria-hidden="true" data-icon="inline-end" />
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
