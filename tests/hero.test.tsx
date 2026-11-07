import { existsSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import Hero from "../src/components/sections/Hero";
import HyperName from "../src/components/HyperName";
import { site } from "../src/content/site";

const doc = new JSDOM(renderToStaticMarkup(createElement(Hero))).window.document;

describe("<Hero />", () => {
  it("reads exactly the headline", () => {
    const h1 = doc.querySelector("h1")!;
    expect(h1.textContent!.replace(/\s+/g, " ").trim()).toBe("Uptime is my job. Building is my habit.");
  });
  it("shows the roles line", () => {
    expect(doc.body.textContent).toContain(site.rolesLine);
  });
  it("links a résumé only when one is available, and then to a file in public/", () => {
    const links = [...doc.querySelectorAll("a")].filter((a) =>
      /resume|résumé/i.test(`${a.textContent} ${a.getAttribute("href")}`),
    );
    if (!site.resume.available) {
      expect(links).toEqual([]);
      return;
    }
    expect(links.map((a) => a.getAttribute("href"))).toEqual([site.resume.href]);
    expect(existsSync(join(import.meta.dirname, "..", "public", site.resume.href)), site.resume.href).toBe(true);
  });
  it("has GitHub, LinkedIn and Email buttons", () => {
    const hrefs = [...doc.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toContain(site.links.github);
    expect(hrefs).toContain(site.links.linkedin);
    expect(hrefs).toContain(`mailto:${site.links.email}`);
  });
  it("mirrors the room objects in the text list, window as a button", () => {
    const list = doc.querySelector("[data-text-links]")!;
    const hrefs = [...list.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/work/trading-platform", "/work/matrix", "/work/xchart", "/#job", "/#about"]);
    expect(list.querySelector('button[type="button"]')).not.toBeNull();
  });
});

describe("<HyperName />", () => {
  it("server-renders the plain name with no hidden styles", () => {
    const html = renderToStaticMarkup(createElement(HyperName, { text: site.name }));
    expect(html).toBe(`<span>${site.name}</span>`);
    expect(html).not.toMatch(/opacity/);
  });
});
