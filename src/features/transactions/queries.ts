import "server-only";

import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import type { TransactionFilters, TransactionInput } from "./schemas";

const PAGE_SIZE = 20;

export type TransactionOption = {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  archivedAt: string | null;
};

export type CategoryOption = TransactionOption & {
  type: "income" | "expense";
};

export type TransactionListItemDTO = {
  id: string;
  editId: string;
  entryKind: "transaction" | "transfer";
  kind: "income" | "expense" | "transfer";
  direction: "in" | "out";
  description: string;
  amount: number;
  transactionDate: string;
  dueDate: string | null;
  effectiveStatus: "paid" | "pending" | "canceled" | "overdue";
  paymentMethod: string;
  isFixed: boolean;
  account: TransactionOption | null;
  destinationAccount: TransactionOption | null;
  category: CategoryOption | null;
};

export type TransactionListResult = {
  items: TransactionListItemDTO[];
  accounts: TransactionOption[];
  categories: CategoryOption[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type EditableEntry = {
  id: string;
  entryKind: "transaction" | "transfer";
  input: TransactionInput;
};

const transactionColumns =
  "id, account_id, category_id, description, amount, type, transaction_date, due_date, status, effective_status, paid_date, payment_method, is_fixed, note, transfer_id, created_at";

const accountColumns = "id, name, color, icon, archived_at";
const categoryColumns = "id, name, type, color, icon, archived_at";

function toAccountOption(row: {
  id: string | null;
  name: string | null;
  color: string | null;
  icon: string | null;
  archived_at: string | null;
}): TransactionOption | null {
  if (!row.id || !row.name) return null;
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    archivedAt: row.archived_at,
  };
}

function toCategoryOption(row: {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string | null;
  icon: string | null;
  archived_at: string | null;
}): CategoryOption {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    icon: row.icon,
    archivedAt: row.archived_at,
  };
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function getTransactionOptions() {
  const identity = await requireUser();
  const supabase = await createClient();
  const [accountsResult, categoriesResult] = await Promise.all([
    supabase
      .from("account_balances")
      .select(accountColumns)
      .eq("user_id", identity.id)
      .order("name"),
    supabase
      .from("categories")
      .select(categoryColumns)
      .eq("user_id", identity.id)
      .order("name"),
  ]);

  if (accountsResult.error || categoriesResult.error) {
    throw new Error("Não foi possível carregar as opções da movimentação.");
  }

  return {
    accounts: (accountsResult.data ?? [])
      .map(toAccountOption)
      .filter((account) => account !== null),
    categories: (categoriesResult.data ?? []).map(toCategoryOption),
  };
}

export async function getTransactions(
  filters: TransactionFilters,
): Promise<TransactionListResult> {
  const identity = await requireUser();
  const supabase = await createClient();
  let query = supabase
    .from("transactions_with_effective_status")
    .select(transactionColumns, { count: "exact" })
    .eq("user_id", identity.id)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.accountId) {
    query = query.eq("account_id", filters.accountId);
  } else {
    query = query.neq("type", "transfer_in");
  }

  if (filters.kind === "transfer") query = query.like("type", "transfer_%");
  if (filters.kind === "income" || filters.kind === "expense") {
    query = query.eq("type", filters.kind);
  }
  if (filters.status === "overdue") {
    query = query.eq("effective_status", "overdue");
  } else if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.from) query = query.gte("transaction_date", filters.from);
  if (filters.to) query = query.lte("transaction_date", filters.to);
  if (filters.search) {
    query = query.ilike(
      "description",
      `%${escapeLikePattern(filters.search)}%`,
    );
  }

  const from = (filters.page - 1) * PAGE_SIZE;
  query = query.range(from, from + PAGE_SIZE - 1);

  const [transactionsResult, options] = await Promise.all([
    query,
    getTransactionOptions(),
  ]);

  if (transactionsResult.error) {
    throw new Error("Não foi possível carregar as movimentações.");
  }

  const rows = transactionsResult.data ?? [];
  const transferIds = [
    ...new Set(
      rows
        .map((row) => row.transfer_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const transfersResult = transferIds.length
    ? await supabase
        .from("transfers")
        .select("id, source_account_id, destination_account_id")
        .eq("user_id", identity.id)
        .in("id", transferIds)
    : { data: [], error: null };

  if (transfersResult.error) {
    throw new Error("Não foi possível carregar as transferências.");
  }

  const accountMap = new Map(
    options.accounts.map((account) => [account.id, account]),
  );
  const categoryMap = new Map(
    options.categories.map((category) => [category.id, category]),
  );
  const transferMap = new Map(
    (transfersResult.data ?? []).map((transfer) => [transfer.id, transfer]),
  );

  const items = rows.flatMap((row): TransactionListItemDTO[] => {
    if (
      !row.id ||
      !row.account_id ||
      !row.description ||
      row.amount === null ||
      !row.type ||
      !row.transaction_date ||
      !row.status ||
      !row.payment_method
    ) {
      return [];
    }

    const isTransfer =
      row.type === "transfer_in" || row.type === "transfer_out";
    const transfer = row.transfer_id ? transferMap.get(row.transfer_id) : null;
    const effectiveStatus = ["paid", "pending", "canceled", "overdue"].includes(
      row.effective_status ?? "",
    )
      ? (row.effective_status as TransactionListItemDTO["effectiveStatus"])
      : row.status;

    return [
      {
        id: row.id,
        editId: isTransfer && row.transfer_id ? row.transfer_id : row.id,
        entryKind: isTransfer ? "transfer" : "transaction",
        kind:
          isTransfer || (row.type !== "income" && row.type !== "expense")
            ? "transfer"
            : row.type,
        direction:
          row.type === "income" || row.type === "transfer_in" ? "in" : "out",
        description: row.description,
        amount: row.amount,
        transactionDate: row.transaction_date,
        dueDate: row.due_date,
        effectiveStatus,
        paymentMethod: row.payment_method,
        isFixed: row.is_fixed ?? false,
        account: accountMap.get(row.account_id) ?? null,
        destinationAccount:
          isTransfer && transfer
            ? (accountMap.get(
                row.type === "transfer_out"
                  ? transfer.destination_account_id
                  : transfer.source_account_id,
              ) ?? null)
            : null,
        category: row.category_id
          ? (categoryMap.get(row.category_id) ?? null)
          : null,
      },
    ];
  });

  const total = transactionsResult.count ?? 0;
  return {
    items,
    accounts: options.accounts,
    categories: options.categories,
    page: filters.page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getEditableEntry(
  id: string,
): Promise<EditableEntry | null> {
  const identity = await requireUser();
  const supabase = await createClient();
  const [transactionResult, transferResult] = await Promise.all([
    supabase
      .from("transactions")
      .select(
        "id, account_id, category_id, description, amount, type, transaction_date, due_date, status, paid_date, payment_method, is_fixed, note",
      )
      .eq("id", id)
      .eq("user_id", identity.id)
      .is("transfer_id", null)
      .maybeSingle(),
    supabase
      .from("transfers")
      .select(
        "id, source_account_id, destination_account_id, description, amount, transaction_date, due_date, status, paid_date, note",
      )
      .eq("id", id)
      .eq("user_id", identity.id)
      .maybeSingle(),
  ]);

  if (transactionResult.error || transferResult.error) {
    throw new Error("Não foi possível carregar a movimentação.");
  }

  if (transferResult.data) {
    const entry = transferResult.data;
    return {
      id: entry.id,
      entryKind: "transfer",
      input: {
        kind: "transfer",
        accountId: entry.source_account_id,
        destinationAccountId: entry.destination_account_id,
        categoryId: "",
        description: entry.description,
        amount: entry.amount.toFixed(2).replace(".", ","),
        transactionDate: entry.transaction_date,
        dueDate: entry.due_date ?? "",
        status: entry.status,
        paidDate: entry.paid_date ?? "",
        paymentMethod: "bank_transfer",
        isFixed: false,
        note: entry.note ?? "",
      },
    };
  }

  if (transactionResult.data) {
    const entry = transactionResult.data;
    if (entry.type !== "income" && entry.type !== "expense") return null;
    return {
      id: entry.id,
      entryKind: "transaction",
      input: {
        kind: entry.type,
        accountId: entry.account_id,
        destinationAccountId: "",
        categoryId: entry.category_id ?? "",
        description: entry.description,
        amount: entry.amount.toFixed(2).replace(".", ","),
        transactionDate: entry.transaction_date,
        dueDate: entry.due_date ?? "",
        status: entry.status,
        paidDate: entry.paid_date ?? "",
        paymentMethod: entry.payment_method,
        isFixed: entry.is_fixed,
        note: entry.note ?? "",
      },
    };
  }

  return null;
}
