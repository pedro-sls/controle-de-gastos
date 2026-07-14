import { describe, expect, it } from "vitest";

import {
  centsToDatabaseNumber,
  centsToDecimalString,
  databaseNumberToCents,
  formatBrlFromCents,
  formatCentsForInput,
  MAX_MONEY_CENTS,
  parseBrazilianMoneyToCents,
} from "../money";

describe("parseBrazilianMoneyToCents", () => {
  it.each([
    ["0", 0],
    ["-0", 0],
    ["000,09", 9],
    ["0,5", 50],
    ["12,34", 1_234],
    ["1.234,56", 123_456],
    ["R$ 1.234,56", 123_456],
    ["R$\u00a01.234,56", 123_456],
    ["-R$ 1.234,56", -123_456],
    ["R$ -0,01", -1],
    ["+42", 4_200],
    ["1.23", 123],
    ["12.3", 1_230],
    ["1.234", 123_400],
    ["12.345", 1_234_500],
    ["1.234.567", 123_456_700],
    ["999.999.999.999,99", MAX_MONEY_CENTS],
    ["-999.999.999.999,99", -MAX_MONEY_CENTS],
  ])("converte %s em %i centavos", (value, expected) => {
    expect(parseBrazilianMoneyToCents(value)).toBe(expected);
  });

  it.each([
    "",
    "   ",
    "R$",
    "abc",
    ",50",
    ".50",
    "1,",
    "1,234",
    "1.23,45",
    "1.234.56",
    "12.3456",
    "1234.567",
    "1,2345",
    "--1",
    "R$ R$ 1",
    "US$ 1,00",
    "1e3",
    "NaN",
    "Infinity",
    "1.000.000.000.000,00",
  ])("rejeita a entrada ambígua ou inválida %s", (value) => {
    expect(parseBrazilianMoneyToCents(value)).toBeNull();
  });
});

describe("conversões de centavos", () => {
  it.each([
    [0, 0],
    [-0, 0],
    [0.01, 1],
    [-0.05, -5],
    [1_234.56, 123_456],
    [1.005, 101],
    [-1.005, -101],
    [999_999_999_999.99, MAX_MONEY_CENTS],
  ])("converte o número de banco %d em %i centavos", (value, expected) => {
    expect(databaseNumberToCents(value)).toBe(expected);
  });

  it.each([
    [0, 0],
    [1, 0.01],
    [-5, -0.05],
    [123_456, 1_234.56],
    [MAX_MONEY_CENTS, 999_999_999_999.99],
  ])("converte %i para o número de banco %d", (cents, expected) => {
    expect(centsToDatabaseNumber(cents)).toBe(expected);
  });

  it.each([
    [0, "0.00"],
    [1, "0.01"],
    [-5, "-0.05"],
    [123_456, "1234.56"],
    [MAX_MONEY_CENTS, "999999999999.99"],
  ])("serializa %i como %s", (cents, expected) => {
    expect(centsToDecimalString(cents)).toBe(expected);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, 1.5, MAX_MONEY_CENTS + 1])(
    "rejeita o valor em centavos inválido %s",
    (cents) => {
      expect(() => centsToDatabaseNumber(cents)).toThrow(RangeError);
      expect(() => centsToDecimalString(cents)).toThrow(RangeError);
      expect(() => formatCentsForInput(cents)).toThrow(RangeError);
    },
  );

  it.each([
    Number.NaN,
    Number.NEGATIVE_INFINITY,
    1_000_000_000_000,
    -1_000_000_000_000,
  ])("rejeita o número de banco inválido %s", (value) => {
    expect(() => databaseNumberToCents(value)).toThrow(RangeError);
  });
});

describe("formatação monetária", () => {
  it.each([
    [0, "0,00"],
    [1, "0,01"],
    [-5, "-0,05"],
    [123_456, "1.234,56"],
    [MAX_MONEY_CENTS, "999.999.999.999,99"],
  ])("formata %i centavos para campo como %s", (cents, expected) => {
    expect(formatCentsForInput(cents)).toBe(expected);
  });

  it.each([
    [0, "R$ 0,00"],
    [1, "R$ 0,01"],
    [-5, "-R$ 0,05"],
    [123_456, "R$ 1.234,56"],
  ])("formata %i centavos em reais como %s", (cents, expected) => {
    expect(formatBrlFromCents(cents)).toBe(expected);
  });
});
