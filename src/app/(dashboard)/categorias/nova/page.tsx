import { Tags } from "lucide-react";

import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { CategoryForm } from "@/features/categories/components/category-form";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nova categoria" };

export default async function NewCategoryPage() {
  await requireUser();

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Tags aria-hidden="true" className="size-5" />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Nova categoria
        </h1>
        <p className="text-muted-foreground mt-3 leading-7">
          Escolha o tipo com atenção: receita e despesa não podem ser trocados
          depois.
        </p>
      </header>
      <Card className="max-w-3xl py-6 shadow-sm sm:py-8">
        <CardContent className="px-6 sm:px-8">
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  );
}
