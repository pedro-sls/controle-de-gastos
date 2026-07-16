import Link from "next/link";
import { CirclePlus, Pencil, WalletCards } from "lucide-react";

import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { setAccountArchivedAction } from "@/features/accounts/actions";
import { getAccounts } from "@/features/accounts/queries";
import { ArchiveControl } from "@/features/finance/components/archive-control";
import { FilterTabs } from "@/features/finance/components/filter-tabs";
import { FinanceFormMessage } from "@/features/finance/components/finance-form-message";
import { formatMoney } from "@/features/finance/money";
import {
  getAccountTypeLabel,
  getFinanceIcon,
} from "@/features/finance/options";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contas",
  description: "Contas financeiras do MeuSaldo.",
};

type AccountsPageProps = {
  searchParams: Promise<{
    status?: string | string[];
    situacao?: string | string[];
  }>;
};

const statusMessages: Record<string, string> = {
  criada: "Conta criada com sucesso.",
  atualizada: "Conta atualizada com sucesso.",
};

export default async function AccountsPage({
  searchParams,
}: AccountsPageProps) {
  const [accounts, params] = await Promise.all([getAccounts(), searchParams]);
  const rawFilter = Array.isArray(params.situacao)
    ? params.situacao[0]
    : params.situacao;
  const filter = ["active", "archived", "all"].includes(rawFilter ?? "")
    ? (rawFilter as "active" | "archived" | "all")
    : "active";
  const rawStatus = Array.isArray(params.status)
    ? params.status[0]
    : params.status;
  const visibleAccounts = accounts.filter((account) => {
    if (filter === "all") return true;
    return filter === "archived"
      ? Boolean(account.archivedAt)
      : !account.archivedAt;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.12em] text-emerald-800 uppercase dark:text-emerald-300">
            Contas financeiras
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Onde seu dinheiro acontece
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
            O saldo atual é calculado a partir do saldo inicial e das
            movimentações pagas, sem manter cópias que possam ficar
            inconsistentes.
          </p>
        </div>
        <Link href="/contas/nova" className={cn(buttonVariants(), "h-11 px-5")}>
          <CirclePlus aria-hidden="true" />
          Nova conta
        </Link>
      </header>

      <FinanceFormMessage
        message={rawStatus ? statusMessages[rawStatus] : undefined}
        tone="success"
      />

      <FilterTabs
        label="Filtrar contas por situação"
        value={filter}
        options={[
          { value: "active", label: "Ativas", href: "/contas?situacao=active" },
          {
            value: "archived",
            label: "Arquivadas",
            href: "/contas?situacao=archived",
          },
          { value: "all", label: "Todas", href: "/contas?situacao=all" },
        ]}
      />

      {visibleAccounts.length === 0 ? (
        <Card className="border-dashed py-10 text-center">
          <CardContent className="mx-auto max-w-lg px-6">
            <WalletCards
              aria-hidden="true"
              className="text-muted-foreground mx-auto size-10"
            />
            <h2 className="mt-4 text-lg font-semibold">
              {filter === "archived"
                ? "Nenhuma conta arquivada"
                : "Crie sua primeira conta"}
            </h2>
            <p className="text-muted-foreground mt-2 leading-6">
              {filter === "archived"
                ? "Contas arquivadas aparecerão aqui e poderão ser reativadas."
                : "Cadastre uma conta bancária, carteira ou dinheiro para começar."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visibleAccounts.map((account) => {
            const Icon = getFinanceIcon(account.icon);
            const archived = Boolean(account.archivedAt);

            return (
              <li key={account.id}>
                <Card className="h-full gap-5 rounded-2xl py-6 shadow-sm">
                  <CardHeader className="flex-row items-start justify-between gap-4 px-6">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: account.color ?? "#16A34A" }}
                      >
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">
                          {account.name}
                        </h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {account.institution ||
                            getAccountTypeLabel(account.type)}
                        </p>
                      </div>
                    </div>
                    {archived ? (
                      <span className="bg-muted rounded-full px-2.5 py-1 text-xs font-medium">
                        Arquivada
                      </span>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-5 px-6">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Saldo atual
                      </p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums">
                        {formatMoney(account.currentBalance)}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                        Saldo inicial: {formatMoney(account.initialBalance)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 border-t pt-4">
                      <Link
                        href={`/contas/${account.id}/editar`}
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "h-11",
                        )}
                      >
                        <Pencil aria-hidden="true" />
                        Editar
                      </Link>
                      <ArchiveControl
                        action={setAccountArchivedAction}
                        archived={archived}
                        id={account.id}
                        itemKind="conta"
                        itemName={account.name}
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
