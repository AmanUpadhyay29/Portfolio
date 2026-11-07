import { describe, expect, it } from "vitest";
import { site } from "../src/content/site";

describe("site", () => {
  it("has the exact headline", () => {
    expect(site.headline.job + " " + site.headline.habit).toBe("Uptime is my job. Building is my habit.");
  });
  it("has the exact roles line", () => {
    expect(site.rolesLine).toBe(
      "Database Administrator & Software Engineer · SQL Server · high availability · Python + TypeScript",
    );
  });
  it("has the exact links", () => {
    expect(site.links.github).toBe("https://github.com/AmanUpadhyay29");
    expect(site.links.linkedin).toBe("https://www.linkedin.com/in/aman-upadhyay-771176-aspirant/");
    expect(site.links.email).toBe("amanupadhyay2905@gmail.com");
  });
});
