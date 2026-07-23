import { describe, expect, it } from "vitest";

import {
  getComparisonLabel,
  getDefaultReportPeriod,
  percentageChange,
} from "../calculations";

describe("report calculations", () => {
  it("calculates changes and handles a zero baseline", () => {
    expect(percentageChange(120, 100)).toBe(20);
    expect(percentageChange(10, 0)).toBeNull();
    expect(percentageChange(0, 0)).toBe(0);
  });

  it("classifies lower expenses as favorable", () => {
    expect(getComparisonLabel(80, 100, true)).toMatchObject({
      favorable: true,
    });
  });

  it("builds a six-month default period", () => {
    expect(getDefaultReportPeriod("2026-07-23")).toEqual({
      startDate: "2026-02-01",
      endDate: "2026-07-23",
    });
  });
});
