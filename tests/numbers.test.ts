import { describe, expect, it } from "vitest";
import data from "../src/data/numbers.json";
import { asOfLabel, formatCount, getRepo, sinceLabel } from "../src/lib/numbers";

describe("numbers", () => {
  it("formats counts with a thousands separator", () => {
    expect(formatCount(1234)).toBe("1,234");
  });
  it("builds a since label", () => {
    expect(sinceLabel("2026-05-10")).toBe("since May 2026");
  });
  it("builds an as-of label", () => {
    expect(asOfLabel()).toMatch(/^as of \d{1,2} [A-Z][a-z]{2} 20\d\d$/);
  });
  it("has exactly 90 daily entries per repo", () => {
    for (const k of ["v1", "matrix", "xchart"] as const) {
      expect(getRepo(k).daily).toHaveLength(90);
    }
  });
  it("each total covers its last 90 days", () => {
    for (const r of Object.values(data.repos)) {
      expect(r.total).toBeGreaterThan(0);
      expect(r.total).toBeGreaterThanOrEqual(r.daily.reduce((a, n) => a + n, 0));
    }
  });
});
