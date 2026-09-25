const MONEY_PATTERN = /^-?\d{1,12}(?:[.,]\d{1,2})?$/;

export function normalizeMoneyInput(value: string) {
  const compact = value.trim().replace(/\s/g, "");

  if (compact.includes(",")) {
    return compact.replace(/\./g, "").replace(",", ".");
  }

  return compact;
}

export function isValidMoneyInput(value: string) {
  const normalized = normalizeMoneyInput(value);
  return MONEY_PATTERN.test(normalized) && Number.isFinite(Number(normalized));
}

export function parseMoneyInput(value: string) {
  return Number(normalizeMoneyInput(value));
}

export function formatMoney(value: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);
}

export function formatMoneyInput(value: number) {
  return value.toFixed(2).replace(".", ",");
}
