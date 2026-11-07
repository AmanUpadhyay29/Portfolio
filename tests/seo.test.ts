import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";
import { allWorks } from "../src/lib/works";

const root = join(__dirname, "..");
afterEach(() => vi.unstubAllEnvs());

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

describe("sitemap", () => {
  it("lists home, credits and every work, on the site URL", () => {
    vi.stubEnv("SITE_URL", "https://example.test");
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain("https://example.test/");
    expect(urls).toContain("https://example.test/credits");
    expect(urls).toContain("https://example.test/work/matrix");
    for (const w of allWorks) expect(urls).toContain(`https://example.test/work/${w.slug}`);
  });
});

describe("robots", () => {
  it("allows all and points at the sitemap", () => {
    vi.stubEnv("SITE_URL", "https://example.test");
    const r = robots();
    expect(JSON.stringify(r.rules)).toContain('"allow":"/"');
    expect(r.sitemap).toBe("https://example.test/sitemap.xml");
  });
});

describe("OG images", () => {
  it("exist for home and every work", () => {
    for (const name of ["home", ...allWorks.map((w) => w.slug)]) {
      expect(existsSync(join(root, "public", "og", `${name}.png`)), name).toBe(true);
    }
  });
  it("every /og/*.png named in the app source exists", () => {
    const refs = new Set<string>();
    for (const f of walk(join(root, "src", "app"))) {
      for (const m of readFileSync(f, "utf8").matchAll(/\/og\/([\w-]+)\.png/g)) refs.add(m[1]);
    }
    expect(refs.has("home")).toBe(true);
    for (const r of refs) expect(existsSync(join(root, "public", "og", `${r}.png`)), r).toBe(true);
  });
  it("are 1200x630 PNGs", () => {
    for (const name of ["home", ...allWorks.map((w) => w.slug)]) {
      const b = readFileSync(join(root, "public", "og", `${name}.png`));
      expect(b.subarray(1, 4).toString()).toBe("PNG");
      expect(b.readUInt32BE(16)).toBe(1200);
      expect(b.readUInt32BE(20)).toBe(630);
    }
  });
});

describe("_headers", () => {
  const headers = readFileSync(join(root, "public", "_headers"), "utf8");
  it("sets the security headers", () => {
    expect(headers).toContain("Content-Security-Policy");
    expect(headers).toContain("X-Content-Type-Options: nosniff");
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain("Strict-Transport-Security");
  });
  it("caches hashed assets for a year", () => {
    expect(headers).toMatch(/\/_next\/static\/\*\s+Cache-Control: public, max-age=31536000, immutable/);
  });
});

describe("credits links", () => {
  const src = readFileSync(join(root, "src", "app", "credits", "page.tsx"), "utf8");
  it("uses the official Vengence UI address", () => {
    expect(src).toContain("https://www.vengenceui.com");
    expect(src).not.toContain("vengeance-ui");
  });
});

describe("share cards", () => {
  it("the layout sets a site-wide large Twitter card", () => {
    const layout = readFileSync(join(root, "src", "app", "layout.tsx"), "utf8");
    expect(layout).toMatch(/twitter:\s*\{\s*card:\s*"summary_large_image"/);
  });
  it("credits uses the default OG image", () => {
    const credits = readFileSync(join(root, "src", "app", "credits", "page.tsx"), "utf8");
    expect(credits).toMatch(/openGraph:\s*\{[^}]*images:\s*\["\/og\/home\.png"\]/);
  });
});

describe("work links", () => {
  // A prefetched /work/* page pulls its RSC payload into the home page's first load.
  it("every <Link> to /work/... sets prefetch={false}", () => {
    const tags: string[] = [];
    for (const f of walk(join(root, "src")).filter((p) => p.endsWith(".tsx"))) {
      for (const m of readFileSync(f, "utf8").matchAll(/<Link\b[^>]*>/g)) {
        if (/href=(?:"\/work\/|\{`\/work\/)/.test(m[0])) tags.push(`${f}: ${m[0]}`);
      }
    }
    expect(tags.length).toBeGreaterThanOrEqual(5);
    for (const t of tags) expect(t).toContain("prefetch={false}");
  });
});
