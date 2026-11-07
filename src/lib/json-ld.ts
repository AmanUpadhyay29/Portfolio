/** JSON for an inline <script type="application/ld+json">: every < is escaped, so no value can close the script. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
