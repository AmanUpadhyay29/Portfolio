import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { site } from "../src/content/site";

export type CheckOptions = { resumeAvailable: boolean; headline: string; rolesLine: string };

const ROOM_HREFS = ["/work/trading-platform", "/work/matrix", "/work/xchart", "#job", "#about"];
const PHONE = /\+91[\s-]?\d{5}[\s-]?\d{5}|\b[6-9]\d{9}\b/;

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

function visibleText(html: string): string {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "");
  return decode(body).replace(/\s+/g, " ");
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

/** Does this markup contain an <a> whose href is `href` (or, for "#x", also "/#x")? */
function hasLink(html: string, href: string): boolean {
  const variants = href.startsWith("#") ? [href, `/${href}`] : [href];
  return variants.some((v) => new RegExp(`<a\\b[^>]*\\bhref="${escapeRe(v)}"`).test(html));
}

/** The core of the check. Returns a list of failures; empty means pass. */
export function checkOut(html: string, opts: CheckOptions): string[] {
  const errors: string[] = [];
  const text = visibleText(html);

  if (!text.includes(opts.headline)) errors.push(`headline missing: "${opts.headline}"`);
  if (!text.includes(opts.rolesLine)) errors.push(`roles line missing: "${opts.rolesLine}"`);

  const svgMatch = html.match(/<svg\b[^>]*class="room"[\s\S]*?<\/svg>/);
  const svg = svgMatch ? svgMatch[0] : "";
  const listMatch = html.match(/<([a-z]+)\b[^>]*data-text-links[^>]*>[\s\S]*?<\/\1>/);
  const list = listMatch ? listMatch[0] : "";
  if (!svg) errors.push('room <svg class="room"> missing');
  if (!list) errors.push("text links list [data-text-links] missing");
  for (const h of ROOM_HREFS) {
    if (!hasLink(svg, h)) errors.push(`href ${h} missing inside the room svg`);
    if (!hasLink(list, h)) errors.push(`href ${h} missing in the text links list`);
  }

  const objs = html.match(/<[a-z]+\b[^>]*\bdata-obj="[^"]*"[^>]*>/g) ?? [];
  if (objs.length === 0) errors.push("no [data-obj] elements found");
  for (const tag of objs) {
    const m = tag.match(/\baria-label="([^"]*)"/);
    if (!m || m[1].trim() === "") errors.push(`empty or missing aria-label on ${tag.slice(0, 60)}`);
  }

  if (/style="[^"]*opacity\s*:\s*0(?![.\d])/.test(html)) errors.push("inline style has opacity:0");

  if (!opts.resumeAvailable && /<a\b[^>]*\bhref="[^"]*(resume|résumé|cv)[^"]*"/i.test(html)) {
    errors.push("a resume link is present while resume.available is false");
  }

  if (PHONE.test(text) || PHONE.test(html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ""))) {
    errors.push("a phone-number pattern is present");
  }
  return errors;
}

const LOCAL_URL = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/i;

/** Production builds must not point their og:image or sitemap at a local address (SITE_URL unset). */
export function checkSiteUrls(html: string, sitemap: string | null): string[] {
  const errors: string[] = [];
  const og = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/)?.[1] ?? "";
  if (!og) errors.push("og:image missing on the home page");
  else if (LOCAL_URL.test(og)) errors.push(`og:image points at a local address: ${og}`);
  if (sitemap === null) {
    errors.push("out/sitemap.xml is missing");
    return errors;
  }
  const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
  if (locs.length === 0) errors.push("sitemap has no URLs");
  for (const l of locs) if (LOCAL_URL.test(l)) errors.push(`sitemap URL points at a local address: ${l}`);
  return errors;
}

/**
 * The site-URL check runs when asked (REQUIRE_SITE_URL=1) and on every production build:
 * Cloudflare Workers Builds sets WORKERS_CI=1 and WORKERS_CI_BRANCH, and main is production.
 */
export function shouldRequireSiteUrl(env: Record<string, string | undefined>): boolean {
  return env.REQUIRE_SITE_URL === "1" || (env.WORKERS_CI === "1" && env.WORKERS_CI_BRANCH === "main");
}

function main() {
  const html = readFileSync(join(process.cwd(), "out", "index.html"), "utf8");
  const errors = checkOut(html, {
    resumeAvailable: site.resume.available,
    headline: `${site.headline.job} ${site.headline.habit}`,
    rolesLine: site.rolesLine,
  });
  if (shouldRequireSiteUrl(process.env)) {
    const sitemapPath = join(process.cwd(), "out", "sitemap.xml");
    const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, "utf8") : null;
    errors.push(...checkSiteUrls(html, sitemap));
  }
  if (errors.length) {
    for (const e of errors) console.log(`check-out FAIL: ${e}`);
    console.log(`check-out: ${errors.length} problems`);
    process.exit(1);
  }
  console.log("check-out: PASS (headline, roles line, 5 room links x2, aria-labels, no opacity:0, no resume link, no phone)");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
