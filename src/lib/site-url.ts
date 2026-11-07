/** The site's origin. SITE_URL is set in the production build; local builds use localhost. */
export function siteUrl(): URL {
  return new URL(process.env.SITE_URL ?? "http://localhost:3000");
}
