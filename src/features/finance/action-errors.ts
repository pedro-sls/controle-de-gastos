import { z } from "zod";

import type { FinanceActionState } from "@/features/finance/types";

export function getFinanceValidationState(
  error: z.ZodError,
): FinanceActionState {
  return {
    status: "error",
    message: "Revise os campos destacados e tente novamente.",
    fieldErrors: z.flattenError(error).fieldErrors,
  };
}

export function getFinanceDatabaseError(
  error: { code?: string } | null,
  duplicateMessage: string,
): FinanceActionState {
  return {
    status: "error",
    message:
      error?.code === "23505"
        ? duplicateMessage
        : "Não foi possível salvar a alteração. Tente novamente.",
  };
}

export const expiredFinanceSessionState: FinanceActionState = {
  status: "error",
  message: "Sua sessão expirou. Entre novamente para continuar.",
};
