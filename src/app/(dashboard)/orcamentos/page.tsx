import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Pencil,
  Target,
} from "lucide-react";

import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatBudgetPeriod,
  getBudgetProgressWidth,
  getBudgetRemaining,
  getBudgetStatusLabel,
  shiftMonth,
  type BudgetStatus,
} from "@/features/budgets/calculations";
import { deleteBudgetAction } from "@/features/budgets/actions";
import { getBudgets } from "@/features/budgets/queries";
import { budgetPeriodSchema } from "@/features/budgets/schemas";
import { DeleteControl } from "@/features/finance/components/delete-control";
import { FinanceFormMessage } from "@/features/finance/components/finance-form-message";
import { formatMoney } from "@/features/finance/money";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Orçamentos",
  description: "Orçamentos mensais do MeuSaldo.",
};

const statusMessages: Record<string, string> = {
  criado: "Orçamento criado com sucesso.",
  atualizado: "Orçamento atualizado com sucesso.",
};

const statusClasses: Record<BudgetStatus, string> = {
  healthy:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  attention:
    "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  near_limit:
    "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  exceeded: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
};

const progressClasses: Record<BudgetStatus, string> = {
  healthy: "bg-emerald-600",
  attention: "bg-amber-500",
  near_limit: "bg-orange-600",
  exceeded: "bg-red-600",
};

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{
    mes?: string | string[];
    status?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const monthParam = Array.isArray(params.mes) ? params.mes[0] : params.mes;
  const periodMonth = budgetPeriodSchema.parse(monthParam ?? "");
  const budgets = await getBudgets(periodMonth);
  const rawStatus = Array.isArray(params.status)
    ? params.status[0]
    : params.status;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.12em] text-emerald-800 uppercase dark:text-emerald-300">
            Orçamentos
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Limites claros, decisões tranquilas
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
            Acompanhe despesas pagas no mês e receba alertas graduais antes de
            ultrapassar o valor planejado.
          </p>
        </div>
        <Link
          href={`/orcamentos/novo?mes=${periodMonth.slice(0, 7)}`}
          className={cn(buttonVariants(), "h-11 px-5")}
        >
          <CirclePlus aria-hidden="true" />
          Novo orçamento
        </Link>
      </header>

      <FinanceFormMessage
        message={rawStatus ? statusMessages[rawStatus] : undefined}
        tone="success"
      />

      <nav
        aria-label="Navegar entre meses"
        className="bg-card flex items-center justify-between gap-3 rounded-2xl border p-2 shadow-sm"
      >
        <Link
          href={`/orcamentos?mes=${shiftMonth(periodMonth, -1)}`}
          aria-label="Mês anterior"
          className={cn(buttonVariants({ variant: "ghost" }), "h-11")}
        >
          <ChevronLeft aria-hidden="true" />
          <span className="hidden sm:inline">Anterior</span>
        </Link>
        <h2 className="font-semibold capitalize">
          {formatBudgetPeriod(periodMonth)}
        </h2>
        <Link
          href={`/orcamentos?mes=${shiftMonth(periodMonth, 1)}`}
          aria-label="Próximo mês"
          className={cn(buttonVariants({ variant: "ghost" }), "h-11")}
        >
          <span className="hidden sm:inline">Próximo</span>
          <ChevronRight aria-hidden="true" />
        </Link>
      </nav>

      {budgets.length === 0 ? (
        <Card className="border-dashed py-10 text-center">
          <CardContent className="mx-auto max-w-lg px-6">
            <Target
              aria-hidden="true"
              className="text-muted-foreground mx-auto size-10"
            />
            <h2 className="mt-4 text-lg font-semibold">
              Nenhum limite para este mês
            </h2>
            <p className="text-muted-foreground mt-2 leading-6">
              Comece por um limite geral ou detalhe quanto pretende gastar em
              cada categoria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {budgets.map((budget) => {
            const remaining = getBudgetRemaining(
              budget.usedAmount,
              budget.limitAmount,
            );
            const label = budget.categoryName ?? "Limite geral";
            return (
              <li key={budget.id}>
                <Card className="h-full gap-5 rounded-2xl py-6 shadow-sm">
                  <CardContent className="space-y-5 px-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white"
                          style={{
                            backgroundColor: budget.categoryColor ?? "#059669",
                          }}
                        >
                          <Target aria-hidden="true" className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <h2 className="truncate font-semibold">{label}</h2>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {budget.categoryName
                              ? "Categoria de despesa"
                              : "Todas as despesas"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium",
                          statusClasses[budget.status],
                        )}
                      >
                        {getBudgetStatusLabel(budget.status)}
                      </span>
                    </div>

                    <div>
                      <div className="mb-2 flex items-end justify-between gap-3">
                        <p className="text-muted-foreground text-sm">
                          {formatMoney(budget.usedAmount)} de{" "}
                          {formatMoney(budget.limitAmount)}
                        </p>
                        <p className="font-semibold tabular-nums">
                          {budget.percentageUsed.toFixed(0)}%
                        </p>
                      </div>
                      <div
                        className="bg-muted h-3 overflow-hidden rounded-full"
                        role="progressbar"
                        aria-label={`Uso do orçamento ${label}`}
                        aria-valuenow={Math.round(budget.percentageUsed)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className={cn(
                            "h-full rounded-full transition-[width]",
                            progressClasses[budget.status],
                          )}
                          style={{
                            width: `${getBudgetProgressWidth(budget.percentageUsed)}%`,
                          }}
                        />
                      </div>
                      <p className="text-muted-foreground mt-3 text-sm">
                        {remaining >= 0
                          ? `Ainda disponíveis: ${formatMoney(remaining)}`
                          : `Acima do limite: ${formatMoney(Math.abs(remaining))}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 border-t pt-4">
                      <Link
                        href={`/orcamentos/${budget.id}/editar`}
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "h-11",
                        )}
                      >
                        <Pencil aria-hidden="true" />
                        Editar
                      </Link>
                      <DeleteControl
                        action={deleteBudgetAction}
                        entryKind="budget"
                        id={budget.id}
                        itemName={label}
                        itemKind="orçamento"
                      />
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
