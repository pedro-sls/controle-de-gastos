import { ChartPie, TrendingDown, TrendingUp, WalletCards } from "lucide-react";

import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  MonthlyReportChart,
  ReportCategoryChart,
} from "@/features/reports/components/report-charts";
import { getComparisonLabel } from "@/features/reports/calculations";
import { getReportData } from "@/features/reports/queries";
import { formatDate } from "@/features/transactions/dates";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Relatórios",
  description: "Relatórios financeiros do MeuSaldo.",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    inicio?: string | string[];
    fim?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const startDate = Array.isArray(params.inicio)
    ? params.inicio[0]
    : params.inicio;
  const endDate = Array.isArray(params.fim) ? params.fim[0] : params.fim;
  const report = await getReportData({ startDate, endDate });
  const { snapshot } = report;
  const money = new Intl.NumberFormat(report.locale, {
    style: "currency",
    currency: report.currency,
  });
  const result = snapshot.income - snapshot.expense;
  const previousResult = snapshot.previous_income - snapshot.previous_expense;
  const incomeComparison = getComparisonLabel(
    snapshot.income,
    snapshot.previous_income,
  );
  const expenseComparison = getComparisonLabel(
    snapshot.expense,
    snapshot.previous_expense,
    true,
  );
  const resultComparison = getComparisonLabel(result, previousResult);

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.12em] text-emerald-800 uppercase dark:text-emerald-300">
          Relatórios
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Do histórico para decisões melhores
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          Compare períodos equivalentes, observe a evolução mensal e descubra
          onde as despesas estão concentradas.
        </p>
      </header>

      <form className="bg-card grid gap-4 rounded-2xl border p-5 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-2">
          <label htmlFor="report-start" className="text-sm font-medium">
            Data inicial
          </label>
          <input
            id="report-start"
            name="inicio"
            type="date"
            required
            defaultValue={snapshot.period_start}
            className="border-input bg-background focus-visible:ring-ring/50 h-11 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="report-end" className="text-sm font-medium">
            Data final
          </label>
          <input
            id="report-end"
            name="fim"
            type="date"
            required
            defaultValue={snapshot.period_end}
            className="border-input bg-background focus-visible:ring-ring/50 h-11 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
          />
        </div>
        <Button type="submit" className="h-11 px-5">
          Atualizar relatório
        </Button>
      </form>

      <p className="text-muted-foreground text-sm">
        Período atual: {formatDate(snapshot.period_start)} a{" "}
        {formatDate(snapshot.period_end)} · comparação com{" "}
        {formatDate(snapshot.previous_start)} a{" "}
        {formatDate(snapshot.previous_end)}
      </p>

      <section aria-labelledby="report-summary" className="space-y-4">
        <h2 id="report-summary" className="sr-only">
          Resumo comparativo
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Receitas pagas",
              value: snapshot.income,
              comparison: incomeComparison,
              icon: TrendingUp,
              color: "text-emerald-700 dark:text-emerald-300",
            },
            {
              label: "Despesas pagas",
              value: snapshot.expense,
              comparison: expenseComparison,
              icon: TrendingDown,
              color: "text-orange-700 dark:text-orange-300",
            },
            {
              label: "Resultado",
              value: result,
              comparison: resultComparison,
              icon: WalletCards,
              color:
                result >= 0
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-red-700 dark:text-red-300",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="py-5 shadow-sm">
                <CardContent className="px-5">
                  <Icon
                    aria-hidden="true"
                    className={cn("size-5", item.color)}
                  />
                  <p className="text-muted-foreground mt-4 text-sm">
                    {item.label}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-2xl font-semibold tabular-nums",
                      item.color,
                    )}
                  >
                    {money.format(item.value)}
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-xs",
                      item.comparison.favorable === true
                        ? "text-emerald-700 dark:text-emerald-300"
                        : item.comparison.favorable === false
                          ? "text-red-700 dark:text-red-300"
                          : "text-muted-foreground",
                    )}
                  >
                    {item.comparison.text}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="py-6 shadow-sm lg:col-span-2">
          <CardHeader className="px-6">
            <h2 className="text-xl font-semibold">Evolução mensal</h2>
            <p className="text-muted-foreground text-sm">
              Somente movimentações pagas no período selecionado.
            </p>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <MonthlyReportChart
              data={snapshot.monthly}
              currency={report.currency}
              locale={report.locale}
            />
          </CardContent>
        </Card>

        <Card className="py-6 shadow-sm">
          <CardHeader className="px-6">
            <h2 className="text-xl font-semibold">Despesas por categoria</h2>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {snapshot.expense_categories.length ? (
              <ReportCategoryChart
                data={snapshot.expense_categories}
                currency={report.currency}
                locale={report.locale}
              />
            ) : (
              <div className="flex h-80 flex-col items-center justify-center text-center">
                <ChartPie
                  aria-hidden="true"
                  className="text-muted-foreground size-10"
                />
                <p className="mt-4 font-semibold">Sem despesas pagas</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  O gráfico será preenchido quando houver dados no período.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="py-6 shadow-sm">
          <CardHeader className="px-6">
            <h2 className="text-xl font-semibold">Compromissos pendentes</h2>
            <p className="text-muted-foreground text-sm">
              Valores com vencimento dentro do período.
            </p>
          </CardHeader>
          <CardContent className="space-y-5 px-6">
            <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950">
              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                A receber
              </p>
              <p className="mt-1 text-2xl font-semibold text-emerald-800 tabular-nums dark:text-emerald-200">
                {money.format(snapshot.pending_income)}
              </p>
            </div>
            <div className="bg-muted/60 rounded-xl p-4">
              <p className="text-muted-foreground text-sm">A pagar</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {money.format(snapshot.pending_expense)}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
