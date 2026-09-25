import Link from "next/link";

import { cn } from "@/lib/utils";

export function FilterTabs({
  label,
  options,
  value,
}: {
  label: string;
  options: readonly { href: string; label: string; value: string }[];
  value: string;
}) {
  return (
    <nav aria-label={label} className="overflow-x-auto pb-1">
      <ul className="flex min-w-max gap-2">
        {options.map((option) => (
          <li key={option.value}>
            <Link
              href={option.href}
              aria-current={value === option.value ? "page" : undefined}
              className={cn(
                "focus-visible:ring-ring inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium outline-none focus-visible:ring-3",
                value === option.value
                  ? "border-emerald-700 bg-emerald-700 text-white dark:border-emerald-300 dark:bg-emerald-300 dark:text-emerald-950"
                  : "bg-card hover:bg-muted",
              )}
            >
              {option.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
