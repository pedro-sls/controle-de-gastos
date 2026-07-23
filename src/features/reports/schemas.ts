import { z } from "zod";

import { isValidDateInput } from "../transactions/dates";

const money = z.coerce.number().finite().nonnegative();

export const reportSnapshotSchema = z.object({
  period_start: z.string().refine(isValidDateInput),
  period_end: z.string().refine(isValidDateInput),
  previous_start: z.string().refine(isValidDateInput),
  previous_end: z.string().refine(isValidDateInput),
  income: money,
  expense: money,
  previous_income: money,
  previous_expense: money,
  pending_income: money,
  pending_expense: money,
  monthly: z.array(
    z.object({
      month: z.string().refine(isValidDateInput),
      income: money,
      expense: money,
    }),
  ),
  expense_categories: z.array(
    z.object({
      id: z.uuid(),
      name: z.string().min(1),
      color: z.string().nullable(),
      amount: money,
    }),
  ),
});

export const reportFilterSchema = z
  .object({
    startDate: z.string().refine(isValidDateInput),
    endDate: z.string().refine(isValidDateInput),
  })
  .refine((value) => value.startDate <= value.endDate, {
    message: "A data inicial deve ser anterior à final.",
  })
  .refine(
    (value) => {
      const start = Date.parse(`${value.startDate}T00:00:00.000Z`);
      const end = Date.parse(`${value.endDate}T00:00:00.000Z`);
      return (end - start) / 86_400_000 < 731;
    },
    { message: "Selecione no máximo dois anos." },
  );

export type ReportSnapshot = z.infer<typeof reportSnapshotSchema>;
