import { checkOut, checkSiteUrls, shouldRequireSiteUrl } from "../scripts/check-out";

const opts = {
  resumeAvailable: false,
  headline: "Uptime is my job. Building is my habit.",
  rolesLine: "Database Administrator & Software Engineer · SQL Server · high availability · Python + TypeScript",
};

const objs = (omit?: string) =>
  ["/work/trading-platform", "/work/matrix", "/work/xchart", "/#job", "/#about"]
    .filter((h) => h !== omit)
    .map((h) => `<a href="${h}" data-obj="x" aria-label="Thing">t</a>`)
    .join("");
const list = (omit?: string) =>
  `<ul data-text-links>${["/work/trading-platform", "/work/matrix", "/work/xchart", "#job", "#about"]
    .filter((h) => h !== omit)
    .map((h) => `<li><a href="${h}">l</a></li>`)
    .join("")}</ul>`;

function page(o: { h1?: string; omit?: string; extra?: string; label?: string } = {}) {
  const h1 = o.h1 ?? "Uptime is my <span>job</span>. <span>Building</span> is my habit.";
  return `<html><body><h1>${h1}</h1><p>Database Administrator &amp; Software Engineer · SQL Server · high availability · Python + TypeScript</p>
  <svg class="room">${objs(o.omit)}${o.label !== undefined ? `<a href="/x" data-obj="y" aria-label="${o.label}">x</a>` : ""}</svg>${list(o.omit)}${o.extra ?? ""}</body></html>`;
}

describe("checkOut", () => {
  it("passes a good page", () => expect(checkOut(page(), opts)).toEqual([]));
  it("fails on a missing headline", () =>
    expect(checkOut(page({ h1: "Hello" }), opts).join()).toMatch(/headline missing/));
  it("fails on a missing href", () =>
    expect(checkOut(page({ omit: "/work/xchart" }), opts).join()).toMatch(/\/work\/xchart missing/));
  it("fails on an empty aria-label", () =>
    expect(checkOut(page({ label: " " }), opts).join()).toMatch(/aria-label/));
  it("fails on inline opacity:0", () =>
    expect(checkOut(page({ extra: '<span style="opacity: 0">x</span>' }), opts).join()).toMatch(/opacity/));
  it("allows opacity:0.5", () =>
    expect(checkOut(page({ extra: '<span style="opacity:0.5">x</span>' }), opts)).toEqual([]));
  it("fails on a resume link while unavailable", () =>
    expect(checkOut(page({ extra: '<a href="/resume.pdf">Resume</a>' }), opts).join()).toMatch(/resume/));
  it("accepts a resume link when available", () =>
    expect(checkOut(page({ extra: '<a href="/resume.pdf">Resume</a>' }), { ...opts, resumeAvailable: true })).toEqual([]));
  it("fails on a phone number", () =>
    expect(checkOut(page({ extra: "<p>Call 9876543210</p>" }), opts).join()).toMatch(/phone/));
});

describe("checkSiteUrls", () => {
  const og = (u: string) => `<meta property="og:image" content="${u}"/>`;
  const map = (u: string) => `<urlset><url><loc>${u}/</loc></url></urlset>`;
  it("passes real URLs", () =>
    expect(checkSiteUrls(og("https://x.dev/og/home.png"), map("https://x.dev"))).toEqual([]));
  it("fails a localhost og:image", () =>
    expect(checkSiteUrls(og("http://localhost:3000/og/home.png"), map("https://x.dev")).join()).toMatch(/og:image/));
  it("fails https://localhost", () =>
    expect(checkSiteUrls(og("https://localhost/og/home.png"), map("https://x.dev")).join()).toMatch(/og:image/));
  it("fails 127.0.0.1 in og:image and sitemap", () => {
    expect(checkSiteUrls(og("http://127.0.0.1:5050/a.png"), map("https://x.dev")).join()).toMatch(/og:image/);
    expect(checkSiteUrls(og("https://x.dev/a.png"), map("http://127.0.0.1:5050")).join()).toMatch(/sitemap/);
  });
  it("fails a missing og:image", () =>
    expect(checkSiteUrls("<html></html>", map("https://x.dev")).join()).toMatch(/og:image missing/));
  it("fails a missing sitemap file", () =>
    expect(checkSiteUrls(og("https://x.dev/a.png"), null).join()).toMatch(/sitemap.xml is missing/));
  it("fails a localhost sitemap", () =>
    expect(checkSiteUrls(og("https://x.dev/a.png"), map("http://localhost:3000")).join()).toMatch(/sitemap/));
});

describe("shouldRequireSiteUrl", () => {
  it("is on when REQUIRE_SITE_URL is 1", () => expect(shouldRequireSiteUrl({ REQUIRE_SITE_URL: "1" })).toBe(true));
  it("is on for a Workers Builds build of main", () =>
    expect(shouldRequireSiteUrl({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "main" })).toBe(true));
  it("is off for a Workers Builds preview branch", () =>
    expect(shouldRequireSiteUrl({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "phase-1" })).toBe(false));
  it("is off locally and in GitHub CI", () => {
    expect(shouldRequireSiteUrl({})).toBe(false);
    expect(shouldRequireSiteUrl({ REQUIRE_SITE_URL: "0", WORKERS_CI_BRANCH: "main", CI: "true" })).toBe(false);
  });
});
