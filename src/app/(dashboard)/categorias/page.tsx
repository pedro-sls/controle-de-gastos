import Link from "next/link";
import { CirclePlus, Pencil, Tags } from "lucide-react";

import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { setCategoryArchivedAction } from "@/features/categories/actions";
import { getCategories } from "@/features/categories/queries";
import { ArchiveControl } from "@/features/finance/components/archive-control";
import { FilterTabs } from "@/features/finance/components/filter-tabs";
import { FinanceFormMessage } from "@/features/finance/components/finance-form-message";
import {
  getCategoryTypeLabel,
  getFinanceIcon,
} from "@/features/finance/options";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Categorias",
  description: "Categorias financeiras do MeuSaldo.",
};

type CategoriesPageProps = {
  searchParams: Promise<{
    status?: string | string[];
    situacao?: string | string[];
    tipo?: string | string[];
  }>;
};

const statusMessages: Record<string, string> = {
  criada: "Categoria criada com sucesso.",
  atualizada: "Categoria atualizada com sucesso.",
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const [categories, params] = await Promise.all([
    getCategories(),
    searchParams,
  ]);
  const rawType = first(params.tipo);
  const type = ["all", "expense", "income"].includes(rawType ?? "")
    ? (rawType as "all" | "expense" | "income")
    : "all";
  const rawSituation = first(params.situacao);
  const situation = ["active", "archived", "all"].includes(rawSituation ?? "")
    ? (rawSituation as "active" | "archived" | "all")
    : "active";
  const visibleCategories = categories.filter((category) => {
    const matchesType = type === "all" || category.type === type;
    const matchesSituation =
      situation === "all" ||
      (situation === "archived"
        ? Boolean(category.archivedAt)
        : !category.archivedAt);
    return matchesType && matchesSituation;
  });
  const url = (nextType: string, nextSituation: string) =>
    `/categorias?tipo=${nextType}&situacao=${nextSituation}`;
  const rawStatus = first(params.status);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-[0.12em] text-emerald-800 uppercase dark:text-emerald-300">
            Categorias
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Dê significado a cada valor
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-7">
            Separe receitas e despesas. As categorias padrão podem ser
            personalizadas e todo item arquivado continua preservando o
            histórico.
          </p>
        </div>
        <Link
          href="/categorias/nova"
          className={cn(buttonVariants(), "h-11 px-5")}
        >
          <CirclePlus aria-hidden="true" />
          Nova categoria
        </Link>
      </header>

      <FinanceFormMessage
        message={rawStatus ? statusMessages[rawStatus] : undefined}
        tone="success"
      />

      <div className="space-y-3">
        <FilterTabs
          label="Filtrar categorias por tipo"
          value={type}
          options={[
            {
              value: "all",
              label: "Todos os tipos",
              href: url("all", situation),
            },
            {
              value: "expense",
              label: "Despesas",
              href: url("expense", situation),
            },
            {
              value: "income",
              label: "Receitas",
              href: url("income", situation),
            },
          ]}
        />
        <FilterTabs
          label="Filtrar categorias por situação"
          value={situation}
          options={[
            { value: "active", label: "Ativas", href: url(type, "active") },
            {
              value: "archived",
              label: "Arquivadas",
              href: url(type, "archived"),
            },
            { value: "all", label: "Todas", href: url(type, "all") },
          ]}
        />
      </div>

      {visibleCategories.length === 0 ? (
        <Card className="border-dashed py-10 text-center">
          <CardContent className="mx-auto max-w-lg px-6">
            <Tags
              aria-hidden="true"
              className="text-muted-foreground mx-auto size-10"
            />
            <h2 className="mt-4 text-lg font-semibold">
              Nenhuma categoria neste filtro
            </h2>
            <p className="text-muted-foreground mt-2 leading-6">
              Ajuste os filtros ou crie uma categoria para organizar seus
              registros.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleCategories.map((category) => {
            const Icon = getFinanceIcon(category.icon);
            const archived = Boolean(category.archivedAt);

            return (
              <li key={category.id}>
                <Card className="h-full gap-4 rounded-2xl py-5 shadow-sm">
                  <CardContent className="space-y-4 px-5">
                    <div className="flex items-start gap-3">
                      <span
                        className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: category.color ?? "#737373" }}
                      >
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold">{category.name}</h2>
                          {category.isDefault ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                              Padrão
                            </span>
                          ) : null}
                          {archived ? (
                            <span className="bg-muted rounded-full px-2 py-0.5 text-xs font-medium">
                              Arquivada
                            </span>
                          ) : null}
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {getCategoryTypeLabel(category.type)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 border-t pt-4">
                      <Link
                        href={`/categorias/${category.id}/editar`}
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "h-11",
                        )}
                      >
                        <Pencil aria-hidden="true" />
                        Editar
                      </Link>
                      <ArchiveControl
                        action={setCategoryArchivedAction}
                        archived={archived}
                        id={category.id}
                        itemKind="categoria"
                        itemName={category.name}
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
