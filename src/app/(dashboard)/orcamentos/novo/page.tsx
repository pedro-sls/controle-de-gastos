import { Target } from "lucide-react";

import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { BudgetForm } from "@/features/budgets/components/budget-form";
import { budgetPeriodSchema } from "@/features/budgets/schemas";
import { getCategories } from "@/features/categories/queries";

export const metadata: Metadata = { title: "Novo orçamento" };

export default async function NewBudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string | string[] }>;
}) {
  const params = await searchParams;
  const month = Array.isArray(params.mes) ? params.mes[0] : params.mes;
  const period = budgetPeriodSchema.parse(month ?? "");
  const categories = (await getCategories())
    .filter((item) => item.type === "expense" && !item.archivedAt)
    .map(({ id, name }) => ({ id, name }));

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Target aria-hidden="true" className="size-5" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Novo orçamento
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          Defina um limite geral ou concentre o planejamento em uma categoria.
        </p>
      </header>
      <Card className="max-w-3xl py-6 shadow-sm sm:py-8">
        <CardContent className="px-6 sm:px-8">
          <BudgetForm categories={categories} defaultPeriod={period} />
        </CardContent>
      </Card>
    </div>
  );
}
