"use client";

import { startTransition, useActionState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { updatePasswordAction } from "@/features/auth/actions";
import {
  passwordUpdateSchema,
  type PasswordUpdateInput,
} from "@/features/auth/schemas";
import { initialAuthActionState } from "@/features/auth/types";

import { PasswordField } from "./auth-field";
import { AuthFormMessage } from "./auth-form-message";
import { AuthSubmitButton } from "./auth-submit-button";

export function UpdatePasswordForm() {
  const [state, dispatch, pending] = useActionState(
    updatePasswordAction,
    initialAuthActionState,
  );
  const form = useForm<PasswordUpdateInput>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: { password: "", passwordConfirmation: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });
  const onSubmit = form.handleSubmit((values) => {
    startTransition(() => dispatch(values));
  });

  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      <AuthFormMessage
        message={state.message}
        tone={state.status === "error" ? "error" : "success"}
      />
      <PasswordField
        id="newPassword"
        label="Nova senha"
        autoComplete="new-password"
        hint="Use de 8 a 72 caracteres."
        error={
          form.formState.errors.password?.message ??
          state.fieldErrors?.password?.[0]
        }
        disabled={pending}
        {...form.register("password")}
      />
      <PasswordField
        id="newPasswordConfirmation"
        label="Confirme a nova senha"
        autoComplete="new-password"
        error={
          form.formState.errors.passwordConfirmation?.message ??
          state.fieldErrors?.passwordConfirmation?.[0]
        }
        disabled={pending}
        {...form.register("passwordConfirmation")}
      />
      <AuthSubmitButton
        idleLabel="Salvar nova senha"
        pending={pending}
        pendingLabel="Salvando…"
      />
    </form>
  );
}
