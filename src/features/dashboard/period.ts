import { siteConfig } from "../../config/site";
import { isValidDateInput } from "../transactions/dates";

export type FinancialPeriod = {
  startDate: string;
  endDate: string;
  daysRemaining: number;
  totalDays: number;
  label: string;
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(value: string, amount: number) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return toIsoDate(date);
}

function differenceInDays(start: string, end: string) {
  const startTime = new Date(`${start}T00:00:00.000Z`).getTime();
  const endTime = new Date(`${end}T00:00:00.000Z`).getTime();
  return Math.round((endTime - startTime) / 86_400_000);
}

function getPeriodLabel(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat(siteConfig.locale, {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
  return `${formatter.format(new Date(`${startDate}T00:00:00.000Z`))} a ${formatter.format(new Date(`${endDate}T00:00:00.000Z`))}`;
}

export function getFinancialPeriod(
  today: string,
  financialMonthStart: number,
): FinancialPeriod {
  if (!isValidDateInput(today)) throw new Error("Invalid current date.");
  if (
    !Number.isInteger(financialMonthStart) ||
    financialMonthStart < 1 ||
    financialMonthStart > 28
  ) {
    throw new Error("Invalid financial month start.");
  }

  const current = new Date(`${today}T00:00:00.000Z`);
  const startsThisMonth = current.getUTCDate() >= financialMonthStart;
  const start = new Date(
    Date.UTC(
      current.getUTCFullYear(),
      current.getUTCMonth() - (startsThisMonth ? 0 : 1),
      financialMonthStart,
    ),
  );
  const nextStart = new Date(
    Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth() + 1,
      financialMonthStart,
    ),
  );
  const startDate = toIsoDate(start);
  const endDate = addDays(toIsoDate(nextStart), -1);

  return {
    startDate,
    endDate,
    daysRemaining: differenceInDays(today, endDate) + 1,
    totalDays: differenceInDays(startDate, endDate) + 1,
    label: getPeriodLabel(startDate, endDate),
  };
}

export function getPeriodDates(startDate: string, endDate: string) {
  const dates: string[] = [];
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    dates.push(date);
  }
  return dates;
}
