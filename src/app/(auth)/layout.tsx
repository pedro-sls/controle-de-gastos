import Link from "next/link";
import { BarChart3, ShieldCheck, WalletCards } from "lucide-react";

import { siteConfig } from "@/config/site";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(32rem,0.82fr)]">
      <section className="relative hidden overflow-hidden bg-emerald-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.68_0.14_155_/_0.35),transparent_45%),radial-gradient(circle_at_bottom_right,oklch(0.52_0.12_190_/_0.25),transparent_42%)]"
        />
        <Link
          href="/"
          className="relative inline-flex w-fit items-center gap-3 rounded-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
            <WalletCards aria-hidden="true" className="size-5" />
          </span>
          <span className="text-lg">{siteConfig.name}</span>
        </Link>

        <div className="relative max-w-xl">
          <p className="mb-4 text-sm font-semibold tracking-[0.18em] text-emerald-200 uppercase">
            Sua vida financeira mais clara
          </p>
          <p className="text-4xl leading-tight font-semibold tracking-tight text-balance xl:text-5xl">
            Decisões melhores começam com uma visão simples do seu dinheiro.
          </p>
          <div className="mt-10 grid gap-4 text-sm text-emerald-50/90 xl:grid-cols-2">
            <div className="flex gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-emerald-300"
              />
              <span>Seus dados ficam isolados e protegidos por usuário.</span>
            </div>
            <div className="flex gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <BarChart3
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-emerald-300"
              />
              <span>Resumos diretos, sem exigir conhecimento financeiro.</span>
            </div>
          </div>
        </div>

        <p className="relative text-sm text-emerald-100/70">
          Controle pessoal, seguro e sem complicação.
        </p>
      </section>

      <section className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10 sm:px-8 lg:px-12">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,oklch(0.91_0.08_155),transparent_62%)] opacity-70"
        />
        <div className="flex w-full max-w-md flex-col items-center gap-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg font-semibold lg:hidden"
          >
            <span className="bg-foreground text-background flex size-9 items-center justify-center rounded-xl">
              <WalletCards aria-hidden="true" className="size-4" />
            </span>
            {siteConfig.name}
          </Link>
          {children}
          <p className="text-muted-foreground max-w-sm text-center text-xs leading-5">
            Nunca compartilhe sua senha ou códigos recebidos por e-mail.
          </p>
        </div>
      </section>
    </main>
  );
}
