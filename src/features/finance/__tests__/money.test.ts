import { describe, expect, it } from "vitest";

import {
  formatMoneyInput,
  isValidMoneyInput,
  normalizeMoneyInput,
  parseMoneyInput,
} from "../money";

describe("money helpers", () => {
  it("accepts Brazilian and decimal representations", () => {
    expect(isValidMoneyInput("1.234,56")).toBe(true);
    expect(isValidMoneyInput("1234.56")).toBe(true);
    expect(parseMoneyInput("1.234,56")).toBe(1234.56);
  });

  it("supports negative initial balances", () => {
    expect(normalizeMoneyInput(" -250,40 ")).toBe("-250.40");
    expect(parseMoneyInput("-250,40")).toBe(-250.4);
  });

  it("rejects excessive precision and unsafe ranges", () => {
    expect(isValidMoneyInput("10,999")).toBe(false);
    expect(isValidMoneyInput("1234567890123,00")).toBe(false);
    expect(isValidMoneyInput("valor")).toBe(false);
  });

  it("formats values for editable fields", () => {
    expect(formatMoneyInput(1234.5)).toBe("1234,50");
  });
});
