import Link from "next/link";
import { CirclePlus, WalletCards } from "lucide-react";

import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { transactionKinds } from "@/features/transactions/options";
import { getTransactionOptions } from "@/features/transactions/queries";
import type { TransactionInput } from "@/features/transactions/schemas";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nova movimentação",
  description: "Cadastro de receita, despesa ou transferência no MeuSaldo.",
};

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string | string[] }>;
}) {
  const [options, params] = await Promise.all([
    getTransactionOptions(),
    searchParams,
  ]);
  const rawKind = Array.isArray(params.tipo) ? params.tipo[0] : params.tipo;
  const initialKind = transactionKinds.some(
    (option) => option.value === rawKind,
  )
    ? (rawKind as TransactionInput["kind"])
    : "expense";
  const activeAccounts = options.accounts.filter(
    (account) => !account.archivedAt,
  );

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <CirclePlus aria-hidden="true" className="size-5" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Nova movimentação
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          Registre uma receita, despesa ou transferência. Apenas movimentações
          pagas alteram o saldo atual das contas.
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
            <p className="text-muted-foreground mt-2 leading-6">
              Toda movimentação precisa estar vinculada a uma conta financeira
              ativa.
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
            <TransactionForm
              accounts={options.accounts}
              categories={options.categories}
              initialKind={initialKind}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
