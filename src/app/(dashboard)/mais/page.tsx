import Link from "next/link";

import type { Metadata } from "next";

import { moreNavigationItems } from "@/config/navigation";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Mais opções",
  description: "Outras áreas do MeuSaldo.",
};

export default async function MoreOptionsPage() {
  await requireUser();

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold tracking-[0.12em] text-emerald-800 uppercase dark:text-emerald-300">
          Navegação
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Mais opções
        </h1>
        <p className="text-muted-foreground mt-3 text-base leading-7">
          Acesse no celular todas as áreas disponíveis na barra lateral do
          computador.
        </p>
      </header>

      <nav aria-label="Outras áreas do aplicativo">
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {moreNavigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="bg-card text-card-foreground focus-visible:ring-ring flex min-h-24 items-center gap-4 rounded-2xl border p-4 shadow-sm transition-colors outline-none hover:border-emerald-300 hover:bg-emerald-50 focus-visible:ring-3 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span>
                    <span className="block font-semibold">{item.label}</span>
                    <span className="text-muted-foreground mt-1 block text-sm leading-5">
                      {item.description}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
