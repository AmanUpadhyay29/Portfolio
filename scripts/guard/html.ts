const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function fromCode(code: number, whole: string): string {
  return Number.isInteger(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
}

/** Decode named (amp lt gt quot apos nbsp) and numeric (decimal and hex) HTML entities, one pass. */
export function decodeEntities(text: string): string {
  return text.replace(/&(?:#x([0-9a-f]+)|#(\d+)|([a-z]+));/gi, (whole, hex, dec, name) => {
    if (hex) return fromCode(parseInt(hex, 16), whole);
    if (dec) return fromCode(parseInt(dec, 10), whole);
    return NAMED[String(name).toLowerCase()] ?? whole;
  });
}

/** Remove tags without adding a separator, so `win<b></b> rate` reads as `win rate`. */
export function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/** Keep only the newlines of a removed span, so line numbers still point at the source. */
const blank = (s: string) => s.replace(/[^\n]+/g, " ");

/**
 * The text a reader sees: no scripts, styles or comments, and no tags or attributes.
 * Each tag becomes a space, so text in neighbouring blocks never runs together.
 */
export function visibleText(html: string): string {
  const body = html
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, blank)
    .replace(/<style\b[\s\S]*?<\/style\s*>/gi, blank)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<[^>]*>/g, blank);
  return decodeEntities(body);
}
