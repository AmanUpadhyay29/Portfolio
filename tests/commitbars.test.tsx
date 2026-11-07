// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CommitBars, { Bars, barHeight } from "../src/components/CommitBars";
import { scanBuilt } from "../scripts/guard/scan";
import { contrast } from "../src/lib/contrast";

describe("<CommitBars />", () => {
  it("renders one bar per day and the tallest is 1", () => {
    const { container } = render(<CommitBars repo="v1" days={60} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-label")).toBe("Commits per day, last 60 days");
    const bars = [...root.children] as HTMLElement[];
    expect(bars).toHaveLength(60);
    expect(bars.some((b) => b.style.getPropertyValue("--h") === "1")).toBe(true);
  });

  it("emits a unitless height with at most three decimals", () => {
    expect(renderToStaticMarkup(<Bars series={[1, 3]} />)).toBe('<i style="--h:0.333"></i><i style="--h:1"></i>');
    expect(barHeight(0, 7)).toBe(0);
  });

  it("no rendered bar trips the content guard, for every n/max with max up to 90", () => {
    for (let max = 1; max <= 90; max++) {
      const series = Array.from({ length: max + 1 }, (_, n) => n);
      const html = `<div class="commit-bars">${renderToStaticMarkup(<Bars series={series} />)}</div>`;
      expect(scanBuilt(html, "out/index.html", []), `max ${max}`).toEqual([]);
      expect(html).not.toContain("%");
    }
  });
});

describe("commit bar colour", () => {
  const css = readFileSync(join(import.meta.dirname, "../src/app/globals.css"), "utf8");
  const block = (sel: string) => css.match(new RegExp(`${sel}\\s*\\{([^}]*)\\}`))![1];
  const token = (body: string, name: string) => body.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{3,6})`, "i"))![1];
  const barVar = block("\\.commit-bars i").match(/background:\s*var\(--([\w-]+)\)/)![1];

  it.each([
    ["day", block('html\\[data-theme="day"\\]')],
    ["night", block(':root,\\s*html\\[data-theme="night"\\]')],
  ])("%s bars reach 3:1 on the panel and the page background", (_name, theme) => {
    const bar = token(theme, barVar);
    for (const bg of ["panel", "bg", "bg-lift"]) {
      expect(contrast(bar, token(theme, bg)), bg).toBeGreaterThanOrEqual(3);
    }
  });
});
