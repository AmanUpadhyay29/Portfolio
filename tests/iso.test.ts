import { describe, expect, it } from "vitest";
import { boxFaces, iso, toPoints } from "../src/components/room/iso";

describe("iso", () => {
  it("maps the origin to the origin", () => {
    expect(iso(0, 0, 0)).toEqual([0, 0]);
  });
  it("projects the x axis down and to the right", () => {
    const [x, y] = iso(100, 0, 0);
    expect(x).toBeCloseTo(86.6, 1);
    expect(y).toBeCloseTo(50, 1);
  });
  it("lifts z straight up", () => {
    expect(iso(0, 0, 10)).toEqual([0, -10]);
  });
});

describe("boxFaces", () => {
  const b = { x: 10, y: 20, z: 5, w: 30, d: 40, h: 12 };
  it("returns a 4-point top face at z + h", () => {
    const { top } = boxFaces(b);
    expect(top).toHaveLength(4);
    for (const p of top) expect(p[2]).toBe(b.z + b.h);
  });
  it("returns 4 points for the left and right faces too", () => {
    const f = boxFaces(b);
    expect(f.left).toHaveLength(4);
    expect(f.right).toHaveLength(4);
  });
});

describe("toPoints", () => {
  it("formats a single point", () => {
    expect(toPoints([[0, 0, 0]])).toBe("0,0");
  });
  it("rounds to two decimals", () => {
    expect(toPoints([[100, 0, 0]])).toBe("86.6,50");
    expect(toPoints([[1, 0, 0], [0, 1, 0]])).toBe("0.87,0.5 -0.87,0.5");
  });
});
