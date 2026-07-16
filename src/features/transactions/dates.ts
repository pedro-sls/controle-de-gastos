import { siteConfig } from "../../config/site";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateInput(value: string) {
  if (!ISO_DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 0) - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}

export function formatDate(value: string) {
  if (!isValidDateInput(value)) return value;

  return new Intl.DateTimeFormat(siteConfig.locale, {
    dateStyle: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function getToday(timeZone: string = siteConfig.timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}
