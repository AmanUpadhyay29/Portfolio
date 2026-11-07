import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { localPaths } from "../scripts/local-paths";

let dir: string | undefined;
afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

describe("local paths", () => {
  it("fails loudly when scripts/local-paths.json is missing", () => {
    dir = mkdtempSync(join(tmpdir(), "paths-"));
    expect(() => localPaths(dir)).toThrow(/local-paths\.json is missing/);
  });
  it("reads the file when it is there", () => {
    dir = mkdtempSync(join(tmpdir(), "paths-"));
    const cfg = { repos: { v1: "a", matrix: "b", xchart: "c" }, photo: "p.png" };
    writeFileSync(join(dir, "local-paths.json"), JSON.stringify(cfg));
    expect(localPaths(dir)).toEqual(cfg);
  });
  it("the committed example has every key, with placeholder paths only", () => {
    const example = JSON.parse(readFileSync(join(import.meta.dirname, "../scripts/local-paths.example.json"), "utf8"));
    expect(Object.keys(example.repos).sort()).toEqual(["matrix", "v1", "xchart"]);
    for (const p of [...Object.values(example.repos), example.photo] as string[]) expect(p).toMatch(/^C:\/path\/to\//);
  });
});
