import { describe, expect, it } from "vitest";

import {
  desktopNavigationItems,
  getPageTitle,
  isCurrentPage,
  isNavigationItemActive,
  mobileNavigationItems,
  moreNavigationItems,
  newTransactionItem,
} from "./navigation";

describe("navegação do aplicativo", () => {
  it("identifica a rota exata", () => {
    expect(isNavigationItemActive("/contas", "/contas")).toBe(true);
    expect(isCurrentPage("/contas/", "/contas")).toBe(true);
  });

  it("mantém a seção ativa em uma subrota", () => {
    expect(
      isNavigationItemActive("/movimentacoes/nova", "/movimentacoes"),
    ).toBe(true);
  });

  it("respeita itens configurados para correspondência exata", () => {
    expect(
      isNavigationItemActive("/movimentacoes/nova", "/movimentacoes", true),
    ).toBe(false);
  });

  it("não confunde rotas que apenas compartilham um prefixo", () => {
    expect(isNavigationItemActive("/contas-extras", "/contas")).toBe(false);
    expect(isNavigationItemActive("/minhas-contas", "/contas")).toBe(false);
  });

  it.each([
    ["/dashboard", "Dashboard"],
    ["/movimentacoes/nova", "Nova movimentação"],
    ["/movimentacoes/nova/confirmar", "Nova movimentação"],
    ["/contas/123", "Contas"],
    ["/mais", "Mais opções"],
    ["/rota-desconhecida", "MeuSaldo"],
    ["/contas-extras", "MeuSaldo"],
  ])("resolve o título de %s", (pathname, expected) => {
    expect(getPageTitle(pathname)).toBe(expected);
  });

  it("mantém destinos únicos e absolutos", () => {
    const items = [
      ...desktopNavigationItems,
      ...mobileNavigationItems,
      ...moreNavigationItems,
      newTransactionItem,
    ];
    const uniqueHrefs = new Set(items.map(({ href }) => href));
    const catalogHrefs = new Set(
      [
        ...desktopNavigationItems,
        newTransactionItem,
        ...mobileNavigationItems,
      ].map(({ href }) => href),
    );

    expect(items.every(({ href }) => href.startsWith("/"))).toBe(true);
    expect(uniqueHrefs.size).toBe(10);
    expect(
      moreNavigationItems.every(({ href }) => catalogHrefs.has(href)),
    ).toBe(true);
  });
});
