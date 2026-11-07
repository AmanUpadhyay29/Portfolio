import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { MAX_WINDOW, hashTerm, hashedRule, rules, tokenize } from "../../scripts/guard/rules";
import { scanBuilt, scanText } from "../../scripts/guard/scan";

// Dummy terms only: the real hashed terms never appear in this repo.
const TERM = "purple elephant pipeline";
const rule = hashedRule("test-term", "a dummy term", [hashTerm(TERM)]);
const hits = (s: string) => rule.check(s, "x.txt");
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

describe("hashTerm", () => {
  test("is the SHA-256 hex of the normalised tokens joined with nothing", () => {
    expect(hashTerm(TERM)).toBe(sha("purpleelephantpipeline"));
    expect(hashTerm("Púrple-Elephant & PIPELINE")).toBe(hashTerm(TERM));
  });
  test("refuses a phrase with no tokens, or one longer than the window", () => {
    expect(() => hashTerm(" & - ")).toThrow();
    expect(() => hashTerm("a b c d e f g")).toThrow();
    expect(() => hashTerm("a b c d e f")).not.toThrow();
  });
});

describe("tokenize", () => {
  test("keeps each token's span in the original text", () => {
    const text = "Púrple—éléphant!";
    expect(tokenize(text)).toEqual([
      { text: "purple", start: 0, end: 6 },
      { text: "elephant", start: 7, end: 15 },
    ]);
  });
});

describe("hashed rule: normalisation", () => {
  test.each([
    ["case", "PURPLE Elephant PipeLine"],
    ["ampersand", "purple & elephant pipeline"],
    ["hyphen", "purple-elephant-pipeline"],
    ["joined words", "purpleelephant pipeline"],
    ["all joined", "purpleelephantpipeline"],
    ["split words", "pur ple elephant pipe line"],
    ["precomposed diacritics", "púrple éléphant pipelìne"],
    ["combining diacritics", "pu\u0301rple e\u0301lephant pipeline"],
    ["compatibility forms", "\uff50\uff55\uff52\uff50\uff4c\uff45 elephant pipeline"],
    ["punctuation", "see: purple/elephant.pipeline!"],
  ])("%s", (_name, text) => {
    expect(hits(text)).toHaveLength(1);
  });
});

describe("hashed rule: what it reports", () => {
  test("the original substring and the line it starts on", () => {
    expect(hits("one\ntwo\nthe Púrple Éléphant—Pipeline, again")).toEqual([
      { rule: "test-term", file: "x.txt", line: 3, match: "Púrple Éléphant—Pipeline" },
    ]);
  });
  test("a hit that spans a line break", () => {
    expect(hits("intro\nsee the purple\nelephant pipeline")).toEqual([
      { rule: "test-term", file: "x.txt", line: 2, match: "purple\nelephant pipeline" },
    ]);
  });
  test("a trailing combining mark stays in the match", () => {
    expect(hits("purple elephant pipeline\u0301.")[0].match).toBe("purple elephant pipeline\u0301");
  });
  test("every occurrence, at the start and the end of the text", () => {
    const found = hits("purple elephant pipeline\nand purple elephant pipeline");
    expect(found.map((f) => f.line)).toEqual([1, 2]);
  });
});

describe("hashed rule: near misses do not hit", () => {
  test.each([
    "purple elephants pipeline",
    "purple elephant pipelines",
    "apurple elephant pipeline",
    "purple elephant",
    "elephant pipeline",
    "purple elephant pipelin",
    "pipeline elephant purple",
    "purple elephant amp pipeline",
  ])("%s", (text) => {
    expect(hits(text)).toEqual([]);
  });
});

describe("hashed rule: windows of 1..6 tokens", () => {
  test("a six-token term hits, in the middle of other tokens", () => {
    const six = hashedRule("six", "dummy", [hashTerm("one two three four five six")]);
    expect(six.check("zero one two three four five six seven", "x.txt").map((f) => f.match)).toEqual([
      "one two three four five six",
    ]);
  });
  test("a one-token term hits only as a whole token", () => {
    const one = hashedRule("one", "dummy", [hashTerm("elephant")]);
    expect(one.check("an elephant", "x.txt")).toHaveLength(1);
    expect(one.check("elephants", "x.txt")).toEqual([]);
  });
  test("the window is six", () => expect(MAX_WINDOW).toBe(6));
});

describe("hashed rule: setup and wiring", () => {
  test("rejects anything but SHA-256 hex", () => {
    expect(() => hashedRule("bad", "dummy", ["not-a-hash"])).toThrow();
    expect(() => hashedRule("bad", "dummy", [hashTerm(TERM).toUpperCase()])).toThrow();
  });
  test("the real hashed rules hold only digests", () => {
    const src = readFileSync(join(import.meta.dirname, "../../scripts/guard/hashes.ts"), "utf8");
    const strings = [...src.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
    expect(strings.length).toBeGreaterThanOrEqual(2);
    for (const s of strings) expect(s).toMatch(/^[0-9a-f]{64}$/);
    for (const id of ["private-host", "blocked-phrases"]) {
      expect(rules.find((r) => r.id === id)?.hashed, id).toBe(true);
    }
  });
  test("scanText honours inline allows and allow entries for a hashed rule", () => {
    expect(scanText(`${TERM} // guard-allow: test-term`, "a.txt", [], [rule])).toEqual([]);
    const allow = [{ rule: "test-term", file: "a.txt", match: TERM, reason: "test" }];
    expect(scanText(TERM, "a.txt", allow, [rule])).toEqual([]);
    expect(scanText(TERM, "a.txt", [], [rule])).toHaveLength(1);
  });
  test("built scan: entity-encoded and tag-split terms, and attribute values", () => {
    const found = (html: string) => scanBuilt(html, "o.html", [], [...rules, rule]).map((f) => f.rule);
    expect(found("<p>purple elephant &amp; pipeline</p>")).toEqual(["test-term"]);
    expect(found("<p>purple<b></b>elephant pipeline</p>")).toEqual(["test-term"]);
    expect(found('<a href="https://x.purple-elephant-pipeline.test/">link</a>')).toEqual(["test-term"]);
    expect(found("<p>a purple elephant</p>")).toEqual([]);
  });
  test("pnpm guard:hash prints the digest, and fails on an empty phrase", () => {
    const cli = join(import.meta.dirname, "../../scripts/guard/hash.ts");
    const run = (...args: string[]) => spawnSync(process.execPath, ["--import", "tsx", cli, ...args], { encoding: "utf8" });
    expect(run("Purple", "elephant", "PIPELINE").stdout.trim()).toBe(hashTerm(TERM));
    expect(run(TERM).stdout.trim()).toBe(hashTerm(TERM));
    expect(run(" ").status).toBe(1);
  });
});
