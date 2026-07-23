import Link from "next/link";
import { Repeat2, WalletCards } from "lucide-react";

import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RecurrenceForm } from "@/features/recurrences/components/recurrence-form";
import { getTransactionOptions } from "@/features/transactions/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Nova recorrência" };

export default async function NewRecurrencePage() {
  const options = await getTransactionOptions();
  const activeAccounts = options.accounts.filter((item) => !item.archivedAt);

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Repeat2 aria-hidden="true" className="size-5" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Nova recorrência
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          Configure o compromisso uma vez e gere os lançamentos de forma
          idempotente.
        </p>
      </header>
      {activeAccounts.length === 0 ? (
        <Card className="max-w-3xl border-dashed py-10 text-center">
          <CardContent className="mx-auto max-w-lg px-6">
            <WalletCards
              aria-hidden="true"
              className="text-muted-foreground mx-auto size-10"
            />
            <h2 className="mt-4 text-lg font-semibold">
              Cadastre uma conta primeiro
            </h2>
            <p className="text-muted-foreground mt-2">
              Toda recorrência precisa de uma conta ativa.
            </p>
            <Link
              href="/contas/nova"
              className={cn(buttonVariants(), "mt-5 h-11")}
            >
              Criar conta
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-3xl py-6 shadow-sm sm:py-8">
          <CardContent className="px-6 sm:px-8">
            <RecurrenceForm
              accounts={options.accounts}
              categories={options.categories}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
