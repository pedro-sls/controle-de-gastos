import { z } from "zod";

import { isValidMoneyInput, parseMoneyInput } from "../finance/money";
import { isValidDateInput } from "../transactions/dates";

export const budgetSchema = z.object({
  categoryId: z.union([
    z.literal(""),
    z.uuid("Selecione uma categoria válida."),
  ]),
  periodMonth: z
    .string()
    .refine(isValidDateInput, "Informe um mês válido.")
    .refine(
      (value) => value.endsWith("-01"),
      "O período deve começar no primeiro dia.",
    ),
  limitAmount: z
    .string()
    .trim()
    .refine(isValidMoneyInput, "Informe um valor monetário válido.")
    .refine(
      (value) => isValidMoneyInput(value) && parseMoneyInput(value) > 0,
      "O limite deve ser maior que zero.",
    ),
});

export const budgetIdSchema = z.uuid();
export const budgetPeriodSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/)
  .transform((value) => `${value}-01`)
  .refine(isValidDateInput)
  .catch(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  });

export type BudgetInput = z.infer<typeof budgetSchema>;
