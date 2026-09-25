import { z } from "zod";

import {
  categoryIcons,
  categoryTypes,
  financeColors,
} from "../finance/options";

const categoryTypeValues = categoryTypes.map(({ value }) => value) as [
  (typeof categoryTypes)[number]["value"],
  ...(typeof categoryTypes)[number]["value"][],
];
const categoryIconValues = categoryIcons.map(({ value }) => value) as [
  (typeof categoryIcons)[number]["value"],
  ...(typeof categoryIcons)[number]["value"][],
];

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome da categoria.")
    .max(80, "Use no máximo 80 caracteres."),
  type: z.enum(categoryTypeValues, {
    error: "Selecione receita ou despesa.",
  }),
  color: z.enum(financeColors, { error: "Selecione uma cor disponível." }),
  icon: z.enum(categoryIconValues, {
    error: "Selecione um ícone disponível.",
  }),
});

export const categoryEditSchema = categorySchema.omit({ type: true });
export const categoryIdSchema = z.uuid();

export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryEditInput = z.infer<typeof categoryEditSchema>;
