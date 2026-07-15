import { describe, expect, it } from "vitest";

import type { AccountBalanceRow } from "../types";
import {
  AccountMappingError,
  buildAccountInsertPayload,
  buildAccountUpdatePayload,
  mapAccountBalanceRow,
  mapAccountToFormValues,
} from "../mappers";
import { accountFormSchema } from "../schemas";

const accountRow = {
  id: "10000000-0000-4000-8000-000000000001",
  user_id: "10000000-0000-4000-8000-000000000002",
  name: "Conta principal",
  type: "checking",
  initial_balance: -10.05,
  current_balance: 89.95,
  institution: "Banco Exemplo",
  color: "#3B82F6",
  icon: "Building2",
  status: "active",
  archived_at: null,
  created_at: "2026-07-13T12:00:00.000Z",
  updated_at: "2026-07-13T13:00:00.000Z",
} satisfies AccountBalanceRow;

describe("payloads de conta", () => {
  it("monta insert com whitelist, trim, valor decimal e opcionais nulos", () => {
    const values = accountFormSchema.parse({
      name: "  Carteira  ",
      type: "wallet",
      initialBalance: "-1.234,56",
      institution: "   ",
      color: "",
      icon: "",
      isAdmin: true,
      archivedAt: "2026-07-13T12:00:00.000Z",
    });

    expect(
      buildAccountInsertPayload("10000000-0000-4000-8000-000000000002", values),
    ).toEqual({
      user_id: "10000000-0000-4000-8000-000000000002",
      name: "Carteira",
      type: "wallet",
      initial_balance: -1_234.56,
      institution: null,
      color: null,
      icon: null,
    });
  });

  it("monta update apenas com campos graváveis", () => {
    const values = accountFormSchema.parse({
      name: "Conta digital",
      type: "digital",
      initialBalance: "0,01",
      institution: "Instituição",
      color: "#14B8A6",
      icon: "Smartphone",
    });

    expect(buildAccountUpdatePayload(values)).toEqual({
      name: "Conta digital",
      type: "digital",
      initial_balance: 0.01,
      institution: "Instituição",
      color: "#14B8A6",
      icon: "Smartphone",
    });
  });
});

describe("mapeamento de conta", () => {
  it("converte números do banco em centavos", () => {
    const account = mapAccountBalanceRow(accountRow);

    expect(account).toMatchObject({
      id: accountRow.id,
      initialBalanceCents: -1_005,
      currentBalanceCents: 8_995,
      color: "#3B82F6",
      icon: "Building2",
      status: "active",
    });
  });

  it("descarta aparência desconhecida em vez de propagá-la", () => {
    const account = mapAccountBalanceRow({
      ...accountRow,
      color: "#123456",
      icon: "UnknownIcon",
    });

    expect(account.color).toBeNull();
    expect(account.icon).toBeNull();
  });

  it("rejeita linhas incompletas da view", () => {
    expect(() =>
      mapAccountBalanceRow({ ...accountRow, current_balance: null }),
    ).toThrow(AccountMappingError);
  });

  it("gera os valores iniciais do formulário", () => {
    expect(mapAccountToFormValues(mapAccountBalanceRow(accountRow))).toEqual({
      name: "Conta principal",
      type: "checking",
      initialBalance: "-10,05",
      institution: "Banco Exemplo",
      color: "#3B82F6",
      icon: "Building2",
    });
  });
});
