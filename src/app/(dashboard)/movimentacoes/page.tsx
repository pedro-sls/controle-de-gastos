import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Pencil,
  Repeat2,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { deleteTransactionAction } from "@/features/transactions/actions";
import {
  buildTransactionHref,
  parseTransactionFilters,
  type TransactionSearchParams,
} from "@/features/transactions/filters";
import {
  getPaymentMethodLabel,
  getTransactionKindLabel,
  getTransactionStatusLabel,
  transactionKindFilters,
  transactionStatusFilters,
} from "@/features/transactions/options";
import { getTransactions } from "@/features/transactions/queries";
import { DeleteControl } from "@/features/finance/components/delete-control";
import { FinanceFormMessage } from "@/features/finance/components/finance-form-message";
import { formatMoney } from "@/features/finance/money";
import { getFinanceIcon } from "@/features/finance/options";
import { formatDate } from "@/features/transactions/dates";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Movimentações",
  description: "Receitas, despesas e transferências do MeuSaldo.",
};

type TransactionsPageProps = {
  searchParams: Promise<TransactionSearchParams>;
};

const statusMessages: Record<string, string> = {
  criada: "Movimentação criada com sucesso.",
  atualizada: "Movimentação atualizada com sucesso.",
};

const filterControlClass =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3";

function statusClass(status: string) {
  if (status === "paid") {
    return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";
  }
  if (status === "overdue") {
    return "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200";
  }
  if (status === "pending") {
    return "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-200";
  }
  return "bg-muted text-muted-foreground";
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const rawParams = await searchParams;
  const filters = parseTransactionFilters(rawParams);
  const result = await getTransactions(filters);
  const rawStatus = Array.isArray(rawParams.status)
    ? rawParams.status[0]
    : rawParams.status;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.12em] text-emerald-800 uppercase dark:text-emerald-300">
            Movimentações
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            O caminho do seu dinheiro
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
            Consulte receitas, despesas e transferências. Estados vencidos são
            calculados pelo banco conforme a data e o fuso configurado.
          </p>
        </div>
        <Link
          href="/movimentacoes/nova"
          className={cn(buttonVariants(), "h-11 px-5")}
        >
          <CirclePlus aria-hidden="true" />
          Nova movimentação
        </Link>
      </header>

      <FinanceFormMessage
        message={rawStatus ? statusMessages[rawStatus] : undefined}
        tone="success"
      />

      <Card className="gap-5 py-6 shadow-sm">
        <CardHeader className="px-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal aria-hidden="true" className="size-5" />
            <h2 className="font-semibold">Filtros</h2>
          </div>
        </CardHeader>
        <CardContent className="px-6">
          <form
            action="/movimentacoes"
            method="get"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <label className="space-y-2 sm:col-span-2 xl:col-span-2">
              <span className="text-sm font-medium">Buscar descrição</span>
              <span className="relative block">
                <Search
                  aria-hidden="true"
                  className="text-muted-foreground absolute top-3 left-3 size-5"
                />
                <input
                  name="busca"
                  defaultValue={filters.search}
                  maxLength={80}
                  placeholder="Ex.: mercado, salário ou reserva"
                  className={cn(filterControlClass, "pl-10")}
                />
              </span>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Tipo</span>
              <select
                name="tipo"
                defaultValue={filters.kind}
                className={filterControlClass}
              >
                {transactionKindFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Estado</span>
              <select
                name="estado"
                defaultValue={filters.status}
                className={filterControlClass}
              >
                {transactionStatusFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Conta</span>
              <select
                name="conta"
                defaultValue={filters.accountId}
                className={filterControlClass}
              >
                <option value="">Todas as contas</option>
                {result.accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Categoria</span>
              <select
                name="categoria"
                defaultValue={filters.categoryId}
                className={filterControlClass}
              >
                <option value="">Todas as categorias</option>
                {result.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} · {getTransactionKindLabel(category.type)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">De</span>
              <input
                type="date"
                name="de"
                defaultValue={filters.from}
                className={filterControlClass}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Até</span>
              <input
                type="date"
                name="ate"
                defaultValue={filters.to}
                className={filterControlClass}
              />
            </label>
            <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:justify-end xl:col-span-4">
              <Link
                href="/movimentacoes"
                className={cn(buttonVariants({ variant: "outline" }), "h-11")}
              >
                Limpar filtros
              </Link>
              <button className={cn(buttonVariants(), "h-11")} type="submit">
                Aplicar filtros
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {result.total === 1
            ? "1 movimentação encontrada"
            : `${result.total} movimentações encontradas`}
        </p>
        {result.totalPages > 1 ? (
          <p className="text-muted-foreground text-sm">
            Página {result.page} de {result.totalPages}
          </p>
        ) : null}
      </div>

      {result.items.length === 0 ? (
        <Card className="border-dashed py-10 text-center">
          <CardContent className="mx-auto max-w-lg px-6">
            <Repeat2
              aria-hidden="true"
              className="text-muted-foreground mx-auto size-10"
            />
            <h2 className="mt-4 text-lg font-semibold">
              Nenhuma movimentação encontrada
            </h2>
            <p className="text-muted-foreground mt-2 leading-6">
              Ajuste os filtros ou registre a primeira receita, despesa ou
              transferência.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4">
          {result.items.map((item) => {
            const Icon =
              item.kind === "transfer"
                ? Repeat2
                : item.direction === "in"
                  ? ArrowDownLeft
                  : ArrowUpRight;
            const accountFrom =
              item.kind === "transfer" && item.direction === "in"
                ? item.destinationAccount
                : item.account;
            const accountTo =
              item.kind === "transfer" && item.direction === "in"
                ? item.account
                : item.destinationAccount;
            const CategoryIcon = getFinanceIcon(item.category?.icon);

            return (
              <li key={`${item.entryKind}-${item.editId}`}>
                <Card className="gap-5 rounded-2xl py-5 shadow-sm">
                  <CardContent className="flex flex-col gap-5 px-5 sm:px-6 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <span
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-xl",
                          item.direction === "in"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                            : "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
                        )}
                      >
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold break-words">
                            {item.description}
                          </h2>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium",
                              statusClass(item.effectiveStatus),
                            )}
                          >
                            {getTransactionStatusLabel(item.effectiveStatus)}
                          </span>
                          {item.isFixed ? (
                            <span className="bg-muted rounded-full px-2.5 py-1 text-xs font-medium">
                              Fixa
                            </span>
                          ) : null}
                        </div>
                        <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                          <span>{formatDate(item.transactionDate)}</span>
                          {item.kind === "transfer" ? (
                            <span>
                              {accountFrom?.name ?? "Conta de origem"} →{" "}
                              {accountTo?.name ?? "Conta de destino"}
                            </span>
                          ) : (
                            <>
                              <span>{item.account?.name ?? "Conta"}</span>
                              {item.category ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <CategoryIcon
                                    aria-hidden="true"
                                    className="size-4"
                                  />
                                  {item.category.name}
                                </span>
                              ) : null}
                              <span>
                                {getPaymentMethodLabel(item.paymentMethod)}
                              </span>
                            </>
                          )}
                          {item.dueDate ? (
                            <span>Vence em {formatDate(item.dueDate)}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:justify-end">
                      <p
                        className={cn(
                          "text-xl font-semibold tabular-nums",
                          item.direction === "in"
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-foreground",
                        )}
                      >
                        {item.direction === "in" ? "+" : "−"}
                        {formatMoney(item.amount)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/movimentacoes/${item.editId}/editar`}
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "h-11",
                          )}
                        >
                          <Pencil aria-hidden="true" />
                          Editar
                        </Link>
                        <DeleteControl
                          action={deleteTransactionAction}
                          entryKind={item.entryKind}
                          id={item.editId}
                          itemName={item.description}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {result.totalPages > 1 ? (
        <nav
          aria-label="Paginação de movimentações"
          className="flex items-center justify-between gap-4 border-t pt-6"
        >
          {result.page > 1 ? (
            <Link
              href={buildTransactionHref(filters, { page: result.page - 1 })}
              className={cn(buttonVariants({ variant: "outline" }), "h-11")}
            >
              <ChevronLeft aria-hidden="true" />
              Anterior
            </Link>
          ) : (
            <span />
          )}
          {result.page < result.totalPages ? (
            <Link
              href={buildTransactionHref(filters, { page: result.page + 1 })}
              className={cn(buttonVariants({ variant: "outline" }), "h-11")}
            >
              Próxima
              <ChevronRight aria-hidden="true" />
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
