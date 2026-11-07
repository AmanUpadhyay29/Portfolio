import { rules } from "../../scripts/guard/rules";

// Every regex alternative gets its own positive case, so deleting any one of them fails a test.
// The hashed rules hold no plaintext; tests/guard/hashed.test.ts covers them with dummy terms.
const positives: Record<string, string[]> = {
  ipv4: ["10.20.30.40", "250.251.252.253", "240.241.242.243", "192.0.3.1", "198.51.101.1", "203.0.114.1", "127.0.0.2", "0.0.0.1"],
  "account-number": ["account 1234567", "Acct: 1234567", "LOGIN 123456789", "mt5 12345678"],
  phone: ["+91 98765 43210", "+91-98765-43210", "+919876543210", "call 9876543210", "call 6000000000"],
  "unsourced-figures": ["12%", "grew 7.5%", "7.5 %", "3 %", "60+", "over 60+ checks"],
  "profit-language": [
    "profit",
    "profits",
    "profitable",
    "ROI",
    "win rate",
    "win-rate",
    "winrate",
    "P&L",
    "PnL",
    "7% returns",
    "7.5% return",
    "7% gains",
    "7% gain",
    "7% a month",
    "7% per month",
    "7% monthly",
  ],
  "termless-credit": ["Termless runs it.", "TERMLESS"],
};

const near: Record<string, string[]> = {
  ipv4: ["127.0.0.1", "0.0.0.0", "192.0.2.77", "198.51.100.77", "203.0.113.77", "1.2.3"],
  "unsourced-figures": ["C++", "seven percent", "+60", "60 +", "x7%", "24/7"],
  phone: ["12345", "5876543210"],
  "termless-credit": ["Termless by imemyself.dev", "thedev09 made Termless", "Termless by THEDEV09"],
  "profit-language": ["proof", "returns a value", "7% of users"],
};

const regexRules = rules.filter((r) => !r.hashed);

describe("every alternative has its own positive case", () => {
  test("positives cover every regex rule", () => {
    expect(Object.keys(positives).sort()).toEqual(regexRules.map((r) => r.id).sort());
  });

  for (const rule of regexRules) {
    test.each(positives[rule.id])(`${rule.id}: finds %s`, (s) => {
      expect(rule.check(s, "x.txt").length).toBeGreaterThanOrEqual(1);
    });
    test.each(near[rule.id] ?? [])(`${rule.id}: passes %s`, (s) => {
      expect(rule.check(s, "x.txt")).toEqual([]);
    });
  }
});
