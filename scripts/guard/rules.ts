import { hash } from "node:crypto";
import { BLOCKED_PHRASE_HASHES, PRIVATE_HOST_HASHES } from "./hashes";

export type RuleId =
  | "ipv4"
  | "private-host"
  | "account-number"
  | "phone"
  | "blocked-phrases"
  | "unsourced-figures"
  | "profit-language"
  | "termless-credit";

export type Finding = { rule: string; file: string; line: number; match: string };

export type GuardRule<Id extends string = RuleId> = {
  id: Id;
  description: string;
  /** "prose": only visible prose (content/, src/content/, the visible text of built HTML). Default: everywhere. */
  scope?: "prose";
  /** Matches SHA-256 hashes of normalised token windows, so the terms never appear in the repo. */
  hashed?: true;
  check(text: string, file: string): Finding[];
};

export type AllowEntry = { rule: string; file: string; match: string; reason: string };

type Hit = { index: number; match: string };

function lineOf(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

function toFindings(id: string, text: string, file: string, hits: Hit[]): Finding[] {
  return hits.map((h) => ({ rule: id, file, line: lineOf(text, h.index), match: h.match }));
}

function regexRule<Id extends string>(
  id: Id,
  description: string,
  patterns: RegExp[],
  keep?: (m: string) => boolean,
): GuardRule<Id> {
  return {
    id,
    description,
    check(text, file) {
      const hits: Hit[] = [];
      for (const p of patterns) {
        for (const m of text.matchAll(new RegExp(p.source, p.flags.includes("g") ? p.flags : p.flags + "g"))) {
          if (!keep || keep(m[0])) hits.push({ index: m.index, match: m[0] });
        }
      }
      hits.sort((a, b) => a.index - b.index);
      return toFindings(id, text, file, hits);
    },
  };
}

// ---- hashed matching ------------------------------------------------------

/** A run of [a-z0-9] after normalisation, with its span in the original text. */
export type Token = { text: string; start: number; end: number };

/** The longest window of tokens a hashed term may span. */
export const MAX_WINDOW = 6;

const MARKS = /\p{M}/gu;

/** NFKD, strip combining marks, lowercase. ASCII takes a fast path. */
function fold(ch: string): string {
  const c = ch.charCodeAt(0);
  if (ch.length === 1 && c < 128) return c >= 65 && c <= 90 ? String.fromCharCode(c + 32) : ch;
  return ch.normalize("NFKD").replace(MARKS, "").toLowerCase();
}

const isAlnum = (c: string) => (c >= "a" && c <= "z") || (c >= "0" && c <= "9");

/**
 * Normalise and split: every run of characters outside [a-z0-9] is one separator.
 * Each token keeps the offsets of the original characters it came from.
 */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let cur: Token | null = null;
  for (let i = 0; i < text.length; ) {
    const len = text.codePointAt(i)! > 0xffff ? 2 : 1;
    const folded = fold(text.slice(i, i + len));
    if (folded === "") {
      // a lone combining mark belongs to the token it follows
      if (cur) cur.end = i + len;
    } else {
      for (const c of folded) {
        if (!isAlnum(c)) {
          cur = null;
        } else if (cur) {
          cur.text += c;
          cur.end = i + len;
        } else {
          cur = { text: c, start: i, end: i + len };
          tokens.push(cur);
        }
      }
    }
    i += len;
  }
  return tokens;
}

const sha256 = (s: string) => hash("sha256", s, "hex");

/** The hash a hashed rule stores for a phrase: its tokens joined with no separator. */
export function hashTerm(phrase: string): string {
  const tokens = tokenize(phrase);
  if (tokens.length === 0) throw new Error("hashTerm: the phrase has no letters or digits");
  if (tokens.length > MAX_WINDOW) throw new Error(`hashTerm: more than ${MAX_WINDOW} tokens can never match`);
  return sha256(tokens.map((t) => t.text).join(""));
}

type Windows = { text: string; tokens: Token[]; hashes: string[] };
let lastWindows: Windows | null = null;

/** Hashes of every window of 1..MAX_WINDOW tokens, at index i * MAX_WINDOW + (k - 1). Cached for the last text. */
function windowsOf(text: string): Windows {
  if (lastWindows && lastWindows.text === text) return lastWindows;
  const tokens = tokenize(text);
  const hashes: string[] = new Array(tokens.length * MAX_WINDOW).fill("");
  for (let i = 0; i < tokens.length; i++) {
    let joined = "";
    for (let k = 1; k <= MAX_WINDOW && i + k <= tokens.length; k++) {
      joined += tokens[i + k - 1].text;
      hashes[i * MAX_WINDOW + (k - 1)] = sha256(joined);
    }
  }
  lastWindows = { text, tokens, hashes };
  return lastWindows;
}

const HEX64 = /^[0-9a-f]{64}$/;

export function hashedRule<Id extends string>(id: Id, description: string, hashes: string[]): GuardRule<Id> {
  for (const h of hashes) if (!HEX64.test(h)) throw new Error(`hashedRule ${id}: not a SHA-256 hex digest: ${h}`);
  const set = new Set(hashes);
  return {
    id,
    description,
    hashed: true,
    check(text, file) {
      const { tokens, hashes: windows } = windowsOf(text);
      const hits: Hit[] = [];
      for (let n = 0; n < windows.length; n++) {
        if (!windows[n] || !set.has(windows[n])) continue;
        const i = Math.floor(n / MAX_WINDOW);
        const first = tokens[i];
        const last = tokens[i + (n % MAX_WINDOW)];
        hits.push({ index: first.start, match: text.slice(first.start, last.end) });
      }
      return toFindings(id, text, file, hits);
    },
  };
}

// ---- the rules ------------------------------------------------------------

const IPV4 = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/;
const IPV4_OK = /^(?:127\.0\.0\.1|0\.0\.0\.0|192\.0\.2\.\d+|198\.51\.100\.\d+|203\.0\.113\.\d+)$/;

const TERMLESS = /termless/gi;
const CREDIT = /thedev09|imemyself\.dev/i;

const termlessCredit: GuardRule<"termless-credit"> = {
  id: "termless-credit",
  description: "Termless must be credited to thedev09 or imemyself.dev within 400 characters",
  check(text, file) {
    const hits: Hit[] = [];
    for (const m of text.matchAll(TERMLESS)) {
      const start = Math.max(0, m.index - 400);
      const end = Math.min(text.length, m.index + m[0].length + 400);
      if (!CREDIT.test(text.slice(start, end))) hits.push({ index: m.index, match: m[0] });
    }
    return toFindings("termless-credit", text, file, hits);
  },
};

const unsourcedFigures: GuardRule<"unsourced-figures"> = {
  ...regexRule("unsourced-figures", "percentages and N+ counts in visible prose; site numbers come from numbers.json", [
    /\b\d+(?:\.\d+)?\s*%/,
    /\b\d+\+/,
  ]),
  scope: "prose",
};

export const rules: GuardRule[] = [
  regexRule("ipv4", "IP addresses (except loopback, 0.0.0.0, documentation ranges)", [IPV4], (m) => !IPV4_OK.test(m)),
  hashedRule("private-host", "private host names", PRIVATE_HOST_HASHES),
  regexRule("account-number", "account / login / MT5 numbers", [/\b(account|acct|login|mt5)\b[^\n]{0,24}\b\d{7,9}\b/i]),
  regexRule("phone", "phone numbers", [/\+91[\s-]?\d{5}[\s-]?\d{5}|\b[6-9]\d{9}\b/]),
  hashedRule("blocked-phrases", "phrases that must not appear on the site", BLOCKED_PHRASE_HASHES),
  unsourcedFigures,
  regexRule("profit-language", "profit claims and profit language", [
    /\b(profits?|profitable|roi|win[-\s]?rate|p&l|pnl)\b|\d+(\.\d+)?\s*%\s*(returns?|gains?|a month|per month|monthly)/i,
  ]),
  termlessCredit,
];

/** Visible prose: the case studies and the site copy. Paths are matched by segment, relative or absolute. */
export function isProsePath(file: string): boolean {
  return /(?:^|\/)content\//.test(file.split(String.fromCharCode(92)).join("/"));
}
