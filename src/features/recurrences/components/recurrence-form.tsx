"use client";

import { startTransition, useActionState, useMemo } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  createRecurrenceAction,
  updateRecurrenceAction,
} from "@/features/recurrences/actions";
import { recurrenceFrequencies } from "@/features/recurrences/options";
import type { RecurrenceDTO } from "@/features/recurrences/queries";
import {
  recurrenceSchema,
  type RecurrenceInput,
} from "@/features/recurrences/schemas";
import type {
  CategoryOption,
  TransactionOption,
} from "@/features/transactions/queries";
import { cn } from "@/lib/utils";

import { FinanceFormMessage } from "../../finance/components/finance-form-message";
import {
  FinanceField,
  FinanceSelect,
  FinanceTextarea,
} from "../../finance/components/form-fields";
import { FormSubmit } from "../../finance/components/form-submit";
import { initialFinanceActionState } from "../../finance/types";
import { getToday } from "../../transactions/dates";
import {
  paymentMethods,
  transactionStatuses,
} from "../../transactions/options";

export function RecurrenceForm({
  accounts,
  categories,
  recurrence,
}: {
  accounts: TransactionOption[];
  categories: CategoryOption[];
  recurrence?: RecurrenceDTO;
}) {
  const today = getToday();
  const action = useMemo(
    () =>
      recurrence
        ? updateRecurrenceAction.bind(null, recurrence.id)
        : createRecurrenceAction,
    [recurrence],
  );
  const [state, dispatch, pending] = useActionState(
    action,
    initialFinanceActionState,
  );
  const form = useForm<RecurrenceInput>({
    resolver: zodResolver(recurrenceSchema),
    defaultValues: recurrence?.input ?? {
      type: "expense",
      accountId: "",
      categoryId: "",
      description: "",
      amount: "",
      frequency: "monthly",
      startDate: today,
      endDate: "",
      nextExecutionDate: today,
      defaultStatus: "pending",
      paymentMethod: "boleto",
      isFixed: true,
      note: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const type = useWatch({ control: form.control, name: "type" });
  const startDate = useWatch({ control: form.control, name: "startDate" });
  const visibleAccounts = accounts.filter(
    (item) => !item.archivedAt || item.id === recurrence?.input.accountId,
  );
  const visibleCategories = categories.filter(
    (item) =>
      item.type === type &&
      (!item.archivedAt || item.id === recurrence?.input.categoryId),
  );
  const fieldError = (name: keyof RecurrenceInput) =>
    form.formState.errors[name]?.message ?? state.fieldErrors?.[name]?.[0];
  const onSubmit = form.handleSubmit((values) => {
    startTransition(() =>
      dispatch({
        ...values,
        isFixed: values.type === "expense" && values.isFixed,
      }),
    );
  });

  return (
    <form className="space-y-6" noValidate onSubmit={onSubmit}>
      <FinanceFormMessage message={state.message} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FinanceSelect
          id="recurrence-type"
          label="Tipo"
          options={[
            { value: "expense", label: "Despesa" },
            { value: "income", label: "Receita" },
          ]}
          hint={
            recurrence
              ? "O tipo não pode ser alterado após a criação."
              : undefined
          }
          aria-disabled={Boolean(recurrence)}
          tabIndex={recurrence ? -1 : undefined}
          className={recurrence ? "pointer-events-none opacity-70" : undefined}
          error={fieldError("type")}
          disabled={pending}
          {...form.register("type")}
        />
        <FinanceField
          id="recurrence-amount"
          label="Valor"
          inputMode="decimal"
          placeholder="0,00"
          error={fieldError("amount")}
          disabled={pending}
          {...form.register("amount")}
        />
        <div className="sm:col-span-2">
          <FinanceField
            id="recurrence-description"
            label="Descrição"
            placeholder="Ex.: Aluguel mensal"
            error={fieldError("description")}
            disabled={pending}
            {...form.register("description")}
          />
        </div>
        <FinanceSelect
          id="recurrence-account"
          label="Conta"
          options={
            visibleAccounts.length
              ? visibleAccounts.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))
              : [{ value: "", label: "Nenhuma conta ativa" }]
          }
          error={fieldError("accountId")}
          disabled={pending}
          {...form.register("accountId")}
        />
        <FinanceSelect
          id="recurrence-category"
          label="Categoria"
          options={
            visibleCategories.length
              ? visibleCategories.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))
              : [{ value: "", label: "Nenhuma categoria ativa" }]
          }
          error={fieldError("categoryId")}
          disabled={pending}
          {...form.register("categoryId")}
        />
        <FinanceSelect
          id="recurrence-frequency"
          label="Frequência"
          options={recurrenceFrequencies}
          error={fieldError("frequency")}
          disabled={pending}
          {...form.register("frequency")}
        />
        <FinanceSelect
          id="recurrence-default-status"
          label="Estado dos lançamentos"
          options={transactionStatuses}
          error={fieldError("defaultStatus")}
          disabled={pending}
          {...form.register("defaultStatus")}
        />
        <FinanceField
          id="recurrence-start"
          label="Início"
          type="date"
          error={fieldError("startDate")}
          disabled={pending}
          {...form.register("startDate", {
            onChange: (event) => {
              if (!recurrence) {
                form.setValue("nextExecutionDate", event.target.value, {
                  shouldValidate: true,
                });
              }
            },
          })}
        />
        <FinanceField
          id="recurrence-end"
          label="Fim"
          type="date"
          required={false}
          min={startDate}
          error={fieldError("endDate")}
          disabled={pending}
          {...form.register("endDate")}
        />
        <FinanceField
          id="recurrence-next"
          label="Próxima ocorrência"
          type="date"
          hint="Avança automaticamente após a geração."
          min={startDate}
          error={fieldError("nextExecutionDate")}
          disabled={pending}
          {...form.register("nextExecutionDate")}
        />
        <FinanceSelect
          id="recurrence-payment"
          label="Forma de pagamento"
          options={paymentMethods}
          error={fieldError("paymentMethod")}
          disabled={pending}
          {...form.register("paymentMethod")}
        />
        {type === "expense" ? (
          <div className="flex items-center gap-3 self-end rounded-xl border px-4 py-3">
            <input
              id="recurrence-fixed"
              type="checkbox"
              className="accent-primary size-5"
              disabled={pending}
              {...form.register("isFixed")}
            />
            <Label htmlFor="recurrence-fixed">Despesa fixa</Label>
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <FinanceTextarea
            id="recurrence-note"
            label="Observações"
            required={false}
            placeholder="Informações adicionais (opcional)"
            error={fieldError("note")}
            disabled={pending}
            {...form.register("note")}
          />
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/recorrencias"
          className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}
        >
          Cancelar
        </Link>
        <FormSubmit
          pending={pending}
          idleLabel={recurrence ? "Salvar recorrência" : "Criar recorrência"}
          pendingLabel="Salvando…"
        />
      </div>
    </form>
  );
}
