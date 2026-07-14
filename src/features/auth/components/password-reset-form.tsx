"use client";

import { startTransition, useActionState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { requestPasswordResetAction } from "@/features/auth/actions";
import {
  passwordResetRequestSchema,
  type PasswordResetRequestInput,
} from "@/features/auth/schemas";
import { initialAuthActionState } from "@/features/auth/types";

import { AuthField } from "./auth-field";
import { AuthFormMessage } from "./auth-form-message";
import { AuthSubmitButton } from "./auth-submit-button";

type PasswordResetFormProps = {
  notice?: string;
};

export function PasswordResetForm({ notice }: PasswordResetFormProps) {
  const [state, dispatch, pending] = useActionState(
    requestPasswordResetAction,
    initialAuthActionState,
  );
  const form = useForm<PasswordResetRequestInput>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });
  const onSubmit = form.handleSubmit((values) => {
    startTransition(() => dispatch(values));
  });
  const isComplete = state.status === "success";

  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      <AuthFormMessage message={notice} tone="error" />
      <AuthFormMessage
        message={state.message}
        tone={state.status === "error" ? "error" : "success"}
      />
      <AuthField
        id="recoveryEmail"
        type="email"
        label="E-mail"
        autoComplete="email"
        inputMode="email"
        placeholder="voce@exemplo.com"
        error={
          form.formState.errors.email?.message ?? state.fieldErrors?.email?.[0]
        }
        disabled={pending || isComplete}
        {...form.register("email")}
      />
      <AuthSubmitButton
        idleLabel="Enviar instruções"
        pending={pending}
        pendingLabel="Enviando…"
        disabled={isComplete}
      />
    </form>
  );
}
