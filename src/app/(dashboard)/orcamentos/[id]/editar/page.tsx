import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { BudgetForm } from "@/features/budgets/components/budget-form";
import { getBudgetById } from "@/features/budgets/queries";
import { budgetIdSchema } from "@/features/budgets/schemas";
import { getCategories } from "@/features/categories/queries";
import { formatMoneyInput } from "@/features/finance/money";

export const metadata: Metadata = { title: "Editar orçamento" };

export default async function EditBudgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!budgetIdSchema.safeParse(id).success) notFound();
  const [budget, allCategories] = await Promise.all([
    getBudgetById(id),
    getCategories(),
  ]);
  if (!budget) notFound();
  const categories = allCategories
    .filter(
      (item) =>
        item.type === "expense" &&
        (!item.archivedAt || item.id === budget.categoryId),
    )
    .map(({ id: categoryId, name }) => ({ id: categoryId, name }));

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Pencil aria-hidden="true" className="size-5" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Editar orçamento
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          Ajuste o limite e acompanhe o novo progresso imediatamente.
        </p>
      </header>
      <Card className="max-w-3xl py-6 shadow-sm sm:py-8">
        <CardContent className="px-6 sm:px-8">
          <BudgetForm
            categories={categories}
            defaultPeriod={budget.periodMonth}
            budget={{
              id: budget.id,
              categoryId: budget.categoryId ?? "",
              periodMonth: budget.periodMonth,
              limitAmount: formatMoneyInput(budget.limitAmount),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
