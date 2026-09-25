"use client";

import { startTransition, useActionState, useMemo } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/features/transactions/actions";
import type {
  CategoryOption,
  EditableEntry,
  TransactionOption,
} from "@/features/transactions/queries";
import {
  transactionSchema,
  type TransactionInput,
} from "@/features/transactions/schemas";
import { cn } from "@/lib/utils";

import { FinanceFormMessage } from "../../finance/components/finance-form-message";
import {
  FinanceField,
  FinanceSelect,
  FinanceTextarea,
} from "../../finance/components/form-fields";
import { FormSubmit } from "../../finance/components/form-submit";
import { initialFinanceActionState } from "../../finance/types";
import { getToday } from "../dates";
import {
  paymentMethods,
  transactionKinds,
  transactionStatuses,
} from "../options";

type TransactionFormProps = {
  accounts: TransactionOption[];
  categories: CategoryOption[];
  entry?: EditableEntry;
  initialKind?: TransactionInput["kind"];
};

function optionLabel(name: string, archived: boolean) {
  return archived ? `${name} (arquivada)` : name;
}

export function TransactionForm({
  accounts,
  categories,
  entry,
  initialKind = "expense",
}: TransactionFormProps) {
  const today = getToday();
  const action = useMemo(
    () =>
      entry
        ? updateTransactionAction.bind(null, entry.id)
        : createTransactionAction,
    [entry],
  );
  const [state, dispatch, pending] = useActionState(
    action,
    initialFinanceActionState,
  );
  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: entry?.input ?? {
      kind: initialKind,
      accountId: "",
      destinationAccountId: "",
      categoryId: "",
      description: "",
      amount: "",
      transactionDate: today,
      dueDate: "",
      status: "paid",
      paidDate: today,
      paymentMethod: initialKind === "transfer" ? "bank_transfer" : "pix",
      isFixed: false,
      note: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });
  const kind = useWatch({ control: form.control, name: "kind" });
  const status = useWatch({ control: form.control, name: "status" });
  const accountId = useWatch({ control: form.control, name: "accountId" });
  const editing = Boolean(entry);

  const visibleAccounts = accounts.filter(
    (account) =>
      !account.archivedAt ||
      account.id === entry?.input.accountId ||
      account.id === entry?.input.destinationAccountId,
  );
  const accountOptions = visibleAccounts.length
    ? visibleAccounts.map((account) => ({
        value: account.id,
        label: optionLabel(account.name, Boolean(account.archivedAt)),
      }))
    : [{ value: "", label: "Nenhuma conta ativa" }];
  const destinationOptions = visibleAccounts
    .filter((account) => account.id !== accountId)
    .map((account) => ({
      value: account.id,
      label: optionLabel(account.name, Boolean(account.archivedAt)),
    }));
  const visibleCategories = categories.filter(
    (category) =>
      category.type === kind &&
      (!category.archivedAt || category.id === entry?.input.categoryId),
  );
  const categoryOptions = visibleCategories.length
    ? visibleCategories.map((category) => ({
        value: category.id,
        label: optionLabel(category.name, Boolean(category.archivedAt)),
      }))
    : [{ value: "", label: "Nenhuma categoria ativa" }];

  const fieldError = (name: keyof TransactionInput) =>
    form.formState.errors[name]?.message ?? state.fieldErrors?.[name]?.[0];
  const onSubmit = form.handleSubmit((values) => {
    const normalized: TransactionInput = {
      ...values,
      destinationAccountId:
        values.kind === "transfer" ? values.destinationAccountId : "",
      categoryId: values.kind === "transfer" ? "" : values.categoryId,
      paidDate: values.status === "paid" ? values.paidDate : "",
      paymentMethod:
        values.kind === "transfer" ? "bank_transfer" : values.paymentMethod,
      isFixed: values.kind === "expense" ? values.isFixed : false,
    };
    startTransition(() => dispatch(normalized));
  });

  return (
    <form className="space-y-6" noValidate onSubmit={onSubmit}>
      <FinanceFormMessage message={state.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <FinanceSelect
          id="transaction-kind"
          label="Tipo"
          options={transactionKinds}
          hint={editing ? "O tipo não pode ser alterado na edição." : undefined}
          error={fieldError("kind")}
          disabled={pending}
          aria-disabled={editing}
          tabIndex={editing ? -1 : undefined}
          className={editing ? "pointer-events-none opacity-70" : undefined}
          {...form.register("kind")}
        />
        <FinanceField
          id="transaction-amount"
          label="Valor"
          inputMode="decimal"
          placeholder="0,00"
          error={fieldError("amount")}
          disabled={pending}
          {...form.register("amount")}
        />

        <div className="sm:col-span-2">
          <FinanceField
            id="transaction-description"
            label="Descrição"
            placeholder={
              kind === "transfer" ? "Ex.: Reserva mensal" : "Ex.: Supermercado"
            }
            autoComplete="off"
            error={fieldError("description")}
            disabled={pending}
            {...form.register("description")}
          />
        </div>

        <FinanceSelect
          id="transaction-account"
          label={kind === "transfer" ? "Conta de origem" : "Conta"}
          options={accountOptions}
          error={fieldError("accountId")}
          disabled={pending}
          {...form.register("accountId")}
        />

        {kind === "transfer" ? (
          <FinanceSelect
            id="transaction-destination"
            label="Conta de destino"
            options={
              destinationOptions.length
                ? destinationOptions
                : [{ value: "", label: "Cadastre outra conta ativa" }]
            }
            error={fieldError("destinationAccountId")}
            disabled={pending}
            {...form.register("destinationAccountId")}
          />
        ) : (
          <FinanceSelect
            id="transaction-category"
            label="Categoria"
            options={categoryOptions}
            error={fieldError("categoryId")}
            disabled={pending}
            {...form.register("categoryId")}
          />
        )}

        <FinanceField
          id="transaction-date"
          label="Data da movimentação"
          type="date"
          error={fieldError("transactionDate")}
          disabled={pending}
          {...form.register("transactionDate")}
        />
        <FinanceField
          id="transaction-due-date"
          label="Vencimento"
          type="date"
          required={false}
          error={fieldError("dueDate")}
          disabled={pending}
          {...form.register("dueDate")}
        />

        <FinanceSelect
          id="transaction-status"
          label="Estado"
          options={transactionStatuses}
          error={fieldError("status")}
          disabled={pending}
          {...form.register("status")}
        />
        {kind !== "transfer" ? (
          <FinanceSelect
            id="transaction-payment-method"
            label="Forma de pagamento"
            options={paymentMethods}
            error={fieldError("paymentMethod")}
            disabled={pending}
            {...form.register("paymentMethod")}
          />
        ) : (
          <div className="bg-muted/50 rounded-xl border p-4 text-sm leading-6 sm:self-end">
            A transferência atualiza as duas contas em uma única operação.
          </div>
        )}

        {status === "paid" ? (
          <FinanceField
            id="transaction-paid-date"
            label="Data do pagamento"
            type="date"
            error={fieldError("paidDate")}
            disabled={pending}
            {...form.register("paidDate")}
          />
        ) : null}

        {kind === "expense" ? (
          <div className="flex items-center gap-3 self-end rounded-xl border px-4 py-3">
            <input
              id="transaction-fixed"
              type="checkbox"
              className="accent-primary size-5"
              disabled={pending}
              {...form.register("isFixed")}
            />
            <Label htmlFor="transaction-fixed" className="leading-5">
              Despesa fixa
            </Label>
          </div>
        ) : null}

        <div className="sm:col-span-2">
          <FinanceTextarea
            id="transaction-note"
            label="Observações"
            placeholder="Informações adicionais (opcional)"
            required={false}
            error={fieldError("note")}
            disabled={pending}
            {...form.register("note")}
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/movimentacoes"
          className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}
        >
          Cancelar
        </Link>
        <FormSubmit
          pending={pending}
          idleLabel={entry ? "Salvar movimentação" : "Criar movimentação"}
          pendingLabel="Salvando…"
        />
      </div>
    </form>
  );
}
