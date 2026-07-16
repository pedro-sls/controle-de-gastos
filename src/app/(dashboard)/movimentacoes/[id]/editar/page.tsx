import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import {
  getEditableEntry,
  getTransactionOptions,
} from "@/features/transactions/queries";
import { transactionIdSchema } from "@/features/transactions/schemas";

export const metadata: Metadata = { title: "Editar movimentação" };

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!transactionIdSchema.safeParse(id).success) notFound();

  const [entry, options] = await Promise.all([
    getEditableEntry(id),
    getTransactionOptions(),
  ]);
  if (!entry) notFound();

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Pencil aria-hidden="true" className="size-5" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Editar movimentação
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          Ajuste valores, datas e estado. Transferências atualizam origem e
          destino juntas.
        </p>
      </header>
      <Card className="max-w-3xl py-6 shadow-sm sm:py-8">
        <CardContent className="px-6 sm:px-8">
          <TransactionForm
            accounts={options.accounts}
            categories={options.categories}
            entry={entry}
          />
        </CardContent>
      </Card>
    </div>
  );
}
