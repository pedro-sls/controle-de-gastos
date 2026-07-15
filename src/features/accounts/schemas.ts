import { z } from "zod";

import {
  financialColorValues,
  financialIconNames,
} from "@/config/financial-dimensions";
import { parseBrazilianMoneyToCents } from "@/lib/money";

export const accountTypes = [
  "checking",
  "savings",
  "wallet",
  "cash",
  "digital",
  "other",
] as const;

export const accountTypeSchema = z.enum(accountTypes, {
  error: "Selecione um tipo de conta válido.",
});

const accountInitialBalanceSchema = z
  .string({ error: "Informe o saldo inicial." })
  .trim()
  .min(1, "Informe o saldo inicial.")
  .refine(
    (value) => parseBrazilianMoneyToCents(value) !== null,
    "Informe um valor válido de até R$ 999.999.999.999,99.",
  );

const optionalInstitutionSchema = z
  .string({ error: "Informe uma instituição válida." })
  .trim()
  .max(120, "A instituição deve ter no máximo 120 caracteres.")
  .optional()
  .default("");

const optionalColorSchema = z
  .union([z.literal(""), z.enum(financialColorValues)], {
    error: "Selecione uma cor válida.",
  })
  .optional()
  .default("");

const optionalIconSchema = z
  .union([z.literal(""), z.enum(financialIconNames)], {
    error: "Selecione um ícone válido.",
  })
  .optional()
  .default("");

export const accountFormSchema = z.object({
  name: z
    .string({ error: "Informe o nome da conta." })
    .trim()
    .min(1, "Informe o nome da conta.")
    .max(80, "O nome deve ter no máximo 80 caracteres."),
  type: accountTypeSchema,
  initialBalance: accountInitialBalanceSchema,
  institution: optionalInstitutionSchema,
  color: optionalColorSchema,
  icon: optionalIconSchema,
});

export const accountMutationIdentitySchema = z.object({
  accountId: z.uuid({ error: "A conta informada é inválida." }),
  expectedUpdatedAt: z.iso.datetime({
    offset: true,
    error: "A versão informada da conta é inválida.",
  }),
});
