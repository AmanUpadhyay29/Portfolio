import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import Room from "../src/components/room/Room";

const doc = new JSDOM(renderToStaticMarkup(createElement(Room))).window.document;
const svg = doc.querySelector("svg")!;
const objs = [...doc.querySelectorAll("[data-obj]")];

describe("<Room /> markup", () => {
  it("is a labelled group, not an img, so the links stay reachable", () => {
    expect(svg.getAttribute("role")).toBe("group");
    const ids = (svg.getAttribute("aria-labelledby") ?? "").split(" ");
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) expect(svg.querySelector(`#${id}`)).not.toBeNull();
    expect(svg.querySelector("title")).not.toBeNull();
    expect(svg.querySelector("desc")).not.toBeNull();
  });
  it("has exactly six objects", () => {
    expect(objs.map((o) => o.getAttribute("data-obj")).sort()).toEqual(["matrix", "photo", "query", "rack", "window", "xchart"]);
  });
  it("links the five linked objects", () => {
    const h = Object.fromEntries(objs.map((o) => [o.getAttribute("data-obj"), o.getAttribute("href")]));
    expect(h).toMatchObject({ rack: "/work/trading-platform", matrix: "/work/matrix", xchart: "/work/xchart", query: "/#job", photo: "/#about" });
  });
  it("makes the window a keyboard button without href", () => {
    const w = objs.find((o) => o.getAttribute("data-obj") === "window")!;
    expect(w.getAttribute("role")).toBe("button");
    expect(w.getAttribute("tabindex")).toBe("0");
    expect(w.hasAttribute("href")).toBe(false);
  });
  it("labels every object", () => {
    for (const o of objs) expect((o.getAttribute("aria-label") ?? "").trim()).not.toBe("");
  });
  it("gives every object a focus outline shape", () => {
    for (const o of objs) expect(o.querySelector(".focus-ring")).not.toBeNull();
  });
});

describe("room.css", () => {
  it("keeps the invisible focus rings out of hit-testing", () => {
    const css = readFileSync(new URL("../src/components/room/room.css", import.meta.url), "utf8");
    const rule = /\.room \.focus-ring\s*\{([^}]*)\}/.exec(css);
    expect(rule).not.toBeNull();
    expect(rule![1]).toMatch(/pointer-events:\s*none/);
  });
});
