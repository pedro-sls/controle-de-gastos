import { z } from "zod";

import { accountIcons, accountTypes, financeColors } from "../finance/options";
import { isValidMoneyInput } from "../finance/money";

const accountTypeValues = accountTypes.map(({ value }) => value) as [
  (typeof accountTypes)[number]["value"],
  ...(typeof accountTypes)[number]["value"][],
];
const accountIconValues = accountIcons.map(({ value }) => value) as [
  (typeof accountIcons)[number]["value"],
  ...(typeof accountIcons)[number]["value"][],
];

export const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome da conta.")
    .max(80, "Use no máximo 80 caracteres."),
  type: z.enum(accountTypeValues, { error: "Selecione um tipo de conta." }),
  initialBalance: z
    .string()
    .trim()
    .refine(
      isValidMoneyInput,
      "Informe um valor válido, com no máximo duas casas decimais.",
    ),
  institution: z.string().trim().max(120, "Use no máximo 120 caracteres."),
  color: z.enum(financeColors, { error: "Selecione uma cor disponível." }),
  icon: z.enum(accountIconValues, { error: "Selecione um ícone disponível." }),
});

export const accountIdSchema = z.uuid();

export type AccountInput = z.infer<typeof accountSchema>;
