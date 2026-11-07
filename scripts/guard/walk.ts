import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import type { AllowEntry, Finding } from "./rules";
import { scanBuilt, scanText } from "./scan";

export const SOURCE_EXT = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".mdx", ".md", ".css", ".json", ".txt", ".svg", ".html", ".xml", ".webmanifest",
]);
// The built site: content-bearing files only. out/_next/static holds minified chunks
// built from sources that guard:src already scans.
export const BUILT_EXT = new Set([".html", ".txt", ".xml", ".json", ".webmanifest", ".svg"]);
const SKIP_DIRS = ["node_modules", "scripts/guard", "tests/guard/fixtures"];

export const norm = (p: string) => p.split(String.fromCharCode(92)).join("/");

/** A path is the built site when its last segment is `out`, or when --built is given. */
export function isBuiltRoot(path: string, builtFlag: boolean): boolean {
  return builtFlag || basename(resolve(path)) === "out";
}

export function skipped(path: string, built: boolean): boolean {
  const p = `/${norm(path)}/`;
  if (SKIP_DIRS.some((d) => p.includes(`/${d}/`))) return true;
  return built && p.includes("/_next/static/");
}

export function walk(path: string, built: boolean, files: { file: string; built: boolean }[]): void {
  if (!existsSync(path) || skipped(path, built)) return;
  if (statSync(path).isDirectory()) {
    for (const name of readdirSync(path)) walk(join(path, name), built, files);
  } else if ((built ? BUILT_EXT : SOURCE_EXT).has(extname(path).toLowerCase())) {
    files.push({ file: path, built });
  }
}

export function scanPaths(args: string[], allow: AllowEntry[]): { findings: Finding[]; scanned: number } {
  const builtFlag = args.includes("--built");
  const files: { file: string; built: boolean }[] = [];
  for (const arg of args.filter((a) => a !== "--built")) walk(arg, isBuiltRoot(arg, builtFlag), files);
  const findings: Finding[] = [];
  for (const { file, built } of files) {
    const text = readFileSync(file, "utf8");
    findings.push(...(built ? scanBuilt : scanText)(text, norm(file), allow));
  }
  return { findings, scanned: files.length };
}
