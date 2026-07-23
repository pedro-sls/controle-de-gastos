"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import type { ThemeName } from "@/lib/theme";

export function ThemePreferenceSync({ theme }: { theme: ThemeName }) {
  const { setTheme } = useTheme();
  useEffect(() => {
    setTheme(theme);
  }, [setTheme, theme]);
  return null;
}
