"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getAuthCallbackUrl } from "@/config/app-url";
import { isOpenRegistration } from "@/config/registration";
import {
  getAuthConnectionErrorMessage,
  getAuthErrorMessage,
  isEmailNotConfirmedError,
  isAuthRateLimitError,
} from "@/features/auth/lib/auth-error";
import {
  addStatusToRedirectPath,
  getSafeRedirectPath,
} from "@/features/auth/lib/safe-redirect";
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

function readFormValue(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function normalizeLoginInput(input: LoginInput | FormData): LoginInput {
  if (!(input instanceof FormData)) {
    return input;
  }

  return {
    email: readFormValue(input, "email"),
    password: readFormValue(input, "password"),
  };
}

function normalizeSignupInput(input: SignupInput | FormData): SignupInput {
  if (!(input instanceof FormData)) {
    return input;
  }

  return {
    fullName: readFormValue(input, "fullName"),
    email: readFormValue(input, "email"),
    password: readFormValue(input, "password"),
    passwordConfirmation: readFormValue(input, "passwordConfirmation"),
  };
}

function normalizePasswordResetInput(
  input: PasswordResetRequestInput | FormData,
): PasswordResetRequestInput {
  if (!(input instanceof FormData)) {
    return input;
  }

  return {
    email: readFormValue(input, "email"),
  };
}

function normalizePasswordUpdateInput(
  input: PasswordUpdateInput | FormData,
): PasswordUpdateInput {
  if (!(input instanceof FormData)) {
    return input;
  }

  return {
    password: readFormValue(input, "password"),
    passwordConfirmation: readFormValue(input, "passwordConfirmation"),
  };
}

export async function loginAction(
  nextPath: string,
  _previousState: AuthActionState,
  input: LoginInput | FormData,
): Promise<AuthActionState> {
  const parsedInput = loginSchema.safeParse(normalizeLoginInput(input));

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
    const needsEmailConfirmation = isEmailNotConfirmedError(authError);

    return {
      status: "error",
      message: getAuthErrorMessage(authError, "login"),
      nextStep: needsEmailConfirmation ? "confirm-email" : undefined,
    };
  }

  redirect(
    addStatusToRedirectPath(getSafeRedirectPath(nextPath), "entrada-concluida"),
  );
}

export async function signupAction(
  _previousState: AuthActionState,
  input: SignupInput | FormData,
): Promise<AuthActionState> {
  if (!isOpenRegistration()) {
    return {
      status: "error",
      message:
        "Novos acessos são liberados somente por convite. Peça um convite ao responsável pelo MeuSaldo.",
    };
  }

  const parsedInput = signupSchema.safeParse(normalizeSignupInput(input));

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
    redirect("/dashboard?status=conta-criada");
  }

  redirect("/entrar?status=confirmacao-pendente");
}

export async function resendSignupConfirmationAction(
  _previousState: AuthActionState,
  input: PasswordResetRequestInput | FormData,
): Promise<AuthActionState> {
  const parsedInput = passwordResetRequestSchema.safeParse(
    normalizePasswordResetInput(input),
  );

  if (!parsedInput.success) {
    return getValidationErrorState(parsedInput.error);
  }

  const supabase = await createClient();
  let authError;

  try {
    const result = await supabase.auth.resend({
      type: "signup",
      email: parsedInput.data.email,
      options: {
        emailRedirectTo: getAuthCallbackUrl("/dashboard"),
      },
    });
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

  // A resposta é neutra para não revelar se o e-mail possui uma conta.
  return {
    status: "success",
    message:
      "Se a conta ainda estiver aguardando confirmação, enviamos um novo link. Confira também a caixa de spam.",
  };
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  input: PasswordResetRequestInput | FormData,
): Promise<AuthActionState> {
  const parsedInput = passwordResetRequestSchema.safeParse(
    normalizePasswordResetInput(input),
  );

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
  input: PasswordUpdateInput | FormData,
): Promise<AuthActionState> {
  const parsedInput = passwordUpdateSchema.safeParse(
    normalizePasswordUpdateInput(input),
  );

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
