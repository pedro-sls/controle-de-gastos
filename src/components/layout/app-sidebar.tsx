import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";

import { AppBrand } from "@/components/layout/app-brand";
import { DesktopNavigation } from "@/components/layout/app-navigation";
import { newTransactionItem } from "@/config/navigation";

export function AppSidebar() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground sticky top-0 hidden h-dvh flex-col border-r p-4 lg:flex">
      <AppBrand className="mx-1 mb-7" />

      <Link
        href={newTransactionItem.href}
        className="focus-visible:ring-sidebar-ring mb-5 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors outline-none hover:bg-emerald-800 focus-visible:ring-3 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400"
      >
        <Plus aria-hidden="true" className="size-5" />
        Nova movimentação
      </Link>

      <DesktopNavigation />

      <div className="border-sidebar-border mt-5 flex items-start gap-3 border-t px-2 pt-4">
        <ShieldCheck
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-emerald-700 dark:text-emerald-400"
        />
        <div>
          <p className="text-sm font-medium">Área protegida</p>
          <p className="text-muted-foreground mt-0.5 text-xs leading-5">
            Seus dados permanecem vinculados à sua sessão.
          </p>
        </div>
      </div>
    </aside>
  );
}
