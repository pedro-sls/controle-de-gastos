"use client";

import { startTransition, useActionState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { signupAction } from "@/features/auth/actions";
import { signupSchema, type SignupInput } from "@/features/auth/schemas";
import { initialAuthActionState } from "@/features/auth/types";

import { AuthField, PasswordField } from "./auth-field";
import { AuthFormMessage } from "./auth-form-message";
import { AuthSubmitButton } from "./auth-submit-button";

export function SignupForm() {
  const [state, dispatch, pending] = useActionState(
    signupAction,
    initialAuthActionState,
  );
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });
  const onSubmit = form.handleSubmit((values) => {
    startTransition(() => dispatch(values));
  });
  const isComplete = state.status === "success";

  useEffect(() => {
    if (isComplete) {
      form.setValue("password", "");
      form.setValue("passwordConfirmation", "");
    }
  }, [form, isComplete]);

  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      <AuthFormMessage
        message={state.message}
        tone={state.status === "error" ? "error" : "success"}
      />
      <AuthField
        id="fullName"
        label="Nome"
        autoComplete="name"
        placeholder="Como podemos chamar você?"
        error={
          form.formState.errors.fullName?.message ??
          state.fieldErrors?.fullName?.[0]
        }
        disabled={pending || isComplete}
        {...form.register("fullName")}
      />
      <AuthField
        id="signupEmail"
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
      <PasswordField
        id="signupPassword"
        label="Senha"
        autoComplete="new-password"
        hint="Use de 8 a 72 caracteres."
        error={
          form.formState.errors.password?.message ??
          state.fieldErrors?.password?.[0]
        }
        disabled={pending || isComplete}
        {...form.register("password")}
      />
      <PasswordField
        id="signupPasswordConfirmation"
        label="Confirme a senha"
        autoComplete="new-password"
        error={
          form.formState.errors.passwordConfirmation?.message ??
          state.fieldErrors?.passwordConfirmation?.[0]
        }
        disabled={pending || isComplete}
        {...form.register("passwordConfirmation")}
      />
      <AuthSubmitButton
        idleLabel="Criar conta"
        pending={pending}
        pendingLabel="Criando conta…"
        disabled={isComplete}
      />
    </form>
  );
}
