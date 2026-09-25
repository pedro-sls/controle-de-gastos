export const themeOrder = ["system", "light", "dark"] as const;

export type ThemeName = (typeof themeOrder)[number];

export function normalizeTheme(theme?: string): ThemeName {
  return themeOrder.includes(theme as ThemeName)
    ? (theme as ThemeName)
    : "system";
}

export function getNextTheme(theme?: string): ThemeName {
  const currentTheme = normalizeTheme(theme);
  const currentIndex = themeOrder.indexOf(currentTheme);

  return themeOrder[(currentIndex + 1) % themeOrder.length] ?? "system";
}
