import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isProsePath, rules } from "../../scripts/guard/rules";
import { scanBuilt, scanText } from "../../scripts/guard/scan";

const dir = join(import.meta.dirname, "fixtures");
const read = (name: string) => readFileSync(join(dir, name), "utf8");
// a prose path, so the prose-scoped rule runs too
const PROSE = "content/work/x.mdx";
const regexRules = rules.filter((r) => !r.hashed);

describe("content guard rules", () => {
  test.each(regexRules.map((r) => [r.id, r] as const))("%s: bad fixture trips, good passes", (id, rule) => {
    expect(rule.check(read(`${id}.bad.txt`), "x.txt").length).toBeGreaterThanOrEqual(1);
    expect(rule.check(read(`${id}.good.txt`), "x.txt")).toEqual([]);
  });

  test.each(regexRules.map((r) => [r.id] as const))("%s: bad fixture trips only its own rule", (id) => {
    const found = scanText(read(`${id}.bad.txt`), PROSE, []).map((f) => f.rule);
    expect(new Set(found)).toEqual(new Set([id]));
  });

  test("every regex rule has a bad fixture, and no fixture is left over", () => {
    const bad = readdirSync(dir).filter((f) => f.endsWith(".bad.txt")).map((f) => f.replace(".bad.txt", ""));
    expect(bad.sort()).toEqual(regexRules.map((r) => r.id).sort());
  });

  test("the eight rules and their ids", () => {
    expect(rules.map((r) => r.id)).toEqual([
      "ipv4",
      "private-host",
      "account-number",
      "phone",
      "blocked-phrases",
      "unsourced-figures",
      "profit-language",
      "termless-credit",
    ]);
    expect(rules.filter((r) => r.hashed).map((r) => r.id)).toEqual(["private-host", "blocked-phrases"]);
  });

  test("findings carry the 1-based line number", () => {
    const f = scanText("ok\nok\nreach 10.20.30.40\n", "a.txt", []);
    expect(f).toEqual([{ rule: "ipv4", file: "a.txt", line: 3, match: "10.20.30.40" }]);
  });

  test("inline guard-allow suppresses only the named rule", () => {
    const text = "10.20.30.40 and +91 98765 43210 // guard-allow: ipv4";
    const found = scanText(text, "a.txt", []).map((f) => f.rule);
    expect(found).toEqual(["phone"]);
  });

  test("allow.json entry suppresses a matching finding", () => {
    const allow = [{ rule: "ipv4", file: "a.txt", match: "10.20.30.40", reason: "test" }];
    expect(scanText("10.20.30.40", "a.txt", allow)).toEqual([]);
    expect(scanText("10.20.30.41", "a.txt", allow)).toHaveLength(1);
    expect(scanText("10.20.30.40", "b.txt", allow)).toHaveLength(1);
  });

  test("ipv4 exceptions: loopback, any, documentation ranges", () => {
    for (const ok of ["127.0.0.1", "0.0.0.0", "192.0.2.5", "198.51.100.9", "203.0.113.200"]) {
      expect(scanText(ok, "a.txt", [])).toEqual([]);
    }
  });

  test("termless credit window works on either side", () => {
    expect(scanText("by thedev09: Termless", "a.txt", [])).toEqual([]);
    expect(scanText("Termless" + " ".repeat(500) + "thedev09", "a.txt", [])).toHaveLength(1);
  });
});

describe("unsourced-figures runs on visible prose only", () => {
  const figures = (found: { rule: string; match: string }[]) =>
    found.filter((f) => f.rule === "unsourced-figures").map((f) => f.match);

  test("prose paths: content/ and src/content/, relative or absolute", () => {
    for (const p of ["content/work/a.mdx", "src/content/site.ts", "D:/site/content/work/a.mdx", "C:\\site\\src\\content\\a.ts"]) {
      expect(isProsePath(p), p).toBe(true);
    }
    for (const p of ["src/components/a.tsx", "src/data/numbers.json", "a.txt", "contents/a.md", "src/contented.ts"]) {
      expect(isProsePath(p), p).toBe(false);
    }
  });

  test("source: hits in content, not in components, data or other files", () => {
    expect(figures(scanText("grew 12% and 60+", "content/work/a.mdx", []))).toEqual(["12%", "60+"]);
    expect(figures(scanText("grew 12%", "src/content/site.ts", []))).toEqual(["12%"]);
    for (const f of ["src/components/a.tsx", "src/app/globals.css", "src/data/numbers.json", "README.md"]) {
      expect(figures(scanText("width: 12%; 60+", f, [])), f).toEqual([]);
    }
  });

  test("built: the visible text of html pages only", () => {
    expect(figures(scanBuilt("<p>grew 12%</p>", "out/index.html", []))).toEqual(["12%"]);
    expect(figures(scanBuilt('<i style="height:12%"></i><div class="w-[60+]"></div>', "out/index.html", []))).toEqual([]);
    expect(figures(scanBuilt('<script>self.x="12%"</script><style>a{width:12%}</style><!-- 12% -->', "out/a.html", []))).toEqual([]);
    for (const f of ["out/index.txt", "out/a.json", "out/sitemap.xml"]) {
      expect(figures(scanBuilt("<p>grew 12%</p>", f, [])), f).toEqual([]);
    }
  });

  test("built: neighbouring blocks do not run together, and lines survive removed scripts", () => {
    expect(figures(scanBuilt("<p>24/7</p><p>60+ things</p>", "out/a.html", []))).toEqual(["60+"]);
    const f = scanBuilt("<p>a</p>\n<script>\nx\n</script>\n<p>grew 12%</p>", "out/a.html", []);
    expect(f).toEqual([{ rule: "unsourced-figures", file: "out/a.html", line: 5, match: "12%" }]);
  });

  test("built: an allow entry suppresses one file's match", () => {
    const allow = [{ rule: "unsourced-figures", file: "out/a.html", match: "60+", reason: "test" }];
    expect(scanBuilt("<p>60+</p>", "out/a.html", allow)).toEqual([]);
    expect(scanBuilt("<p>60+</p>", "out/b.html", allow)).toHaveLength(1);
  });
});
