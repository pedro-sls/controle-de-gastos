import Link from "next/link";
import { WalletCards } from "lucide-react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type AppBrandProps = {
  compact?: boolean;
  className?: string;
};

export function AppBrand({ compact = false, className }: AppBrandProps) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "focus-visible:ring-ring flex items-center gap-3 rounded-xl outline-none focus-visible:ring-3",
        className,
      )}
      aria-label={`${siteConfig.name}, ir para o dashboard`}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm dark:bg-emerald-500 dark:text-emerald-950">
        <WalletCards aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-base font-semibold tracking-tight">
          {siteConfig.name}
        </span>
        {!compact && (
          <span className="text-muted-foreground block text-xs leading-5">
            Dinheiro sob controle
          </span>
        )}
      </span>
    </Link>
  );
}
