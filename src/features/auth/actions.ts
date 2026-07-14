"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getAuthCallbackUrl } from "@/config/app-url";
import {
  getAuthConnectionErrorMessage,
  getAuthErrorMessage,
  isAuthRateLimitError,
} from "@/features/auth/lib/auth-error";
import { getSafeRedirectPath } from "@/features/auth/lib/safe-redirect";
import {
  loginSchema,
  passwordResetRequestSchema,
  passwordUpdateSchema,
  signupSchema,
  type LoginInput,
  type PasswordResetRequestInput,
  type PasswordUpdateInput,
  type SignupInput,
} from "@/features/auth/schemas";
import type { AuthActionState } from "@/features/auth/types";
import { getCurrentIdentity } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function getValidationErrorState(error: z.ZodError): AuthActionState {
  const { fieldErrors } = z.flattenError(error);

  return {
    status: "error",
    message: "Revise os campos destacados e tente novamente.",
    fieldErrors,
  };
}

export async function loginAction(
  nextPath: string,
  _previousState: AuthActionState,
  input: LoginInput,
): Promise<AuthActionState> {
  const parsedInput = loginSchema.safeParse(input);

  if (!parsedInput.success) {
    return getValidationErrorState(parsedInput.error);
  }

  const supabase = await createClient();
  let authError;

  try {
    const result = await supabase.auth.signInWithPassword({
      email: parsedInput.data.email,
      password: parsedInput.data.password,
    });
    authError = result.error;
  } catch {
    return {
      status: "error",
      message: getAuthConnectionErrorMessage(),
    };
  }

  if (authError) {
    return {
      status: "error",
      message: getAuthErrorMessage(authError, "login"),
    };
  }

  redirect(getSafeRedirectPath(nextPath));
}

export async function signupAction(
  _previousState: AuthActionState,
  input: SignupInput,
): Promise<AuthActionState> {
  const parsedInput = signupSchema.safeParse(input);

  if (!parsedInput.success) {
    return getValidationErrorState(parsedInput.error);
  }

  const supabase = await createClient();
  let authResult;

  try {
    authResult = await supabase.auth.signUp({
      email: parsedInput.data.email,
      password: parsedInput.data.password,
      options: {
        data: { full_name: parsedInput.data.fullName },
        emailRedirectTo: getAuthCallbackUrl("/dashboard"),
      },
    });
  } catch {
    return {
      status: "error",
      message: getAuthConnectionErrorMessage(),
    };
  }

  if (authResult.error) {
    return {
      status: "error",
      message: getAuthErrorMessage(authResult.error, "signup"),
    };
  }

  if (authResult.data.session) {
    redirect("/dashboard");
  }

  return {
    status: "success",
    message:
      "Cadastro recebido. Confira seu e-mail para confirmar a conta e continuar.",
  };
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  input: PasswordResetRequestInput,
): Promise<AuthActionState> {
  const parsedInput = passwordResetRequestSchema.safeParse(input);

  if (!parsedInput.success) {
    return getValidationErrorState(parsedInput.error);
  }

  const supabase = await createClient();
  let authError;

  try {
    const result = await supabase.auth.resetPasswordForEmail(
      parsedInput.data.email,
      {
        redirectTo: getAuthCallbackUrl("/nova-senha"),
      },
    );
    authError = result.error;
  } catch {
    return {
      status: "error",
      message: getAuthConnectionErrorMessage(),
    };
  }

  if (authError && isAuthRateLimitError(authError)) {
    return {
      status: "error",
      message: getAuthErrorMessage(authError, "callback"),
    };
  }

  // A resposta é intencionalmente neutra para não revelar contas existentes.
  return {
    status: "success",
    message:
      "Se o e-mail estiver cadastrado, você receberá as instruções para criar uma nova senha.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  input: PasswordUpdateInput,
): Promise<AuthActionState> {
  const parsedInput = passwordUpdateSchema.safeParse(input);

  if (!parsedInput.success) {
    return getValidationErrorState(parsedInput.error);
  }

  const identity = await getCurrentIdentity();

  if (!identity) {
    return {
      status: "error",
      message: "Sua sessão expirou. Solicite um novo link de recuperação.",
    };
  }

  const supabase = await createClient();
  let updateError;

  try {
    const result = await supabase.auth.updateUser({
      password: parsedInput.data.password,
    });
    updateError = result.error;
  } catch {
    return {
      status: "error",
      message: getAuthConnectionErrorMessage(),
    };
  }

  if (updateError) {
    return {
      status: "error",
      message: getAuthErrorMessage(updateError, "password-update"),
    };
  }

  let signOutError;

  try {
    const result = await supabase.auth.signOut({ scope: "global" });
    signOutError = result.error;
  } catch {
    redirect("/dashboard?status=senha-alterada");
  }

  if (signOutError) {
    redirect("/dashboard?status=senha-alterada");
  }

  redirect("/entrar?status=senha-alterada");
}

export async function logoutAction() {
  const identity = await getCurrentIdentity();

  if (!identity) {
    redirect("/entrar?status=sessao-expirada");
  }

  const supabase = await createClient();
  let authError;

  try {
    const result = await supabase.auth.signOut({ scope: "local" });
    authError = result.error;
  } catch {
    redirect("/dashboard?status=erro-logout");
  }

  if (authError) {
    redirect("/dashboard?status=erro-logout");
  }

  redirect("/entrar?status=sessao-encerrada");
}
