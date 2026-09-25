import {
  ArrowLeftRight,
  ChartPie,
  LayoutDashboard,
  Menu,
  Plus,
  Repeat2,
  Settings2,
  Tags,
  Target,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { siteConfig } from "./site";

export type NavigationItem = Readonly<{
  href: string;
  label: string;
  shortLabel?: string;
  description: string;
  icon: LucideIcon;
  exact?: boolean;
  emphasized?: boolean;
  activePathPrefixes?: readonly string[];
}>;

const dashboardItem = {
  href: "/dashboard",
  label: "Dashboard",
  shortLabel: "Início",
  description: "Visão geral da sua vida financeira",
  icon: LayoutDashboard,
  exact: true,
} satisfies NavigationItem;

const transactionsItem = {
  href: "/movimentacoes",
  label: "Movimentações",
  shortLabel: "Movimentos",
  description: "Receitas, despesas e transferências",
  icon: ArrowLeftRight,
} satisfies NavigationItem;

const mobileTransactionsItem = {
  ...transactionsItem,
  exact: true,
} satisfies NavigationItem;

const newTransactionItem = {
  href: "/movimentacoes/nova",
  label: "Nova movimentação",
  shortLabel: "Novo",
  description: "Registrar uma receita, despesa ou transferência",
  icon: Plus,
  exact: true,
  emphasized: true,
} satisfies NavigationItem;

const accountsItem = {
  href: "/contas",
  label: "Contas",
  description: "Contas bancárias, carteiras e cartões",
  icon: WalletCards,
} satisfies NavigationItem;

const categoriesItem = {
  href: "/categorias",
  label: "Categorias",
  description: "Organização das receitas e despesas",
  icon: Tags,
} satisfies NavigationItem;

const budgetsItem = {
  href: "/orcamentos",
  label: "Orçamentos",
  description: "Limites mensais por categoria",
  icon: Target,
} satisfies NavigationItem;

const recurringItem = {
  href: "/recorrencias",
  label: "Recorrências",
  description: "Compromissos e lançamentos repetidos",
  icon: Repeat2,
} satisfies NavigationItem;

const reportsItem = {
  href: "/relatorios",
  label: "Relatórios",
  description: "Análises e comparações por período",
  icon: ChartPie,
} satisfies NavigationItem;

const settingsItem = {
  href: "/configuracoes",
  label: "Configurações",
  description: "Preferências da conta e do aplicativo",
  icon: Settings2,
} satisfies NavigationItem;

const moreItem = {
  href: "/mais",
  label: "Mais opções",
  shortLabel: "Mais",
  description: "Acessar os demais recursos",
  icon: Menu,
  exact: true,
  activePathPrefixes: [
    accountsItem.href,
    categoriesItem.href,
    recurringItem.href,
    reportsItem.href,
    settingsItem.href,
  ],
} satisfies NavigationItem;

export const desktopNavigationItems: readonly NavigationItem[] = [
  dashboardItem,
  transactionsItem,
  accountsItem,
  categoriesItem,
  budgetsItem,
  recurringItem,
  reportsItem,
  settingsItem,
];

export const mobileNavigationItems: readonly NavigationItem[] = [
  dashboardItem,
  mobileTransactionsItem,
  newTransactionItem,
  budgetsItem,
  moreItem,
];

export const moreNavigationItems: readonly NavigationItem[] = [
  accountsItem,
  categoriesItem,
  recurringItem,
  reportsItem,
  settingsItem,
];

export { newTransactionItem };

const pageTitleRoutes = [
  { href: newTransactionItem.href, title: newTransactionItem.label },
  ...desktopNavigationItems.map(({ href, label }) => ({ href, title: label })),
  { href: moreItem.href, title: moreItem.label },
] as const;

function normalizePathname(pathname: string) {
  const [pathOnly = "/"] = pathname.split(/[?#]/, 1);
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;

  return withLeadingSlash.length > 1
    ? withLeadingSlash.replace(/\/+$/, "")
    : withLeadingSlash;
}

export function isCurrentPage(pathname: string, href: string) {
  return normalizePathname(pathname) === normalizePathname(href);
}

export function isNavigationItemActive(
  pathname: string,
  href: string,
  exact = false,
  activePathPrefixes: readonly string[] = [],
) {
  const currentPath = normalizePathname(pathname);
  const targetPath = normalizePathname(href);

  const matchesPath = (candidatePath: string, exactMatch = false) => {
    const normalizedCandidate = normalizePathname(candidatePath);

    return (
      currentPath === normalizedCandidate ||
      (!exactMatch &&
        normalizedCandidate !== "/" &&
        currentPath.startsWith(`${normalizedCandidate}/`))
    );
  };

  return (
    matchesPath(targetPath, exact) ||
    activePathPrefixes.some((prefix) => matchesPath(prefix))
  );
}

export function getPageTitle(pathname: string) {
  const route = pageTitleRoutes.find(({ href }) =>
    isNavigationItemActive(pathname, href),
  );

  return route?.title ?? siteConfig.name;
}
