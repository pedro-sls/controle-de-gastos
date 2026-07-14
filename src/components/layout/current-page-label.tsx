"use client";

import { usePathname } from "next/navigation";

import { getPageTitle } from "@/config/navigation";

export function CurrentPageLabel() {
  const pathname = usePathname();

  return (
    <p
      className="truncate text-sm font-semibold sm:text-base"
      aria-live="polite"
      aria-atomic="true"
    >
      {getPageTitle(pathname)}
    </p>
  );
}
