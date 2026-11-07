// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Diagram, H2, H3 } from "../src/components/mdx/MdxComponents";

afterEach(() => vi.unstubAllEnvs());

describe("MDX components", () => {
  it("gives h2 and h3 a slug id", () => {
    render(
      <>
        <H2>The database work</H2>
        <H3>A <code>smaller</code> one</H3>
      </>,
    );
    expect(screen.getByRole("heading", { level: 2 }).id).toBe("the-database-work");
    expect(screen.getByRole("heading", { level: 3 }).id).toBe("a-smaller-one");
  });
  it("shows a labelled placeholder for an unregistered diagram outside production", () => {
    render(<Diagram name="nope" />);
    expect(screen.getByText("Diagram: nope")).toBeTruthy();
  });
  it("throws for an unregistered diagram in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Diagram name="nope" />)).toThrow(/Diagram "nope" is not registered/);
    err.mockRestore();
  });
});
