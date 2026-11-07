import { decodeEntities, stripTags, visibleText } from "./html";
import { isProsePath, rules } from "./rules";
import type { AllowEntry, Finding, GuardRule } from "./rules";

type Rule = GuardRule<string>;

const norm = (p: string) => p.split(String.fromCharCode(92)).join("/");

/** Prose-scoped rules run on source files under a content/ folder; every other rule runs everywhere. */
const forSource = (file: string) => (r: Rule) => r.scope !== "prose" || isProsePath(file);

function scanWith(text: string, file: string, allow: AllowEntry[], ruleset: readonly Rule[]): Finding[] {
  const lines = text.split("\n");
  const out: Finding[] = [];
  for (const rule of ruleset) {
    for (const f of rule.check(text, file)) {
      const line = lines[f.line - 1] ?? "";
      if (line.includes(`guard-allow: ${rule.id}`)) continue;
      if (allow.some((a) => a.rule === f.rule && norm(a.file) === norm(f.file) && a.match === f.match)) continue;
      out.push(f);
    }
  }
  return out.sort((a, b) => a.line - b.line);
}

export function scanText(text: string, file: string, allow: AllowEntry[], ruleset: readonly Rule[] = rules): Finding[] {
  return scanWith(text, file, allow, ruleset.filter(forSource(file)));
}

/**
 * Built-site scan. Pass 1 keeps the markup (so attribute values such as hrefs are
 * checked) with entities decoded; pass 2 strips tags so text split by markup or
 * entities (`P&amp;L`, `win<b></b> rate`) is checked as a reader sees it. Prose-scoped
 * rules skip both and run only on the visible text of .html pages (pass 3).
 */
export function scanBuilt(text: string, file: string, allow: AllowEntry[], ruleset: readonly Rule[] = rules): Finding[] {
  const everywhere = ruleset.filter((r) => r.scope !== "prose");
  const prose = ruleset.filter((r) => r.scope === "prose");
  const first = scanWith(decodeEntities(text), file, allow, everywhere);
  const seen = new Set(first.map((f) => `${f.rule}|${f.match}`));
  const second = scanWith(decodeEntities(stripTags(text)), file, allow, everywhere).filter(
    (f) => !seen.has(`${f.rule}|${f.match}`),
  );
  const third = /\.html?$/i.test(file) && prose.length ? scanWith(visibleText(text), file, allow, prose) : [];
  return [...first, ...second, ...third];
}
