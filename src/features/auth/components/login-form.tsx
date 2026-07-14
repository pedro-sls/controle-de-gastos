"use client";

import { startTransition, useActionState, useMemo } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { loginAction } from "@/features/auth/actions";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { initialAuthActionState } from "@/features/auth/types";

import { AuthField, PasswordField } from "./auth-field";
import { AuthFormMessage } from "./auth-form-message";
import { AuthSubmitButton } from "./auth-submit-button";

type LoginFormProps = {
  nextPath: string;
  notice?: string;
  noticeTone?: "error" | "info" | "success";
};

export function LoginForm({
  nextPath,
  notice,
  noticeTone = "info",
}: LoginFormProps) {
  const action = useMemo(() => loginAction.bind(null, nextPath), [nextPath]);
  const [state, dispatch, pending] = useActionState(
    action,
    initialAuthActionState,
  );
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });
  const onSubmit = form.handleSubmit((values) => {
    startTransition(() => dispatch(values));
  });

  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      <AuthFormMessage message={notice} tone={noticeTone} />
      <AuthFormMessage
        message={state.message}
        tone={state.status === "error" ? "error" : "success"}
      />
      <AuthField
        id="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        inputMode="email"
        placeholder="voce@exemplo.com"
        error={
          form.formState.errors.email?.message ?? state.fieldErrors?.email?.[0]
        }
        disabled={pending}
        {...form.register("email")}
      />
      <div className="space-y-2">
        <PasswordField
          id="password"
          label="Senha"
          autoComplete="current-password"
          error={
            form.formState.errors.password?.message ??
            state.fieldErrors?.password?.[0]
          }
          disabled={pending}
          {...form.register("password")}
        />
        <div className="text-right">
          <Link
            href="/recuperar-senha"
            className="text-sm font-medium text-emerald-700 underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Esqueci minha senha
          </Link>
        </div>
      </div>
      <AuthSubmitButton
        idleLabel="Entrar"
        pending={pending}
        pendingLabel="Entrando…"
      />
    </form>
  );
}
