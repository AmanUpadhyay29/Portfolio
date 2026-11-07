import { describe, expect, it } from "vitest";
import { roomObjects } from "../src/components/room/objects";
import { scanText } from "../scripts/guard/scan";

describe("roomObjects", () => {
  it("has exactly the six ids", () => {
    expect(roomObjects.map((o) => o.id).sort()).toEqual(["matrix", "photo", "query", "rack", "window", "xchart"]);
  });
  it("links every object except the window", () => {
    for (const o of roomObjects) {
      if (o.id === "window") expect(o.href).toBeNull();
      else expect(o.href?.startsWith("/")).toBe(true);
    }
  });
  it("uses the agreed hrefs", () => {
    const h = Object.fromEntries(roomObjects.map((o) => [o.id, o.href]));
    expect(h).toMatchObject({ rack: "/work/trading-platform", matrix: "/work/matrix", xchart: "/work/xchart", query: "/#job", photo: "/#about" });
  });
  it("tags the project objects with their repo", () => {
    const r = Object.fromEntries(roomObjects.map((o) => [o.id, o.repo]));
    expect(r).toMatchObject({ rack: "v1", matrix: "matrix", xchart: "xchart" });
  });
  it("keeps every blurb clean under the content guard", () => {
    for (const o of roomObjects) expect(scanText(o.blurb, `${o.id}.txt`, [])).toEqual([]);
  });
});
