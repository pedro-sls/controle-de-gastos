"use client";

import { startTransition, useActionState, useMemo } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { buttonVariants } from "@/components/ui/button";
import {
  createAccountAction,
  updateAccountAction,
} from "@/features/accounts/actions";
import { accountSchema, type AccountInput } from "@/features/accounts/schemas";
import {
  accountIcons,
  accountTypes,
  financeColors,
} from "@/features/finance/options";
import { FinanceFormMessage } from "@/features/finance/components/finance-form-message";
import {
  FinanceField,
  FinanceSelect,
} from "@/features/finance/components/form-fields";
import { FormSubmit } from "@/features/finance/components/form-submit";
import { initialFinanceActionState } from "@/features/finance/types";
import { cn } from "@/lib/utils";

type AccountFormProps = {
  account?: {
    id: string;
    name: string;
    type: AccountInput["type"];
    initialBalance: string;
    institution: string;
    color: AccountInput["color"];
    icon: AccountInput["icon"];
  };
};

const colorOptions = financeColors.map((color) => ({
  value: color,
  label: color,
}));

export function AccountForm({ account }: AccountFormProps) {
  const action = useMemo(
    () =>
      account
        ? updateAccountAction.bind(null, account.id)
        : createAccountAction,
    [account],
  );
  const [state, dispatch, pending] = useActionState(
    action,
    initialFinanceActionState,
  );
  const form = useForm<AccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: account ?? {
      name: "",
      type: "checking",
      initialBalance: "0,00",
      institution: "",
      color: "#16A34A",
      icon: "WalletCards",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });
  const selectedColor = useWatch({ control: form.control, name: "color" });
  const onSubmit = form.handleSubmit((values) => {
    startTransition(() => dispatch(values));
  });
  const fieldError = (name: keyof AccountInput) =>
    form.formState.errors[name]?.message ?? state.fieldErrors?.[name]?.[0];

  return (
    <form className="space-y-6" noValidate onSubmit={onSubmit}>
      <FinanceFormMessage message={state.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FinanceField
            id="account-name"
            label="Nome da conta"
            placeholder="Ex.: Conta principal"
            autoComplete="off"
            error={fieldError("name")}
            disabled={pending}
            {...form.register("name")}
          />
        </div>
        <FinanceSelect
          id="account-type"
          label="Tipo"
          options={accountTypes}
          error={fieldError("type")}
          disabled={pending}
          {...form.register("type")}
        />
        <FinanceField
          id="initial-balance"
          label="Saldo inicial"
          inputMode="decimal"
          placeholder="0,00"
          hint="Pode ser negativo. O saldo atual será calculado a partir deste valor."
          error={fieldError("initialBalance")}
          disabled={pending}
          {...form.register("initialBalance")}
        />
        <div className="sm:col-span-2">
          <FinanceField
            id="institution"
            label="Instituição"
            placeholder="Ex.: Banco ou carteira"
            required={false}
            error={fieldError("institution")}
            disabled={pending}
            {...form.register("institution")}
          />
        </div>
        <FinanceSelect
          id="account-color"
          label="Cor"
          options={colorOptions}
          error={fieldError("color")}
          disabled={pending}
          style={{ borderLeftColor: selectedColor, borderLeftWidth: 8 }}
          {...form.register("color")}
        />
        <FinanceSelect
          id="account-icon"
          label="Ícone"
          options={accountIcons}
          error={fieldError("icon")}
          disabled={pending}
          {...form.register("icon")}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Link
          href="/contas"
          className={cn(buttonVariants({ variant: "outline" }), "h-11 px-5")}
        >
          Cancelar
        </Link>
        <FormSubmit
          pending={pending}
          idleLabel={account ? "Salvar conta" : "Criar conta"}
          pendingLabel="Salvando…"
        />
      </div>
    </form>
  );
}
