import { transactionFilterSchema, type TransactionFilters } from "./schemas";

export type TransactionSearchParams = Record<
  string,
  string | string[] | undefined
>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function parseTransactionFilters(
  params: TransactionSearchParams,
): TransactionFilters {
  return transactionFilterSchema.parse({
    search: firstValue(params.busca),
    kind: firstValue(params.tipo),
    status: firstValue(params.estado),
    accountId: firstValue(params.conta),
    categoryId: firstValue(params.categoria),
    from: firstValue(params.de),
    to: firstValue(params.ate),
    page: firstValue(params.pagina) || "1",
  });
}

export function buildTransactionHref(
  filters: TransactionFilters,
  overrides: Partial<TransactionFilters> = {},
) {
  const next = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (next.search) params.set("busca", next.search);
  if (next.kind !== "all") params.set("tipo", next.kind);
  if (next.status !== "all") params.set("estado", next.status);
  if (next.accountId) params.set("conta", next.accountId);
  if (next.categoryId) params.set("categoria", next.categoryId);
  if (next.from) params.set("de", next.from);
  if (next.to) params.set("ate", next.to);
  if (next.page > 1) params.set("pagina", String(next.page));

  const query = params.toString();
  return query ? `/movimentacoes?${query}` : "/movimentacoes";
}
