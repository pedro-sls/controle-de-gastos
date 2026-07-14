"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  desktopNavigationItems,
  isCurrentPage,
  isNavigationItemActive,
  mobileNavigationItems,
} from "@/config/navigation";
import { cn } from "@/lib/utils";

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1"
    >
      <ul className="space-y-1">
        {desktopNavigationItems.map((item) => {
          const isActive = isNavigationItemActive(
            pathname,
            item.href,
            item.exact,
            item.activePathPrefixes,
          );
          const isCurrent = isCurrentPage(pathname, item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                data-active={isActive || undefined}
                title={item.description}
                className={cn(
                  "text-sidebar-foreground focus-visible:ring-sidebar-ring relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors outline-none before:absolute before:left-0 before:h-5 before:w-1 before:scale-y-0 before:rounded-full before:bg-emerald-700 before:transition-transform focus-visible:ring-3 dark:before:bg-emerald-400",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "data-[active]:bg-emerald-100 data-[active]:font-semibold data-[active]:text-emerald-950 data-[active]:before:scale-y-100 dark:data-[active]:bg-emerald-950 dark:data-[active]:text-emerald-100",
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal para celular"
      className="bg-background/95 supports-backdrop-filter:bg-background/85 fixed inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid min-h-16 max-w-lg grid-cols-5 px-1">
        {mobileNavigationItems.map((item) => {
          const isActive = isNavigationItemActive(
            pathname,
            item.href,
            item.exact,
            item.activePathPrefixes,
          );
          const isCurrent = isCurrentPage(pathname, item.href);
          const Icon = item.icon;

          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                data-active={isActive || undefined}
                title={item.description}
                className={cn(
                  "text-muted-foreground focus-visible:ring-ring group/nav-item relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.6875rem] font-medium transition-colors outline-none after:absolute after:bottom-0.5 after:size-1 after:scale-0 after:rounded-full after:bg-emerald-700 after:transition-transform focus-visible:ring-3 dark:after:bg-emerald-300",
                  "hover:text-foreground data-[active]:font-semibold data-[active]:text-emerald-800 data-[active]:after:scale-100 dark:data-[active]:text-emerald-300",
                  item.emphasized &&
                    "-mt-4 text-emerald-800 dark:text-emerald-300",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg",
                    item.emphasized &&
                      "ring-background size-12 rounded-full bg-emerald-700 text-white shadow-lg ring-4 shadow-emerald-950/20 group-data-[active]/nav-item:ring-[6px] dark:bg-emerald-500 dark:text-emerald-950",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn("size-5", item.emphasized && "size-6")}
                  />
                </span>
                <span className="max-w-full truncate">
                  {item.shortLabel ?? item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
