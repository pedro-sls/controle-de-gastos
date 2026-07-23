import Link from "next/link";
import { CirclePlus, Pencil, Repeat2 } from "lucide-react";

import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteControl } from "@/features/finance/components/delete-control";
import { FinanceFormMessage } from "@/features/finance/components/finance-form-message";
import { formatMoney } from "@/features/finance/money";
import { deleteRecurrenceAction } from "@/features/recurrences/actions";
import { GenerationControl } from "@/features/recurrences/components/generation-control";
import { RecurrenceToggle } from "@/features/recurrences/components/recurrence-toggle";
import { getRecurrenceFrequencyLabel } from "@/features/recurrences/options";
import { getRecurrences } from "@/features/recurrences/queries";
import { formatDate } from "@/features/transactions/dates";
import {
  getPaymentMethodLabel,
  getTransactionStatusLabel,
} from "@/features/transactions/options";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Recorrências",
  description: "Movimentações recorrentes do MeuSaldo.",
};

const statusMessages: Record<string, string> = {
  criada: "Recorrência criada com sucesso.",
  atualizada: "Recorrência atualizada com sucesso.",
};

export default async function RecurringPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const [recurrences, params] = await Promise.all([
    getRecurrences(),
    searchParams,
  ]);
  const rawStatus = Array.isArray(params.status)
    ? params.status[0]
    : params.status;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.12em] text-emerald-800 uppercase dark:text-emerald-300">
            Recorrências
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Compromissos no ritmo certo
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
            Cadastre receitas e despesas repetidas e transforme ocorrências
            vencidas em lançamentos sem risco de duplicação.
          </p>
        </div>
        <Link
          href="/recorrencias/nova"
          className={cn(buttonVariants(), "h-11 px-5")}
        >
          <CirclePlus aria-hidden="true" />
          Nova recorrência
        </Link>
      </header>

      <FinanceFormMessage
        message={rawStatus ? statusMessages[rawStatus] : undefined}
        tone="success"
      />
      <GenerationControl />

      {recurrences.length === 0 ? (
        <Card className="border-dashed py-10 text-center">
          <CardContent className="mx-auto max-w-lg px-6">
            <Repeat2
              aria-hidden="true"
              className="text-muted-foreground mx-auto size-10"
            />
            <h2 className="mt-4 text-lg font-semibold">
              Nenhuma recorrência cadastrada
            </h2>
            <p className="text-muted-foreground mt-2 leading-6">
              Registre aluguel, salário, assinaturas e outros compromissos que
              se repetem.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {recurrences.map((item) => (
            <li key={item.id}>
              <Card className="h-full gap-5 rounded-2xl py-6 shadow-sm">
                <CardContent className="space-y-5 px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold break-words">
                          {item.input.description}
                        </h2>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            item.isActive
                              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {item.isActive ? "Ativa" : "Pausada"}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-2 text-sm">
                        {item.categoryName} · {item.accountName}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "shrink-0 text-lg font-semibold tabular-nums",
                        item.input.type === "income"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "",
                      )}
                    >
                      {item.input.type === "income" ? "+" : "−"}
                      {formatMoney(Number(item.input.amount.replace(",", ".")))}
                    </p>
                  </div>

                  <dl className="bg-muted/50 grid gap-3 rounded-xl p-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted-foreground">Frequência</dt>
                      <dd className="mt-1 font-medium">
                        {getRecurrenceFrequencyLabel(item.input.frequency)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">
                        Próxima ocorrência
                      </dt>
                      <dd className="mt-1 font-medium">
                        {formatDate(item.input.nextExecutionDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Estado gerado</dt>
                      <dd className="mt-1 font-medium">
                        {getTransactionStatusLabel(item.input.defaultStatus)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Pagamento</dt>
                      <dd className="mt-1 font-medium">
                        {getPaymentMethodLabel(item.input.paymentMethod)}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    <Link
                      href={`/recorrencias/${item.id}/editar`}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-11",
                      )}
                    >
                      <Pencil aria-hidden="true" />
                      Editar
                    </Link>
                    <RecurrenceToggle id={item.id} active={item.isActive} />
                    <DeleteControl
                      action={deleteRecurrenceAction}
                      entryKind="recurrence"
                      id={item.id}
                      itemName={item.input.description}
                      itemKind="recorrência"
                    />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
