import { describe, expect, it } from "vitest";
import { workSchema } from "../src/lib/work-schema";
import { slugify } from "../src/lib/slugify";
import { allWorks } from "../src/lib/works";

const valid = {
  title: "Sample system",
  slug: "sample",
  summary: "A short sample summary.",
  status: "running 24/7",
  repo: "v1",
  object: "rack",
  stack: ["TypeScript"],
  order: 1,
};

describe("work schema", () => {
  it("accepts a valid example", () => {
    expect(workSchema.safeParse(valid).success).toBe(true);
  });
  it("rejects status 'profit'", () => {
    expect(workSchema.safeParse({ ...valid, status: "profit" }).success).toBe(false);
  });
  it("rejects a missing repo", () => {
    const rest: Record<string, unknown> = { ...valid };
    delete rest.repo;
    expect(workSchema.safeParse(rest).success).toBe(false);
  });
  it("rejects a summary over 200 characters and an empty stack", () => {
    expect(workSchema.safeParse({ ...valid, summary: "x".repeat(201) }).success).toBe(false);
    expect(workSchema.safeParse({ ...valid, stack: [] }).success).toBe(false);
  });
});

describe("allWorks", () => {
  it("has at least one work, sorted by order", () => {
    expect(allWorks.length).toBeGreaterThanOrEqual(1);
    const orders = allWorks.map((w) => w.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});

describe("slugify", () => {
  it("turns a heading into an id", () => {
    expect(slugify("The database work")).toBe("the-database-work");
    expect(slugify("  What it's *not*: a bot! ")).toBe("what-its-not-a-bot");
  });
});
