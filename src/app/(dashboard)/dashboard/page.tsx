import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CirclePlus,
  Landmark,
  PiggyBank,
  ReceiptText,
  Repeat2,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthFormMessage } from "@/features/auth/components/auth-form-message";
import {
  CashFlowChart,
  ExpenseCategoryChart,
} from "@/features/dashboard/components/dashboard-charts";
import { getDashboardData } from "@/features/dashboard/queries";
import { formatMoney } from "@/features/finance/money";
import { formatDate } from "@/features/transactions/dates";
import {
  getTransactionKindLabel,
  getTransactionStatusLabel,
} from "@/features/transactions/options";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Visão geral financeira do MeuSaldo.",
};

type DashboardPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

const dashboardStatusMessages = {
  "conta-criada": {
    message: "Conta criada. Seu acesso já está ativo.",
    tone: "success",
  },
  "email-confirmado": {
    message: "E-mail confirmado. Sua conta está ativa e pronta para uso.",
    tone: "success",
  },
  "entrada-concluida": {
    message: "Login realizado. Que bom ter você de volta.",
    tone: "success",
  },
  "erro-logout": {
    message: "Não foi possível encerrar sua sessão. Tente novamente.",
    tone: "error",
  },
  "senha-alterada": {
    message: "Senha atualizada com sucesso.",
    tone: "success",
  },
} as const;

function summaryTone(value: number) {
  return value >= 0
    ? "text-emerald-700 dark:text-emerald-300"
    : "text-red-700 dark:text-red-300";
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const [dashboard, params] = await Promise.all([
    getDashboardData(),
    searchParams,
  ]);
  const normalizedStatus = Array.isArray(params.status)
    ? params.status[0]
    : params.status;
  const statusMessage =
    normalizedStatus && normalizedStatus in dashboardStatusMessages
      ? dashboardStatusMessages[
          normalizedStatus as keyof typeof dashboardStatusMessages
        ]
      : undefined;
  const { snapshot, period } = dashboard;
  const netResult = snapshot.paid_income - snapshot.paid_expense;
  const hasCashFlow = snapshot.paid_income > 0 || snapshot.paid_expense > 0;
  const hasAlerts =
    snapshot.overdue_count > 0 ||
    snapshot.upcoming_count > 0 ||
    snapshot.negative_accounts > 0 ||
    (dashboard.availableForPeriod === 0 && snapshot.paid_expense > 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.12em] text-emerald-800 uppercase dark:text-emerald-300">
            Visão geral · {period.label}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Seu dinheiro, sem surpresas
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
            Totais pagos, compromissos e tendências do período financeiro atual,
            calculados diretamente a partir dos seus registros.
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

      <div className="max-w-xl">
        <AuthFormMessage
          message={statusMessage?.message}
          tone={statusMessage?.tone}
        />
      </div>

      {!dashboard.hasAccounts ? (
        <Card className="border-dashed py-10 text-center">
          <CardContent className="mx-auto max-w-xl px-6">
            <WalletCards
              aria-hidden="true"
              className="text-muted-foreground mx-auto size-11"
            />
            <h2 className="mt-4 text-xl font-semibold">
              Comece cadastrando uma conta
            </h2>
            <p className="text-muted-foreground mt-2 leading-7">
              O dashboard será preenchido automaticamente quando você registrar
              sua primeira conta e as movimentações dela.
            </p>
            <Link
              href="/contas/nova"
              className={cn(buttonVariants(), "mt-6 h-11")}
            >
              Criar primeira conta
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-950 to-emerald-800 py-0 text-white shadow-xl dark:border-emerald-900">
            <CardContent className="grid gap-8 px-6 py-7 sm:px-8 sm:py-9 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-100">
                  <PiggyBank aria-hidden="true" className="size-5" />
                  Disponível para gastar por dia
                </div>
                <p className="mt-4 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                  {formatMoney(dashboard.dailyAvailable)}
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-100">
                  Estimativa conservadora: considera apenas receitas pagas,
                  desconta despesas pagas e reserva compromissos até o fim do
                  período. Receitas pendentes não entram no cálculo.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm text-emerald-100">Restante do período</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {formatMoney(dashboard.availableForPeriod)}
                </p>
                <p className="mt-2 text-sm text-emerald-100">
                  {period.daysRemaining === 1
                    ? "Último dia do período"
                    : `${period.daysRemaining} dias restantes`}
                </p>
              </div>
            </CardContent>
          </Card>

          <section aria-labelledby="summary-title" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold tracking-[0.1em] text-emerald-800 uppercase dark:text-emerald-300">
                  Resumo
                </p>
                <h2 id="summary-title" className="mt-2 text-2xl font-semibold">
                  Números do período
                </h2>
              </div>
              <span className="text-muted-foreground text-sm">
                {period.label}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card className="gap-4 py-5 shadow-sm">
                <CardContent className="px-5">
                  <Landmark
                    aria-hidden="true"
                    className="size-5 text-blue-700 dark:text-blue-300"
                  />
                  <p className="text-muted-foreground mt-4 text-sm">
                    Saldo em contas ativas
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {formatMoney(snapshot.total_balance)}
                  </p>
                </CardContent>
              </Card>
              <Card className="gap-4 py-5 shadow-sm">
                <CardContent className="px-5">
                  <TrendingUp
                    aria-hidden="true"
                    className="size-5 text-emerald-700 dark:text-emerald-300"
                  />
                  <p className="text-muted-foreground mt-4 text-sm">
                    Receitas pagas
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-emerald-700 tabular-nums dark:text-emerald-300">
                    {formatMoney(snapshot.paid_income)}
                  </p>
                </CardContent>
              </Card>
              <Card className="gap-4 py-5 shadow-sm">
                <CardContent className="px-5">
                  <TrendingDown
                    aria-hidden="true"
                    className="size-5 text-orange-700 dark:text-orange-300"
                  />
                  <p className="text-muted-foreground mt-4 text-sm">
                    Despesas pagas
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {formatMoney(snapshot.paid_expense)}
                  </p>
                </CardContent>
              </Card>
              <Card className="gap-4 py-5 shadow-sm">
                <CardContent className="px-5">
                  <ReceiptText
                    aria-hidden="true"
                    className="size-5 text-violet-700 dark:text-violet-300"
                  />
                  <p className="text-muted-foreground mt-4 text-sm">
                    Resultado do período
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-2xl font-semibold tabular-nums",
                      summaryTone(netResult),
                    )}
                  >
                    {formatMoney(netResult)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section
            aria-labelledby="pending-title"
            className="grid gap-4 lg:grid-cols-2"
          >
            <Card className="py-6 shadow-sm">
              <CardHeader className="px-6">
                <p className="text-muted-foreground text-sm">A receber</p>
                <h2 className="text-2xl font-semibold text-emerald-700 tabular-nums dark:text-emerald-300">
                  {formatMoney(snapshot.pending_income)}
                </h2>
              </CardHeader>
              <CardContent className="px-6">
                <p className="text-muted-foreground text-sm leading-6">
                  Receitas pendentes são exibidas para acompanhamento, mas não
                  aumentam o valor disponível.
                </p>
              </CardContent>
            </Card>
            <Card className="py-6 shadow-sm">
              <CardHeader className="px-6">
                <p className="text-muted-foreground text-sm">A pagar</p>
                <h2
                  id="pending-title"
                  className="text-2xl font-semibold tabular-nums"
                >
                  {formatMoney(snapshot.pending_expense)}
                </h2>
              </CardHeader>
              <CardContent className="px-6">
                <p className="text-muted-foreground text-sm leading-6">
                  {formatMoney(snapshot.committed_expense)} vencem até o fim
                  deste período e já estão reservados na estimativa diária.
                </p>
              </CardContent>
            </Card>
          </section>

          {hasAlerts ? (
            <section aria-labelledby="alerts-title" className="space-y-4">
              <div>
                <p className="text-sm font-semibold tracking-[0.1em] text-amber-800 uppercase dark:text-amber-300">
                  Atenção
                </p>
                <h2 id="alerts-title" className="mt-2 text-2xl font-semibold">
                  Alertas financeiros
                </h2>
              </div>
              <ul className="grid gap-4 lg:grid-cols-2">
                {snapshot.overdue_count > 0 ? (
                  <li className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-950 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0"
                      />
                      <div>
                        <p className="font-semibold">
                          {snapshot.overdue_count}{" "}
                          {snapshot.overdue_count === 1
                            ? "despesa vencida"
                            : "despesas vencidas"}
                        </p>
                        <p className="mt-1 text-sm leading-6">
                          Total de {formatMoney(snapshot.overdue_expense)}{" "}
                          aguardando pagamento.
                        </p>
                      </div>
                    </div>
                  </li>
                ) : null}
                {snapshot.upcoming_count > 0 ? (
                  <li className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                    <div className="flex items-start gap-3">
                      <CalendarClock
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0"
                      />
                      <div>
                        <p className="font-semibold">
                          {snapshot.upcoming_count}{" "}
                          {snapshot.upcoming_count === 1
                            ? "conta vence"
                            : "contas vencem"}{" "}
                          em até 7 dias
                        </p>
                        <p className="mt-1 text-sm leading-6">
                          Reserve {formatMoney(snapshot.upcoming_expense)} para
                          esses compromissos.
                        </p>
                      </div>
                    </div>
                  </li>
                ) : null}
                {snapshot.negative_accounts > 0 ? (
                  <li className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-orange-950 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-100">
                    <div className="flex items-start gap-3">
                      <WalletCards
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0"
                      />
                      <div>
                        <p className="font-semibold">
                          {snapshot.negative_accounts}{" "}
                          {snapshot.negative_accounts === 1
                            ? "conta está negativa"
                            : "contas estão negativas"}
                        </p>
                        <p className="mt-1 text-sm leading-6">
                          Consulte os saldos e priorize a regularização.
                        </p>
                      </div>
                    </div>
                  </li>
                ) : null}
                {dashboard.availableForPeriod === 0 &&
                snapshot.paid_expense > 0 ? (
                  <li className="rounded-2xl border p-5">
                    <div className="flex items-start gap-3">
                      <PiggyBank
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0"
                      />
                      <div>
                        <p className="font-semibold">
                          Limite conservador atingido
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm leading-6">
                          As despesas pagas e reservadas já alcançaram as
                          receitas confirmadas do período.
                        </p>
                      </div>
                    </div>
                  </li>
                ) : null}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="charts-title" className="space-y-4">
            <div>
              <p className="text-sm font-semibold tracking-[0.1em] text-emerald-800 uppercase dark:text-emerald-300">
                Tendências
              </p>
              <h2 id="charts-title" className="mt-2 text-2xl font-semibold">
                Como o período está evoluindo
              </h2>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="py-6 shadow-sm">
                <CardHeader className="px-6">
                  <h3 className="font-semibold">Fluxo diário</h3>
                  <p className="text-muted-foreground text-sm">
                    Somente receitas e despesas pagas.
                  </p>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  {hasCashFlow ? (
                    <CashFlowChart data={dashboard.cashFlow} />
                  ) : (
                    <div className="text-muted-foreground flex h-72 items-center justify-center rounded-xl border border-dashed px-6 text-center text-sm">
                      Registre uma movimentação paga para visualizar o fluxo.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="py-6 shadow-sm">
                <CardHeader className="px-6">
                  <h3 className="font-semibold">Despesas por categoria</h3>
                  <p className="text-muted-foreground text-sm">
                    Participação nas despesas pagas do período.
                  </p>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  {snapshot.expense_categories.length > 0 ? (
                    <>
                      <ExpenseCategoryChart
                        data={snapshot.expense_categories}
                      />
                      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                        {snapshot.expense_categories.map((category) => (
                          <li
                            key={category.id}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <span
                                aria-hidden="true"
                                className="size-2.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: category.color ?? "#64748B",
                                }}
                              />
                              <span className="truncate">{category.name}</span>
                            </span>
                            <span className="font-medium tabular-nums">
                              {formatMoney(category.amount)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <div className="text-muted-foreground flex h-72 items-center justify-center rounded-xl border border-dashed px-6 text-center text-sm">
                      As categorias aparecerão após a primeira despesa paga.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          <section aria-labelledby="recent-title" className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold tracking-[0.1em] text-emerald-800 uppercase dark:text-emerald-300">
                  Histórico
                </p>
                <h2 id="recent-title" className="mt-2 text-2xl font-semibold">
                  Movimentações recentes
                </h2>
              </div>
              <Link
                href="/movimentacoes"
                className={cn(buttonVariants({ variant: "outline" }), "h-11")}
              >
                Ver todas
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>

            {dashboard.recentTransactions.length > 0 ? (
              <Card className="gap-0 divide-y py-0 shadow-sm">
                {dashboard.recentTransactions.map((item) => {
                  const Icon =
                    item.kind === "transfer"
                      ? Repeat2
                      : item.direction === "in"
                        ? ArrowDownLeft
                        : ArrowUpRight;
                  return (
                    <div
                      key={`${item.entryKind}-${item.editId}`}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-xl">
                          <Icon aria-hidden="true" className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {item.description}
                          </p>
                          <p className="text-muted-foreground mt-1 text-sm">
                            {getTransactionKindLabel(item.kind)} ·{" "}
                            {formatDate(item.transactionDate)} ·{" "}
                            {getTransactionStatusLabel(item.effectiveStatus)}
                          </p>
                        </div>
                      </div>
                      <p
                        className={cn(
                          "font-semibold tabular-nums",
                          item.direction === "in"
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-foreground",
                        )}
                      >
                        {item.direction === "in" ? "+" : "−"}
                        {formatMoney(item.amount)}
                      </p>
                    </div>
                  );
                })}
              </Card>
            ) : (
              <Card className="border-dashed py-8 text-center">
                <CardContent className="px-6">
                  <p className="text-muted-foreground">
                    Nenhuma movimentação registrada ainda.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}
