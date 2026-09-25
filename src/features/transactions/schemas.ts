import { z } from "zod";

import { isValidMoneyInput, parseMoneyInput } from "../finance/money";
import { isValidDateInput } from "./dates";
import {
  paymentMethods,
  transactionKinds,
  transactionStatuses,
} from "./options";

const kindValues = transactionKinds.map(({ value }) => value) as [
  (typeof transactionKinds)[number]["value"],
  ...(typeof transactionKinds)[number]["value"][],
];
const statusValues = transactionStatuses.map(({ value }) => value) as [
  (typeof transactionStatuses)[number]["value"],
  ...(typeof transactionStatuses)[number]["value"][],
];
const paymentMethodValues = paymentMethods.map(({ value }) => value) as [
  (typeof paymentMethods)[number]["value"],
  ...(typeof paymentMethods)[number]["value"][],
];

function addIssue(context: z.RefinementCtx, path: string, message: string) {
  context.addIssue({ code: "custom", path: [path], message });
}

export const transactionSchema = z
  .object({
    kind: z.enum(kindValues, { error: "Selecione o tipo da movimentação." }),
    accountId: z.uuid("Selecione uma conta válida."),
    destinationAccountId: z.string(),
    categoryId: z.string(),
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
    transactionDate: z
      .string()
      .refine(isValidDateInput, "Informe uma data válida."),
    dueDate: z.string(),
    status: z.enum(statusValues, { error: "Selecione um estado válido." }),
    paidDate: z.string(),
    paymentMethod: z.enum(paymentMethodValues, {
      error: "Selecione uma forma de pagamento.",
    }),
    isFixed: z.boolean(),
    note: z.string().trim().max(2000, "Use no máximo 2.000 caracteres."),
  })
  .superRefine((input, context) => {
    if (input.kind === "transfer") {
      if (!z.uuid().safeParse(input.destinationAccountId).success) {
        addIssue(
          context,
          "destinationAccountId",
          "Selecione a conta de destino.",
        );
      } else if (input.destinationAccountId === input.accountId) {
        addIssue(
          context,
          "destinationAccountId",
          "A conta de destino deve ser diferente da origem.",
        );
      }
    } else if (!z.uuid().safeParse(input.categoryId).success) {
      addIssue(context, "categoryId", "Selecione uma categoria válida.");
    }

    if (input.dueDate && !isValidDateInput(input.dueDate)) {
      addIssue(context, "dueDate", "Informe uma data de vencimento válida.");
    } else if (input.dueDate && input.dueDate < input.transactionDate) {
      addIssue(
        context,
        "dueDate",
        "O vencimento não pode ser anterior à data da movimentação.",
      );
    }

    if (input.status === "paid") {
      if (!isValidDateInput(input.paidDate)) {
        addIssue(context, "paidDate", "Informe a data do pagamento.");
      }
    } else if (input.paidDate) {
      addIssue(
        context,
        "paidDate",
        "Movimentações não pagas não podem ter data de pagamento.",
      );
    }

    if (input.isFixed && input.kind !== "expense") {
      addIssue(
        context,
        "isFixed",
        "Somente despesas podem ser marcadas como fixas.",
      );
    }
  });

export const transactionIdSchema = z.uuid();
export const entryKindSchema = z.enum(["transaction", "transfer"]);

export const transactionFilterSchema = z.object({
  search: z.string().trim().max(80).catch(""),
  kind: z.enum(["all", ...kindValues]).catch("all"),
  status: z.enum(["all", ...statusValues, "overdue"]).catch("all"),
  accountId: z.union([z.literal(""), z.uuid()]).catch(""),
  categoryId: z.union([z.literal(""), z.uuid()]).catch(""),
  from: z.union([z.literal(""), z.string().refine(isValidDateInput)]).catch(""),
  to: z.union([z.literal(""), z.string().refine(isValidDateInput)]).catch(""),
  page: z.coerce.number().int().min(1).catch(1),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFilterSchema>;
export type EntryKind = z.infer<typeof entryKindSchema>;
