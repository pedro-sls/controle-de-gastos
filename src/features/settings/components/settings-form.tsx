"use client";

import { startTransition, useActionState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { useForm, useWatch } from "react-hook-form";

import { updateSettingsAction } from "@/features/settings/actions";
import {
  currencyOptions,
  dateFormatOptions,
  localeOptions,
  themeOptions,
  timezoneOptions,
} from "@/features/settings/options";
import {
  settingsSchema,
  type SettingsInput,
} from "@/features/settings/schemas";

import { FinanceFormMessage } from "../../finance/components/finance-form-message";
import {
  FinanceField,
  FinanceSelect,
} from "../../finance/components/form-fields";
import { FormSubmit } from "../../finance/components/form-submit";
import { initialFinanceActionState } from "../../finance/types";

export function SettingsForm({ settings }: { settings: SettingsInput }) {
  const { setTheme } = useTheme();
  const [state, dispatch, pending] = useActionState(
    updateSettingsAction,
    initialFinanceActionState,
  );
  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const selectedTheme = useWatch({ control: form.control, name: "theme" });
  const onSubmit = form.handleSubmit((values) => {
    startTransition(() => dispatch(values));
  });
  useEffect(() => {
    if (state.status === "success") setTheme(selectedTheme);
  }, [selectedTheme, setTheme, state.status]);
  const fieldError = (name: keyof SettingsInput) =>
    form.formState.errors[name]?.message ?? state.fieldErrors?.[name]?.[0];

  return (
    <form className="space-y-6" noValidate onSubmit={onSubmit}>
      <FinanceFormMessage
        message={state.message}
        tone={state.status === "success" ? "success" : "error"}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FinanceField
            id="settings-name"
            label="Nome"
            required={false}
            autoComplete="name"
            placeholder="Como prefere ser chamado"
            error={fieldError("fullName")}
            disabled={pending}
            {...form.register("fullName")}
          />
        </div>
        <FinanceSelect
          id="settings-theme"
          label="Tema"
          options={themeOptions}
          error={fieldError("theme")}
          disabled={pending}
          {...form.register("theme")}
        />
        <FinanceSelect
          id="settings-timezone"
          label="Fuso horário"
          options={timezoneOptions}
          hint="Define o dia atual usado nos cálculos."
          error={fieldError("timezone")}
          disabled={pending}
          {...form.register("timezone")}
        />
        <FinanceField
          id="settings-month-start"
          label="Início do mês financeiro"
          type="number"
          min={1}
          max={28}
          hint="Escolha um dia entre 1 e 28."
          error={fieldError("financialMonthStart")}
          disabled={pending}
          {...form.register("financialMonthStart", { valueAsNumber: true })}
        />
        <FinanceSelect
          id="settings-date-format"
          label="Formato de data"
          options={dateFormatOptions}
          error={fieldError("dateFormat")}
          disabled={pending}
          {...form.register("dateFormat")}
        />
        <FinanceSelect
          id="settings-currency"
          label="Moeda"
          options={currencyOptions}
          hint="Outras moedas exigirão conversão e ficam para uma melhoria futura."
          error={fieldError("currencyCode")}
          disabled={pending}
          {...form.register("currencyCode")}
        />
        <FinanceSelect
          id="settings-locale"
          label="Idioma e região"
          options={localeOptions}
          error={fieldError("locale")}
          disabled={pending}
          {...form.register("locale")}
        />
      </div>
      <div className="flex justify-end border-t pt-6">
        <FormSubmit
          pending={pending}
          idleLabel="Salvar configurações"
          pendingLabel="Salvando…"
        />
      </div>
    </form>
  );
}
