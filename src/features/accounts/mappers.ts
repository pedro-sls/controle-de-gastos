import {
  financialColorValues,
  isFinancialIconName,
  type FinancialColorValue,
} from "@/config/financial-dimensions";
import {
  centsToDatabaseNumber,
  databaseNumberToCents,
  formatCentsForInput,
  parseBrazilianMoneyToCents,
} from "@/lib/money";

import { accountTypes } from "./schemas";
import type {
  Account,
  AccountBalanceRow,
  AccountFormValues,
  AccountInsertPayload,
  AccountType,
  AccountUpdatePayload,
} from "./types";

const accountTypeSet = new Set<string>(accountTypes);
const financialColorSet = new Set<string>(financialColorValues);

export class AccountMappingError extends Error {
  constructor() {
    super("Os dados da conta recebidos do banco são inválidos.");
    this.name = "AccountMappingError";
  }
}

function isAccountType(value: string): value is AccountType {
  return accountTypeSet.has(value);
}

function isFinancialColorValue(value: string): value is FinancialColorValue {
  return financialColorSet.has(value);
}

function emptyToNull(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue.length === 0 ? null : normalizedValue;
}

function getInitialBalanceDatabaseValue(initialBalance: string) {
  const cents = parseBrazilianMoneyToCents(initialBalance);

  if (cents === null) {
    throw new AccountMappingError();
  }

  return centsToDatabaseNumber(cents);
}

function getAccountWritePayload(
  values: AccountFormValues,
): AccountUpdatePayload {
  return {
    name: values.name.trim(),
    type: values.type,
    initial_balance: getInitialBalanceDatabaseValue(values.initialBalance),
    institution: emptyToNull(values.institution),
    color: emptyToNull(values.color),
    icon: emptyToNull(values.icon),
  };
}

export function buildAccountInsertPayload(
  userId: string,
  values: AccountFormValues,
): AccountInsertPayload {
  const writableFields = getAccountWritePayload(values);

  return {
    user_id: userId,
    name: writableFields.name,
    type: writableFields.type,
    initial_balance: writableFields.initial_balance,
    institution: writableFields.institution,
    color: writableFields.color,
    icon: writableFields.icon,
  };
}

export function buildAccountUpdatePayload(
  values: AccountFormValues,
): AccountUpdatePayload {
  const writableFields = getAccountWritePayload(values);

  return {
    name: writableFields.name,
    type: writableFields.type,
    initial_balance: writableFields.initial_balance,
    institution: writableFields.institution,
    color: writableFields.color,
    icon: writableFields.icon,
  };
}

export function mapAccountBalanceRow(row: AccountBalanceRow): Account {
  if (
    typeof row.id !== "string" ||
    typeof row.user_id !== "string" ||
    typeof row.name !== "string" ||
    typeof row.type !== "string" ||
    !isAccountType(row.type) ||
    typeof row.initial_balance !== "number" ||
    typeof row.current_balance !== "number" ||
    (row.status !== "active" && row.status !== "archived") ||
    typeof row.created_at !== "string" ||
    typeof row.updated_at !== "string"
  ) {
    throw new AccountMappingError();
  }

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type,
    initialBalanceCents: databaseNumberToCents(row.initial_balance),
    currentBalanceCents: databaseNumberToCents(row.current_balance),
    institution: row.institution,
    color: row.color && isFinancialColorValue(row.color) ? row.color : null,
    icon: row.icon && isFinancialIconName(row.icon) ? row.icon : null,
    status: row.status,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAccountToFormValues(account: Account): AccountFormValues {
  return {
    name: account.name,
    type: account.type,
    initialBalance: formatCentsForInput(account.initialBalanceCents),
    institution: account.institution ?? "",
    color: account.color ?? "",
    icon: account.icon ?? "",
  };
}
