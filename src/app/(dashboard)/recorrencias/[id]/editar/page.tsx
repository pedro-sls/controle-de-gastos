import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { RecurrenceForm } from "@/features/recurrences/components/recurrence-form";
import { getRecurrenceById } from "@/features/recurrences/queries";
import { recurrenceIdSchema } from "@/features/recurrences/schemas";
import { getTransactionOptions } from "@/features/transactions/queries";

export const metadata: Metadata = { title: "Editar recorrência" };

export default async function EditRecurrencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!recurrenceIdSchema.safeParse(id).success) notFound();
  const [recurrence, options] = await Promise.all([
    getRecurrenceById(id),
    getTransactionOptions(),
  ]);
  if (!recurrence) notFound();

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Pencil aria-hidden="true" className="size-5" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Editar recorrência
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          As alterações valem para ocorrências futuras; lançamentos já gerados
          preservam o histórico original.
        </p>
      </header>
      <Card className="max-w-3xl py-6 shadow-sm sm:py-8">
        <CardContent className="px-6 sm:px-8">
          <RecurrenceForm
            accounts={options.accounts}
            categories={options.categories}
            recurrence={recurrence}
          />
        </CardContent>
      </Card>
    </div>
  );
}
