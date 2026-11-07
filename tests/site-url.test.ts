import { afterEach, describe, expect, it, vi } from "vitest";
import { siteUrl } from "../src/lib/site-url";

afterEach(() => vi.unstubAllEnvs());

describe("siteUrl", () => {
  it("honours SITE_URL", () => {
    vi.stubEnv("SITE_URL", "https://example.test");
    expect(siteUrl().origin).toBe("https://example.test");
  });
  it("falls back to localhost", () => {
    vi.stubEnv("SITE_URL", "");
    delete process.env.SITE_URL;
    expect(siteUrl().origin).toBe("http://localhost:3000");
  });
});
