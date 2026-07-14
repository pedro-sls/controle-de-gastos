export const MAX_MONEY_CENTS = 99_999_999_999_999;

const INTEGER_WITH_THOUSANDS_PATTERN = /^\d{1,3}(?:\.\d{3})+$/;
const INTEGER_PATTERN = /^\d+$/;
const DECIMAL_WITH_COMMA_PATTERN = /^([\d.]+),(\d{1,2})$/;
const DECIMAL_WITH_DOT_PATTERN = /^(\d+)\.(\d{1,2})$/;

function getSignAndAmount(value: string) {
  let amount = value.trim().replace(/\s/gu, "");
  let sign = 1;
  let hasSign = false;

  if (amount.startsWith("+") || amount.startsWith("-")) {
    sign = amount[0] === "-" ? -1 : 1;
    hasSign = true;
    amount = amount.slice(1);
  }

  if (amount.startsWith("R$")) {
    amount = amount.slice(2);
  }

  if (!hasSign && (amount.startsWith("+") || amount.startsWith("-"))) {
    sign = amount[0] === "-" ? -1 : 1;
    amount = amount.slice(1);
  }

  if (
    amount.length === 0 ||
    amount.includes("R$") ||
    amount.includes("+") ||
    amount.includes("-")
  ) {
    return null;
  }

  return { amount, sign };
}

function parseAmountParts(amount: string) {
  const commaDecimal = DECIMAL_WITH_COMMA_PATTERN.exec(amount);

  if (commaDecimal) {
    const [, integerPart, decimalPart] = commaDecimal;

    if (
      integerPart.includes(".") &&
      !INTEGER_WITH_THOUSANDS_PATTERN.test(integerPart)
    ) {
      return null;
    }

    return {
      integerDigits: integerPart.replaceAll(".", ""),
      decimalDigits: decimalPart.padEnd(2, "0"),
    };
  }

  if (INTEGER_PATTERN.test(amount)) {
    return { integerDigits: amount, decimalDigits: "00" };
  }

  const dotDecimal = DECIMAL_WITH_DOT_PATTERN.exec(amount);

  if (dotDecimal) {
    const [, integerPart, decimalPart] = dotDecimal;

    return {
      integerDigits: integerPart,
      decimalDigits: decimalPart.padEnd(2, "0"),
    };
  }

  if (INTEGER_WITH_THOUSANDS_PATTERN.test(amount)) {
    return {
      integerDigits: amount.replaceAll(".", ""),
      decimalDigits: "00",
    };
  }

  return null;
}

function assertValidMoneyCents(cents: number) {
  if (!Number.isSafeInteger(cents) || Math.abs(cents) > MAX_MONEY_CENTS) {
    throw new RangeError(
      "O valor em centavos deve ser um inteiro dentro do limite de numeric(14,2).",
    );
  }
}

/**
 * Converts a Brazilian monetary value into integer cents without rounding.
 *
 * A comma is always the decimal separator. A single dot followed by one or
 * two digits is also accepted as a decimal separator, while valid groups of
 * three digits are interpreted as thousands (for example, `1.234`).
 */
export function parseBrazilianMoneyToCents(value: string): number | null {
  const signedAmount = getSignAndAmount(value);

  if (!signedAmount) {
    return null;
  }

  const parts = parseAmountParts(signedAmount.amount);

  if (!parts) {
    return null;
  }

  const integerDigits = parts.integerDigits.replace(/^0+(?=\d)/u, "");

  if (integerDigits.length > 12) {
    return null;
  }

  const unsignedCents =
    Number(integerDigits) * 100 + Number(parts.decimalDigits);

  if (!Number.isSafeInteger(unsignedCents) || unsignedCents > MAX_MONEY_CENTS) {
    return null;
  }

  if (unsignedCents === 0) {
    return 0;
  }

  return signedAmount.sign * unsignedCents;
}

/** Converts a database numeric value into integer cents using decimal rounding. */
export function databaseNumberToCents(value: number) {
  const maximumDatabaseValue = MAX_MONEY_CENTS / 100;

  if (!Number.isFinite(value) || Math.abs(value) > maximumDatabaseValue) {
    throw new RangeError(
      "O valor do banco deve estar dentro do limite de numeric(14,2).",
    );
  }

  const sign = value < 0 ? -1 : 1;
  const absoluteValue = Math.abs(value);
  const roundingTolerance = Number.EPSILON * Math.max(1, absoluteValue);
  const cents = sign * Math.round((absoluteValue + roundingTolerance) * 100);

  assertValidMoneyCents(cents);

  return cents === 0 ? 0 : cents;
}

/** Returns the numeric value expected by a `numeric(14,2)` database column. */
export function centsToDatabaseNumber(cents: number) {
  assertValidMoneyCents(cents);

  return cents / 100;
}

/** Returns a locale-independent decimal representation for serialization. */
export function centsToDecimalString(cents: number) {
  assertValidMoneyCents(cents);

  const absoluteCents = Math.abs(cents);
  const integerPart = Math.floor(absoluteCents / 100);
  const decimalPart = String(absoluteCents % 100).padStart(2, "0");
  const sign = cents < 0 ? "-" : "";

  return `${sign}${integerPart}.${decimalPart}`;
}

/** Formats integer cents for a Brazilian money input, without the currency. */
export function formatCentsForInput(cents: number) {
  assertValidMoneyCents(cents);

  const decimal = centsToDecimalString(cents);
  const sign = decimal.startsWith("-") ? "-" : "";
  const unsignedDecimal = sign ? decimal.slice(1) : decimal;
  const [integerPart, decimalPart] = unsignedDecimal.split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/gu, ".");

  return `${sign}${groupedInteger},${decimalPart}`;
}

/** Formats integer cents for display as Brazilian reais. */
export function formatBrlFromCents(cents: number) {
  const formattedValue = formatCentsForInput(cents);

  if (formattedValue.startsWith("-")) {
    return `-R$ ${formattedValue.slice(1)}`;
  }

  return `R$ ${formattedValue}`;
}
