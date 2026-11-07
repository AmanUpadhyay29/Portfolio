// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import HyperName from "../src/components/HyperName";

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("motion-ok");
});

describe("<HyperName /> accessible name", () => {
  it("keeps the real name for assistive tech while the letters scramble", async () => {
    document.documentElement.classList.add("motion-ok");
    render(createElement("a", { href: "/" }, createElement(HyperName, { text: "Aman Upadhyay" })));
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull(); // nothing loads before a hover
    fireEvent.pointerEnter(screen.getByRole("link")); // the listener sits on the ancestor link
    await waitFor(() => expect(document.querySelector('[aria-hidden="true"]')).not.toBeNull(), { timeout: 8000 });
    await new Promise((r) => setTimeout(r, 200)); // into the scramble
    expect(document.querySelector(".sr-only")?.textContent).toBe("Aman Upadhyay");
    expect(screen.getByRole("link", { name: "Aman Upadhyay" })).toBeTruthy();
  });

  it("loads on focus of the ancestor link", async () => {
    document.documentElement.classList.add("motion-ok");
    render(createElement("a", { href: "/" }, createElement(HyperName, { text: "Aman Upadhyay" })));
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
    fireEvent.focusIn(screen.getByRole("link"));
    await waitFor(() => expect(document.querySelector('[aria-hidden="true"]')).not.toBeNull(), { timeout: 8000 });
  });
});
