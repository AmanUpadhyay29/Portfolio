import { describe, expect, it } from "vitest";
import { THEME_KEY, resolveTheme, themeInitScript } from "../src/lib/theme";
import { contrast } from "../src/lib/contrast";

type FakeDoc = { documentElement: { dataset: Record<string, string>; classList: { add(c: string): void; added: string[] } } };

function fakeDoc(): FakeDoc {
  const added: string[] = [];
  return { documentElement: { dataset: {}, classList: { added, add: (c: string) => void added.push(c) } } };
}

function run(doc: FakeDoc, localStorage: unknown, matchMedia: unknown) {
  new Function("document", "localStorage", "matchMedia", themeInitScript)(doc, localStorage, matchMedia);
}

describe("resolveTheme", () => {
  it("defaults to night and accepts only day", () => {
    expect(resolveTheme(null)).toBe("night");
    expect(resolveTheme("day")).toBe("day");
    expect(resolveTheme("night")).toBe("night");
    expect(resolveTheme("garbage")).toBe("night");
    expect(resolveTheme("")).toBe("night");
  });
  it("uses the documented key", () => expect(THEME_KEY).toBe("pf-theme"));
});

describe("themeInitScript", () => {
  it("falls back to night for a garbage stored value", () => {
    const doc = fakeDoc();
    run(doc, { getItem: () => "garbage" }, () => ({ matches: false }));
    expect(doc.documentElement.dataset.theme).toBe("night");
  });
  it.each([null, "day", "night", "garbage", "", "DAY"])("agrees with resolveTheme for %j", (stored) => {
    const doc = fakeDoc();
    run(doc, { getItem: () => stored }, () => ({ matches: false }));
    expect(doc.documentElement.dataset.theme).toBe(resolveTheme(stored));
  });
  it("adds motion-ok when motion is allowed", () => {
    const doc = fakeDoc();
    run(doc, { getItem: () => null }, () => ({ matches: false }));
    expect(doc.documentElement.classList.added).toEqual(["motion-ok"]);
  });
  it("sets night and does not throw when localStorage throws", () => {
    const doc = fakeDoc();
    const ls = { getItem: () => { throw new Error("blocked"); } };
    expect(() => run(doc, ls, () => ({ matches: false }))).not.toThrow();
    expect(doc.documentElement.dataset.theme).toBe("night");
    expect(doc.documentElement.classList.added).toEqual(["motion-ok"]);
  });
  it("applies a stored day theme", () => {
    const doc = fakeDoc();
    run(doc, { getItem: () => "day" }, () => ({ matches: false }));
    expect(doc.documentElement.dataset.theme).toBe("day");
  });
  it("skips motion-ok under reduced motion", () => {
    const doc = fakeDoc();
    run(doc, { getItem: () => null }, () => ({ matches: true }));
    expect(doc.documentElement.classList.added).toEqual([]);
  });
  it("survives missing localStorage and matchMedia", () => {
    const doc = fakeDoc();
    expect(() => run(doc, undefined, undefined)).not.toThrow();
    expect(doc.documentElement.dataset.theme).toBe("night");
  });
});

const themes = {
  night: { bg: ["#141528", "#262850"], panel: "#1d1f3a", text: "#f3f1ff", muted: "#a7a6c9", primary: "#ffd27a", primaryText: "#2a1f08", status: "#c6f36b" },
  day: { bg: ["#f3f0ff", "#fdf8ef"], panel: "#ffffff", text: "#1c1b33", muted: "#5f5d80", primary: "#f5a524", primaryText: "#2a1f08", status: "#147a3a" },
};

describe.each(Object.entries(themes))("contrast (%s)", (_name, t) => {
  it("helper sanity", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });
  for (const bg of t.bg) {
    it(`text/muted/status on bg ${bg}`, () => {
      expect(contrast(t.text, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.muted, bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.status, bg)).toBeGreaterThanOrEqual(4.5);
    });
  }
  it("text and muted on panel, primary text on primary", () => {
    expect(contrast(t.text, t.panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.muted, t.panel)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(t.primaryText, t.primary)).toBeGreaterThanOrEqual(4.5);
  });
});
