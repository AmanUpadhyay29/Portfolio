import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { decodeEntities, stripTags } from "../../scripts/guard/html";
import { scanBuilt } from "../../scripts/guard/scan";
import { isBuiltRoot, scanPaths } from "../../scripts/guard/walk";

const BAD = "reach 10.20.30.40 now";
let root: string;

function put(rel: string, text = BAD) {
  const p = join(root, rel);
  mkdirSync(join(p, ".."), { recursive: true });
  writeFileSync(p, text);
}
const files = (r: { findings: { file: string }[] }) => r.findings.map((f) => f.file.split(root.split("\\").join("/"))[1]).sort();

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "guard-"));
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("walk: source mode", () => {
  test("skips fixtures, scripts/guard and node_modules, scans a sibling src file", () => {
    put("tests/guard/fixtures/a.bad.txt");
    put("scripts/guard/x.ts");
    put("node_modules/p/i.js");
    put("src/a.ts");
    expect(files(scanPaths([root], []))).toEqual(["/src/a.ts"]);
  });

  test("uses the full text extension list and ignores binaries", () => {
    put("src/a.mdx");
    put("src/b.css");
    put("src/c.png");
    expect(files(scanPaths([root], []))).toEqual(["/src/a.mdx", "/src/b.css"]);
  });

  test("a missing path is skipped without a finding", () => {
    const r = scanPaths([join(root, "nope"), "also-missing.md"], []);
    expect(r).toEqual({ findings: [], scanned: 0 });
  });
});

describe("walk: built mode", () => {
  test("scans html/txt, skips _next/static and .js, .md", () => {
    put("out/index.html");
    put("out/robots.txt");
    put("out/_next/static/chunk.html");
    put("out/_next/static/chunks/a.js");
    put("out/app.js");
    put("out/notes.md");
    expect(files(scanPaths([join(root, "out")], []))).toEqual(["/out/index.html", "/out/robots.txt"]);
  });

  test("detects the built site by last segment: ./out, absolute, trailing slash", () => {
    expect(isBuiltRoot("out", false)).toBe(true);
    expect(isBuiltRoot("./out", false)).toBe(true);
    expect(isBuiltRoot("out/", false)).toBe(true);
    expect(isBuiltRoot(join(root, "out"), false)).toBe(true);
    expect(isBuiltRoot("src", false)).toBe(false);
    expect(isBuiltRoot("output", false)).toBe(false);
    expect(isBuiltRoot("src", true)).toBe(true);
  });

  test("--built forces built mode on any directory", () => {
    put("site/a.html");
    put("site/b.md");
    expect(files(scanPaths(["--built", join(root, "site")], []))).toEqual(["/site/a.html"]);
  });
});

describe("html normalisation", () => {
  test("decodes named and numeric entities", () => {
    expect(decodeEntities("P&amp;L &lt;&gt;&quot;&#39;&apos;a&nbsp;b &#65;&#x42;&#X43; &bogus; &#99999999;")).toBe(
      "P&L <>\"''a b ABC &bogus; &#99999999;",
    );
  });

  test("strips tags with no separator", () => {
    expect(stripTags('win<b></b> rate<br/><a href="x">y</a>')).toBe("win ratey");
  });

  test("built scan catches entity-encoded and tag-split text", () => {
    // hashed terms in entities and split tags: tests/guard/hashed.test.ts
    const html = "<p>P&amp;L</p>\n<p>win<b></b> rate</p>\n<p>win&nbsp;rate</p>";
    const rulesHit = scanBuilt(html, "o.html", []).map((f) => f.rule);
    expect(rulesHit.filter((r) => r === "profit-language").length).toBeGreaterThanOrEqual(2);
  });

  test("built scan still checks attribute values", () => {
    const f = scanBuilt('<a href="https://10.20.30.40/">link</a>', "o.html", []);
    expect(f.map((x) => x.rule)).toEqual(["ipv4"]);
  });

  test("built scan on a clean page reports nothing", () => {
    expect(scanBuilt("<p>Uptime &amp; building</p>", "o.html", [])).toEqual([]);
  });
});

describe("CLI exit code", () => {
  const run = (...args: string[]) =>
    spawnSync(process.execPath, ["--import", "tsx", join(import.meta.dirname, "../../scripts/guard/run.ts"), ...args], {
      encoding: "utf8",
    });

  test("exits 1 on a finding and prints it", () => {
    put("src/a.ts");
    const r = run(join(root, "src"));
    expect(r.status).toBe(1);
    expect(r.stdout).toContain("ipv4");
    expect(r.stdout).toContain("1 findings");
  });

  test("exits 0 when clean or when the path is missing", () => {
    put("src/a.ts", "nothing here");
    expect(run(join(root, "src")).status).toBe(0);
    expect(run(join(root, "missing")).status).toBe(0);
  });

  test("a built html page with an entity-hidden term fails", () => {
    put("out/index.html", "<p>P&amp;L</p>");
    expect(run("--built", join(root, "out")).status).toBe(1);
  });

  test("a built-site scan that finds no files fails", () => {
    const r = run("--built", join(root, "missing"));
    expect(r.status).toBe(1);
    expect(r.stdout).toContain("0 files scanned");
    put("out/a.png", "binary");
    expect(run(join(root, "out")).status).toBe(1);
    put("out/index.html", "<p>fine</p>");
    expect(run(join(root, "out")).status).toBe(0);
  });
});
