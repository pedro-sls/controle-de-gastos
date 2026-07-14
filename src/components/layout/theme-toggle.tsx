"use client";

import { useSyncExternalStore } from "react";
import { MonitorCog, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const themeOrder = ["system", "light", "dark"] as const;

type ThemeName = (typeof themeOrder)[number];

const themeLabels: Record<ThemeName, string> = {
  dark: "escuro",
  light: "claro",
  system: "do sistema",
};

const themeIcons = {
  dark: Moon,
  light: Sun,
  system: MonitorCog,
};

function subscribeToHydration() {
  return () => undefined;
}

function useHasHydrated() {
  return useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
}

function normalizeTheme(theme?: string): ThemeName {
  return themeOrder.includes(theme as ThemeName)
    ? (theme as ThemeName)
    : "system";
}

export function ThemeToggle() {
  const hasHydrated = useHasHydrated();
  const { setTheme, theme } = useTheme();
  const currentTheme = normalizeTheme(theme);
  const currentIndex = themeOrder.indexOf(currentTheme);
  const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
  const Icon = themeIcons[currentTheme];

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10 gap-2 px-3"
      aria-label={`Tema atual ${themeLabels[currentTheme]}. Alterar para tema ${themeLabels[nextTheme]}.`}
      title={`Tema: ${themeLabels[currentTheme]}`}
      disabled={!hasHydrated}
      onClick={() => setTheme(nextTheme)}
    >
      <Icon aria-hidden="true" />
      <span className="hidden xl:inline">Tema {themeLabels[currentTheme]}</span>
    </Button>
  );
}
