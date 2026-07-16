"use client";

import { startTransition, useActionState, useMemo } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { buttonVariants } from "@/components/ui/button";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/features/categories/actions";
import {
  categorySchema,
  type CategoryInput,
} from "@/features/categories/schemas";
import { FinanceFormMessage } from "@/features/finance/components/finance-form-message";
import {
  FinanceField,
  FinanceSelect,
} from "@/features/finance/components/form-fields";
import { FormSubmit } from "@/features/finance/components/form-submit";
import {
  categoryIcons,
  categoryTypes,
  financeColors,
} from "@/features/finance/options";
import { initialFinanceActionState } from "@/features/finance/types";
import { cn } from "@/lib/utils";

type CategoryFormProps = {
  category?: {
    id: string;
    name: string;
    type: CategoryInput["type"];
    color: CategoryInput["color"];
    icon: CategoryInput["icon"];
    isDefault: boolean;
  };
};

const colorOptions = financeColors.map((color) => ({
  value: color,
  label: color,
}));

export function CategoryForm({ category }: CategoryFormProps) {
  const action = useMemo(
    () =>
      category
        ? updateCategoryAction.bind(null, category.id)
        : createCategoryAction,
    [category],
  );
  const [state, dispatch, pending] = useActionState(
    action,
    initialFinanceActionState,
  );
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ?? {
      name: "",
      type: "expense",
      color: "#F97316",
      icon: "CircleEllipsis",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });
  const selectedColor = useWatch({ control: form.control, name: "color" });
  const onSubmit = form.handleSubmit((values) => {
    startTransition(() => dispatch(values));
  });
  const fieldError = (name: keyof CategoryInput) =>
    form.formState.errors[name]?.message ?? state.fieldErrors?.[name]?.[0];

  return (
    <form className="space-y-6" noValidate onSubmit={onSubmit}>
      <FinanceFormMessage message={state.message} />

      {category?.isDefault ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          Esta categoria foi criada automaticamente. Você pode personalizar
          nome, cor e ícone; o tipo permanece protegido para preservar o
          histórico.
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FinanceField
            id="category-name"
            label="Nome da categoria"
            placeholder="Ex.: Mercado"
            autoComplete="off"
            error={fieldError("name")}
            disabled={pending}
            {...form.register("name")}
          />
        </div>
        <FinanceSelect
          id="category-type"
          label="Tipo"
          options={categoryTypes}
          hint={
            category
              ? "O tipo não pode ser alterado após a criação."
              : undefined
          }
          error={fieldError("type")}
          disabled={pending}
          aria-disabled={Boolean(category)}
          tabIndex={category ? -1 : undefined}
          className={category ? "pointer-events-none opacity-70" : undefined}
          {...form.register("type")}
        />
        <FinanceSelect
          id="category-color"
          label="Cor"
          options={colorOptions}
          error={fieldError("color")}
          disabled={pending}
          style={{ borderLeftColor: selectedColor, borderLeftWidth: 8 }}
          {...form.register("color")}
        />
        <div className="sm:col-span-2">
          <FinanceSelect
            id="category-icon"
            label="Ícone"
            options={categoryIcons}
            error={fieldError("icon")}
            disabled={pending}
            {...form.register("icon")}
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/categorias"
          className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}
        >
          Cancelar
        </Link>
        <FormSubmit
          pending={pending}
          idleLabel={category ? "Salvar categoria" : "Criar categoria"}
          pendingLabel="Salvando…"
        />
      </div>
    </form>
  );
}
