import { z } from "zod";

import { isValidMoneyInput, parseMoneyInput } from "../finance/money";
import { isValidDateInput } from "../transactions/dates";
import { paymentMethods, transactionStatuses } from "../transactions/options";
import { recurrenceFrequencies } from "./options";

const frequencyValues = recurrenceFrequencies.map(({ value }) => value) as [
  (typeof recurrenceFrequencies)[number]["value"],
  ...(typeof recurrenceFrequencies)[number]["value"][],
];
const statusValues = transactionStatuses.map(({ value }) => value) as [
  (typeof transactionStatuses)[number]["value"],
  ...(typeof transactionStatuses)[number]["value"][],
];
const paymentValues = paymentMethods.map(({ value }) => value) as [
  (typeof paymentMethods)[number]["value"],
  ...(typeof paymentMethods)[number]["value"][],
];

export const recurrenceSchema = z
  .object({
    type: z.enum(["income", "expense"]),
    accountId: z.uuid("Selecione uma conta válida."),
    categoryId: z.uuid("Selecione uma categoria válida."),
    description: z
      .string()
      .trim()
      .min(1, "Informe uma descrição.")
      .max(160, "Use no máximo 160 caracteres."),
    amount: z
      .string()
      .trim()
      .refine(isValidMoneyInput, "Informe um valor monetário válido.")
      .refine(
        (value) => isValidMoneyInput(value) && parseMoneyInput(value) > 0,
        "O valor deve ser maior que zero.",
      ),
    frequency: z.enum(frequencyValues),
    startDate: z.string().refine(isValidDateInput, "Informe a data inicial."),
    endDate: z.string(),
    nextExecutionDate: z
      .string()
      .refine(isValidDateInput, "Informe a próxima ocorrência."),
    defaultStatus: z.enum(statusValues),
    paymentMethod: z.enum(paymentValues),
    isFixed: z.boolean(),
    note: z.string().trim().max(2000, "Use no máximo 2.000 caracteres."),
  })
  .superRefine((input, context) => {
    if (input.endDate && !isValidDateInput(input.endDate)) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Informe uma data final válida.",
      });
    } else if (input.endDate && input.endDate < input.startDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "A data final não pode ser anterior à inicial.",
      });
    }
    if (input.nextExecutionDate < input.startDate) {
      context.addIssue({
        code: "custom",
        path: ["nextExecutionDate"],
        message: "A próxima ocorrência não pode ser anterior ao início.",
      });
    }
    if (input.endDate && input.nextExecutionDate > input.endDate) {
      context.addIssue({
        code: "custom",
        path: ["nextExecutionDate"],
        message: "A próxima ocorrência deve estar dentro da vigência.",
      });
    }
    if (input.isFixed && input.type !== "expense") {
      context.addIssue({
        code: "custom",
        path: ["isFixed"],
        message: "Somente despesas podem ser fixas.",
      });
    }
  });

export const recurrenceIdSchema = z.uuid();
export const generationDateSchema = z
  .string()
  .refine(isValidDateInput, "Informe uma data válida.");
export type RecurrenceInput = z.infer<typeof recurrenceSchema>;
