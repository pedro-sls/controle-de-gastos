import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { CategoryForm } from "@/features/categories/components/category-form";
import { getCategoryById } from "@/features/categories/queries";
import { categoryIdSchema } from "@/features/categories/schemas";
import {
  getCategoryIconValue,
  getFinanceColor,
} from "@/features/finance/options";

export const metadata: Metadata = { title: "Editar categoria" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!categoryIdSchema.safeParse(id).success) notFound();
  const category = await getCategoryById(id);
  if (!category) notFound();

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Pencil aria-hidden="true" className="size-5" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Editar categoria
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          Personalize “{category.name}” sem alterar seu significado histórico.
        </p>
      </header>
      <Card className="max-w-3xl py-6 shadow-sm sm:py-8">
        <CardContent className="px-6 sm:px-8">
          <CategoryForm
            category={{
              id: category.id,
              name: category.name,
              type: category.type,
              color: getFinanceColor(category.color, "#737373"),
              icon: getCategoryIconValue(category.icon),
              isDefault: category.isDefault,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
