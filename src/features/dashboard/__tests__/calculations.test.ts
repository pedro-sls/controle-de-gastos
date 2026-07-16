import { describe, expect, it } from "vitest";

import {
  calculateDailyAvailable,
  dashboardSnapshotSchema,
  fillCashFlow,
} from "../calculations";
import { getFinancialPeriod } from "../period";

describe("financial period", () => {
  it("uses the configured start day in the current month", () => {
    expect(getFinancialPeriod("2026-07-16", 5)).toMatchObject({
      startDate: "2026-07-05",
      endDate: "2026-08-04",
      daysRemaining: 20,
      totalDays: 31,
    });
  });

  it("starts in the previous month before the configured day", () => {
    expect(getFinancialPeriod("2026-07-03", 5)).toMatchObject({
      startDate: "2026-06-05",
      endDate: "2026-07-04",
      daysRemaining: 2,
    });
  });
});

describe("safe daily spending", () => {
  it("reserves paid and committed expenses", () => {
    expect(calculateDailyAvailable(3000, 1200, 600, 10)).toEqual({
      availableForPeriod: 1200,
      dailyAvailable: 120,
    });
  });

  it("never suggests negative spending", () => {
    expect(calculateDailyAvailable(1000, 900, 300, 5)).toEqual({
      availableForPeriod: 0,
      dailyAvailable: 0,
    });
  });
});

describe("dashboard chart data", () => {
  it("fills days without movement with zero", () => {
    expect(
      fillCashFlow("2026-07-01", "2026-07-03", [
        { date: "2026-07-02", income: 100, expense: 25 },
      ]),
    ).toEqual([
      { date: "2026-07-01", income: 0, expense: 0 },
      { date: "2026-07-02", income: 100, expense: 25 },
      { date: "2026-07-03", income: 0, expense: 0 },
    ]);
  });

  it("rejects malformed database snapshots", () => {
    expect(
      dashboardSnapshotSchema.safeParse({ total_balance: "invalid" }).success,
    ).toBe(false);
  });
});
