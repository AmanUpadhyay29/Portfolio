import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { evaluate, scriptSrcs } from "../scripts/js-budget";

const dirs: string[] = [];
afterEach(() => {
  while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true });
});

function fixture(jsBytes: number, head?: string): string {
  const dir = mkdtempSync(join(tmpdir(), "budget-"));
  dirs.push(dir);
  mkdirSync(join(dir, "_next"), { recursive: true });
  writeFileSync(join(dir, "_next", "a.js"), randomBytes(jsBytes)); // random bytes do not compress
  writeFileSync(join(dir, "_next", "legacy.js"), randomBytes(500_000));
  writeFileSync(
    join(dir, "index.html"),
    `<html><head>${head ?? `<script src="/_next/a.js" async=""></script><script src="/_next/legacy.js" noModule=""></script>`}</head></html>`,
  );
  return dir;
}

describe("js budget", () => {
  it("ignores noModule scripts", () => {
    expect(scriptSrcs(`<script src="/_next/a.js" async=""></script><script src="/_next/l.js" noModule=""></script>`)).toEqual([
      "/_next/a.js",
    ]);
  });
  it("is under the limit", () => {
    const r = evaluate(fixture(100 * 1024));
    expect(r.over).toBe(false);
    expect(r.kb).toBeGreaterThan(90);
    expect(r.scripts).toEqual(["/_next/a.js"]);
  });
  it("is over the limit", () => {
    expect(evaluate(fixture(100 * 1024), 50).over).toBe(true);
    expect(evaluate(fixture(200 * 1024)).over).toBe(true);
  });
  it("throws when there are no scripts", () => {
    expect(() => evaluate(fixture(10, "<title>x</title>"))).toThrow(/found no scripts/);
  });
  it("throws a clear error when index.html is missing", () => {
    const dir = mkdtempSync(join(tmpdir(), "budget-"));
    dirs.push(dir);
    expect(() => evaluate(dir)).toThrow(/pnpm build first/);
  });
  it("counts a single-quoted src", () => {
    const r = evaluate(fixture(100 * 1024, `<script src='/_next/a.js'></script>`));
    expect(r.scripts).toEqual(["/_next/a.js"]);
    expect(r.kb).toBeGreaterThan(90);
  });
});
