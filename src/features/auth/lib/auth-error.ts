export type AuthErrorContext =
  "callback" | "login" | "logout" | "password-update" | "signup";

type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

function getAuthErrorFingerprint(error: AuthErrorLike) {
  return `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
}

const defaultMessages: Record<AuthErrorContext, string> = {
  callback: "Este link é inválido ou expirou. Solicite um novo.",
  login: "Não foi possível entrar. Tente novamente.",
  logout: "Não foi possível encerrar a sessão. Tente novamente.",
  "password-update": "Não foi possível atualizar a senha. Tente novamente.",
  signup: "Não foi possível concluir o cadastro. Tente novamente.",
};

export function isAuthRateLimitError(error: AuthErrorLike) {
  const fingerprint = getAuthErrorFingerprint(error);

  return error.status === 429 || fingerprint.includes("rate_limit");
}

export function isEmailNotConfirmedError(error: AuthErrorLike) {
  return getAuthErrorFingerprint(error).includes("email_not_confirmed");
}

export function getAuthErrorMessage(
  error: AuthErrorLike,
  context: AuthErrorContext,
) {
  const fingerprint = getAuthErrorFingerprint(error);

  if (isAuthRateLimitError(error)) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }

  if (
    fingerprint.includes("invalid_credentials") ||
    fingerprint.includes("invalid login credentials")
  ) {
    return "E-mail ou senha incorretos.";
  }

  if (isEmailNotConfirmedError(error)) {
    return "Sua conta foi criada, mas o e-mail ainda não foi confirmado. Abra a mensagem de confirmação antes de entrar.";
  }

  if (
    fingerprint.includes("user_already_exists") ||
    fingerprint.includes("email_exists") ||
    fingerprint.includes("already registered")
  ) {
    return "Não foi possível concluir o cadastro. Se você já tem uma conta, tente entrar.";
  }

  if (fingerprint.includes("weak_password")) {
    return "A senha não atende aos requisitos de segurança.";
  }

  if (fingerprint.includes("same_password")) {
    return "Escolha uma senha diferente da atual.";
  }

  if (
    fingerprint.includes("otp_expired") ||
    fingerprint.includes("token has expired") ||
    fingerprint.includes("invalid token")
  ) {
    return "Este link é inválido ou expirou. Solicite um novo.";
  }

  if (
    fingerprint.includes("session_not_found") ||
    fingerprint.includes("refresh_token_not_found") ||
    fingerprint.includes("invalid_refresh_token")
  ) {
    return "Sua sessão expirou. Entre novamente para continuar.";
  }

  return defaultMessages[context];
}

export function getAuthConnectionErrorMessage() {
  return "Não foi possível acessar o serviço de autenticação. Verifique sua conexão e tente novamente.";
}
