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
    <nav aria-label="Navegação principal" className="min-h-0 flex-1">
      <ul className="space-y-1">
        {desktopNavigationItems.map((item) => {
          const isActive = isNavigationItemActive(
            pathname,
            item.href,
            item.exact,
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
                  "text-sidebar-foreground focus-visible:ring-sidebar-ring flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "data-[active]:bg-emerald-100 data-[active]:text-emerald-950 dark:data-[active]:bg-emerald-950 dark:data-[active]:text-emerald-100",
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
                  "text-muted-foreground focus-visible:ring-ring relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[0.6875rem] font-medium transition-colors outline-none focus-visible:ring-3",
                  "hover:text-foreground data-[active]:text-emerald-800 dark:data-[active]:text-emerald-300",
                  item.emphasized &&
                    "-mt-4 text-emerald-800 dark:text-emerald-300",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg",
                    item.emphasized &&
                      "ring-background size-12 rounded-full bg-emerald-700 text-white shadow-lg ring-4 shadow-emerald-950/20 dark:bg-emerald-500 dark:text-emerald-950",
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
