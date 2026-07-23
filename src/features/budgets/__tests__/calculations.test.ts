import { describe, expect, it } from "vitest";

import {
  getBudgetProgressWidth,
  getBudgetRemaining,
  getBudgetStatus,
  shiftMonth,
} from "../calculations";

describe("budget calculations", () => {
  it("classifies all alert bands", () => {
    expect(getBudgetStatus(74, 100)).toBe("healthy");
    expect(getBudgetStatus(75, 100)).toBe("attention");
    expect(getBudgetStatus(90, 100)).toBe("near_limit");
    expect(getBudgetStatus(100, 100)).toBe("exceeded");
  });

  it("calculates remaining values and clamps visual progress", () => {
    expect(getBudgetRemaining(120, 100)).toBe(-20);
    expect(getBudgetProgressWidth(145)).toBe(100);
    expect(getBudgetProgressWidth(-2)).toBe(0);
  });

  it("shifts periods across years", () => {
    expect(shiftMonth("2026-01-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-12-01", 1)).toBe("2027-01");
  });
});
