import type {
  AccountDomainError,
  AccountMutationOperation,
  PostgrestErrorLike,
} from "./types";

const unexpectedMessages: Record<AccountMutationOperation, string> = {
  create: "Não foi possível criar a conta. Tente novamente.",
  update: "Não foi possível salvar a conta. Tente novamente.",
  archive: "Não foi possível arquivar a conta. Tente novamente.",
  restore: "Não foi possível reativar a conta. Tente novamente.",
};

function isErrorLike(error: unknown): error is PostgrestErrorLike {
  return typeof error === "object" && error !== null;
}

export function getAccountConflictError(): AccountDomainError {
  return {
    code: "conflict",
    message:
      "Esta conta foi alterada em outra sessão. Atualize a página e tente novamente.",
  };
}

export function mapAccountPostgrestError(
  error: unknown,
  operation: AccountMutationOperation,
): AccountDomainError {
  const code = isErrorLike(error) ? error.code : undefined;

  if (code === "23505") {
    return operation === "restore"
      ? {
          code: "duplicate",
          message:
            "Não foi possível reativar a conta porque já existe outra conta ativa com esse nome.",
        }
      : {
          code: "duplicate",
          message: "Já existe uma conta ativa com esse nome.",
        };
  }

  if (code === "23514") {
    return {
      code: "invalid-data",
      message:
        "Algum dado da conta está fora dos limites permitidos. Revise os campos e tente novamente.",
    };
  }

  if (code === "23503") {
    return {
      code: "dependency",
      message:
        "Não foi possível alterar esta conta porque ela está vinculada a outros registros.",
    };
  }

  if (code === "42501") {
    return {
      code: "forbidden",
      message: "Você não tem permissão para alterar esta conta.",
    };
  }

  return {
    code: "unexpected",
    message: unexpectedMessages[operation],
  };
}
