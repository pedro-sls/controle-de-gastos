import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  icon: LucideIcon;
  title: string;
};

export function EmptyState({
  actionHref,
  actionLabel,
  description,
  icon: Icon,
  title,
}: EmptyStateProps) {
  return (
    <div className="bg-card flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center">
      <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-2xl">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-md leading-6">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className={cn(buttonVariants(), "mt-6 min-h-11 px-4")}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
