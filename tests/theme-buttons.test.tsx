// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ThemeToggle from "../src/components/ThemeToggle";
import WindowButton from "../src/components/WindowButton";

beforeEach(() => {
  document.documentElement.dataset.theme = "night";
});
afterEach(cleanup);

describe.each([
  ["ThemeToggle", () => render(<ThemeToggle />)],
  ["WindowButton", () => render(<WindowButton />)],
])("<%s />", (_name, mount) => {
  it("switches the theme on click", () => {
    mount();
    fireEvent.click(screen.getByRole("button"));
    expect(document.documentElement.dataset.theme).toBe("day");
  });
  it("swallows a held Enter or Space, so the theme does not flash", () => {
    mount();
    const btn = screen.getByRole("button");
    expect(fireEvent.keyDown(btn, { key: "Enter" })).toBe(true);
    expect(fireEvent.keyDown(btn, { key: "Enter", repeat: true })).toBe(false);
    expect(fireEvent.keyDown(btn, { key: " ", repeat: true })).toBe(false);
    expect(fireEvent.keyDown(btn, { key: "Tab", repeat: true })).toBe(true);
  });
});

describe("<WindowButton /> name", () => {
  it("is named for what it does and still contains the visible word", () => {
    render(<WindowButton />);
    const btn = screen.getByRole("button", { name: "window: switch day and night" });
    expect(btn.textContent).toBe("window");
  });
});
