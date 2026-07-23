"use client";

import { startTransition, useActionState, useMemo } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  loginAction,
  resendSignupConfirmationAction,
} from "@/features/auth/actions";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { initialAuthActionState } from "@/features/auth/types";

import { AuthField, PasswordField } from "./auth-field";
import { AuthFormMessage } from "./auth-form-message";
import { AuthSubmitButton } from "./auth-submit-button";
import { useAuthMessageFocus } from "./use-auth-message-focus";

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
  const [resendState, resendConfirmation, resendPending] = useActionState(
    resendSignupConfirmationAction,
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
  const messageRef = useAuthMessageFocus(state);
  const resendMessageRef = useAuthMessageFocus(resendState);

  function handleResendConfirmation() {
    startTransition(() => {
      resendConfirmation({ email: form.getValues("email") });
    });
  }

  return (
    <form
      action={dispatch}
      className="space-y-5"
      noValidate
      onSubmit={onSubmit}
    >
      <AuthFormMessage message={notice} tone={noticeTone} />
      <AuthFormMessage
        message={state.message}
        messageRef={messageRef}
        tone={state.status === "error" ? "error" : "success"}
      />
      {state.nextStep === "confirm-email" ? (
        <div className="bg-muted/45 space-y-3 rounded-lg border p-4">
          <p className="text-sm leading-6">
            Não recebeu a mensagem? Peça outro link usando o mesmo e-mail
            informado no formulário.
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={pending || resendPending}
            onClick={handleResendConfirmation}
          >
            {resendPending ? "Reenviando…" : "Reenviar confirmação"}
          </Button>
          <AuthFormMessage
            message={resendState.message}
            messageRef={resendMessageRef}
            tone={resendState.status === "error" ? "error" : "success"}
          />
        </div>
      ) : null}
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
