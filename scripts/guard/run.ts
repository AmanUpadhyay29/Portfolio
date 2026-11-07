import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { AllowEntry } from "./rules";
import { isBuiltRoot, scanPaths } from "./walk";

const args = process.argv.slice(2);
const allow = JSON.parse(readFileSync(join(import.meta.dirname, "allow.json"), "utf8")) as AllowEntry[];
const { findings, scanned } = scanPaths(args, allow);
for (const f of findings) console.log(`${f.rule} ${f.file}:${f.line} ${f.match}`);
console.log(`guard: ${findings.length} findings (${scanned} files scanned)`);
// A built-site scan that reads nothing has checked nothing: fail it.
const built = args.includes("--built") || args.some((a) => a !== "--built" && isBuiltRoot(a, false));
if (built && scanned === 0) {
  console.log("guard: FAIL, the built-site scan found no files");
  process.exit(1);
}
process.exit(findings.length > 0 ? 1 : 0);
