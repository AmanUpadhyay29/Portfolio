import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

export const LIMIT_KB = 170;

/**
 * Script srcs that load on the home page (legacy `noModule` fallbacks are not fetched by modern browsers).
 * Inline scripts (the RSC payload) are deliberately not counted: this is the downloaded JS.
 */
export function scriptSrcs(html: string): string[] {
  const srcs: string[] = [];
  for (const tag of html.match(/<script\b[^>]*>/g) ?? []) {
    if (/\bnoModule\b/i.test(tag)) continue;
    const m = tag.match(/\bsrc=(?:"([^"]+)"|'([^']+)')/);
    if (m) srcs.push(m[1] ?? m[2]);
  }
  return [...new Set(srcs)];
}

export function evaluate(outDir: string, limitKb = LIMIT_KB): { kb: number; over: boolean; scripts: string[] } {
  const indexPath = join(outDir, "index.html");
  if (!existsSync(indexPath)) throw new Error(`${indexPath} not found: run pnpm build first`);
  const html = readFileSync(indexPath, "utf8");
  const scripts = scriptSrcs(html);
  if (scripts.length === 0) throw new Error("no <script src> tags found in index.html: the parser found no scripts");
  let bytes = 0;
  for (const src of scripts) {
    const file = join(outDir, src.split(/[?#]/)[0]);
    if (!existsSync(file)) throw new Error(`script not found in output: ${src}`);
    bytes += gzipSync(readFileSync(file)).length;
  }
  const kb = bytes / 1024;
  return { kb, over: kb > limitKb, scripts };
}

/** Total gzip bytes of the home page's first-load scripts, read from `outDir`. */
export function firstLoadBytes(outDir: string): number {
  return Math.round(evaluate(outDir).kb * 1024);
}

function main() {
  try {
    const { kb, over } = evaluate(join(process.cwd(), "out"));
    console.log(`home first-load JS: ${kb.toFixed(1)} KB gzip (≤ ${LIMIT_KB})${over ? " FAIL" : ""}`);
    if (over) process.exit(1);
  } catch (e) {
    console.log(`js-budget: ${(e as Error).message}`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
