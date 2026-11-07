import { describe, expect, it } from "vitest";
import { jsonLd } from "../src/lib/json-ld";

describe("jsonLd", () => {
  it("escapes < so a value cannot close the script, and still parses to the same data", () => {
    const data = { name: "</script><script>alert(1)</script>" };
    const out = jsonLd(data);
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script>");
    expect(JSON.parse(out)).toEqual(data);
  });
});
