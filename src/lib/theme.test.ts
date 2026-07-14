import { describe, expect, it } from "vitest";

import { getNextTheme, normalizeTheme } from "./theme";

describe("preferência de tema", () => {
  it.each([
    ["system", "system"],
    ["light", "light"],
    ["dark", "dark"],
    [undefined, "system"],
    ["desconhecido", "system"],
  ])("normaliza %s como %s", (theme, expected) => {
    expect(normalizeTheme(theme)).toBe(expected);
  });

  it.each([
    ["system", "light"],
    ["light", "dark"],
    ["dark", "system"],
    [undefined, "light"],
    ["desconhecido", "light"],
  ])("avança de %s para %s", (theme, expected) => {
    expect(getNextTheme(theme)).toBe(expected);
  });
});
