"use client";

import { startTransition, useActionState, useMemo } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { buttonVariants } from "@/components/ui/button";
import {
  createBudgetAction,
  updateBudgetAction,
} from "@/features/budgets/actions";
import { budgetSchema, type BudgetInput } from "@/features/budgets/schemas";
import { FinanceFormMessage } from "@/features/finance/components/finance-form-message";
import {
  FinanceField,
  FinanceSelect,
} from "@/features/finance/components/form-fields";
import { FormSubmit } from "@/features/finance/components/form-submit";
import { initialFinanceActionState } from "@/features/finance/types";
import { cn } from "@/lib/utils";

type BudgetFormProps = {
  budget?: BudgetInput & { id: string };
  categories: { id: string; name: string }[];
  defaultPeriod: string;
};

export function BudgetForm({
  budget,
  categories,
  defaultPeriod,
}: BudgetFormProps) {
  const action = useMemo(
    () =>
      budget ? updateBudgetAction.bind(null, budget.id) : createBudgetAction,
    [budget],
  );
  const [state, dispatch, pending] = useActionState(
    action,
    initialFinanceActionState,
  );
  const form = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget ?? {
      categoryId: "",
      periodMonth: `${defaultPeriod.slice(0, 7)}-01`,
      limitAmount: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const onSubmit = form.handleSubmit((values) => {
    startTransition(() => dispatch(values));
  });
  const periodMonth = useWatch({
    control: form.control,
    name: "periodMonth",
  });
  const fieldError = (name: keyof BudgetInput) =>
    form.formState.errors[name]?.message ?? state.fieldErrors?.[name]?.[0];

  return (
    <form className="space-y-6" noValidate onSubmit={onSubmit}>
      <FinanceFormMessage message={state.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FinanceSelect
            id="budget-category"
            label="Escopo"
            options={[
              { value: "", label: "Limite geral do mês" },
              ...categories.map((category) => ({
                value: category.id,
                label: category.name,
              })),
            ]}
            hint="O limite geral considera todas as despesas pagas."
            error={fieldError("categoryId")}
            disabled={pending}
            {...form.register("categoryId")}
          />
        </div>
        <FinanceField
          id="budget-period"
          label="Mês"
          type="month"
          error={fieldError("periodMonth")}
          disabled={pending}
          value={periodMonth.slice(0, 7)}
          onChange={(event) =>
            form.setValue("periodMonth", `${event.target.value}-01`, {
              shouldValidate: true,
            })
          }
        />
        <FinanceField
          id="budget-limit"
          label="Limite"
          inputMode="decimal"
          placeholder="Ex.: 1.500,00"
          error={fieldError("limitAmount")}
          disabled={pending}
          {...form.register("limitAmount")}
        />
      </div>
      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Link
          href={`/orcamentos?mes=${periodMonth.slice(0, 7)}`}
          className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}
        >
          Cancelar
        </Link>
        <FormSubmit
          pending={pending}
          idleLabel={budget ? "Salvar orçamento" : "Criar orçamento"}
          pendingLabel="Salvando…"
        />
      </div>
    </form>
  );
}
