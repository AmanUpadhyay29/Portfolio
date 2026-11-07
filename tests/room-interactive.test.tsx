// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Room from "../src/components/room/Room";
import RoomInteractive, { QUERY_LINES } from "../src/components/room/RoomInteractive";

const q = (c: ParentNode, id: string) => c.querySelector(`[data-obj="${id}"]`) as HTMLElement;

beforeEach(() => {
  document.documentElement.dataset.theme = "night";
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  document.documentElement.classList.remove("motion-ok");
});

const mount = () =>
  render(
    <RoomInteractive>
      <Room />
    </RoomInteractive>,
  );
const tip = (c: ParentNode) => c.querySelector('[role="tooltip"]');

describe("<RoomInteractive />", () => {
  it("shows a tooltip on focus with 60 bars, and Escape closes it", () => {
    const { container } = render(
      <RoomInteractive>
        <Room />
      </RoomInteractive>,
    );
    act(() => q(container, "rack").focus());
    const tip = container.querySelector('[role="tooltip"]')!;
    expect(tip).not.toBeNull();
    expect(tip.textContent).toMatch(/trading platform/i);
    expect(tip.querySelectorAll(".commit-bars i")).toHaveLength(60);
    expect(q(container, "rack").getAttribute("aria-describedby")).toBe(tip.id);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
  });

  it("toggles the theme from the window by click and by Enter", () => {
    const { container } = render(
      <RoomInteractive>
        <Room />
      </RoomInteractive>,
    );
    fireEvent.click(q(container, "window"));
    expect(document.documentElement.dataset.theme).toBe("day");
    fireEvent.keyDown(q(container, "window"), { key: "Enter" });
    expect(document.documentElement.dataset.theme).toBe("night");
  });

  it("Query does not navigate and cycles its lines", () => {
    const { container } = render(
      <RoomInteractive>
        <Room />
      </RoomInteractive>,
    );
    const query = q(container, "query");
    expect(fireEvent.click(query)).toBe(false); // preventDefault was called
    expect(container.querySelector(".room-bubble")!.textContent).toBe(QUERY_LINES[0]);
    fireEvent.click(query);
    expect(container.querySelector(".room-bubble")!.textContent).toBe(QUERY_LINES[1]);
    expect(container.querySelector('[role="tooltip"]')).not.toBeNull();
  });

  it("keeps the tooltip and aria-describedby when the page scrolls after focus", () => {
    const { container } = mount();
    act(() => q(container, "rack").focus());
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(tip(container)).not.toBeNull();
    expect(q(container, "rack").getAttribute("aria-describedby")).toBe(tip(container)!.id);
  });

  it("touch: first tap previews (prevented), second tap follows (not prevented)", () => {
    const { container } = mount();
    const rack = q(container, "rack");
    fireEvent.pointerDown(rack, { pointerType: "touch" });
    expect(fireEvent.click(rack)).toBe(false);
    expect(tip(container)).not.toBeNull();
    fireEvent.pointerDown(rack, { pointerType: "touch" });
    expect(fireEvent.click(rack)).toBe(true);
  });

  it("a mouse click on a linked object is not prevented", () => {
    const { container } = mount();
    const rack = q(container, "rack");
    fireEvent.pointerDown(rack, { pointerType: "mouse" });
    expect(fireEvent.click(rack)).toBe(true);
  });

  it.each(["rack", "query"])("Enter on %s follows the link: the click after the keydown is not prevented", (id) => {
    const { container } = mount();
    const el = q(container, id);
    expect(fireEvent.keyDown(el, { key: "Enter" })).toBe(true);
    expect(fireEvent.click(el)).toBe(true); // a keyboard click carries no pointerType
    expect(container.querySelector(".room-bubble")).toBeNull();
  });

  it.each(["mouse", "touch"])("%s clicks on Query still cycle its lines, after a keyboard visit too", (pointerType) => {
    const { container } = mount();
    const query = q(container, "query");
    fireEvent.keyDown(query, { key: "Tab" });
    for (const i of [0, 1, 2]) {
      fireEvent.pointerDown(query, { pointerType });
      expect(fireEvent.click(query, { pointerType } as MouseEventInit)).toBe(false);
      expect(container.querySelector(".room-bubble")!.textContent).toBe(QUERY_LINES[i]);
    }
  });

  it("a held key on the window toggles the theme once", () => {
    const { container } = mount();
    const win = q(container, "window");
    fireEvent.keyDown(win, { key: "Enter" });
    expect(document.documentElement.dataset.theme).toBe("day");
    for (let i = 0; i < 5; i++) expect(fireEvent.keyDown(win, { key: "Enter", repeat: true })).toBe(false);
    expect(document.documentElement.dataset.theme).toBe("day");
  });

  it("the window tooltip's clock follows the theme, and the title is not a heading", () => {
    const { container } = mount();
    act(() => q(container, "window").focus());
    expect(tip(container)!.querySelector(".s")!.textContent).toBe("● 23:00");
    expect(tip(container)!.querySelector("h1, h2, h3, h4, h5, h6")).toBeNull();
    expect(tip(container)!.querySelector("strong.t")!.textContent).toBe("Switch day and night");
    fireEvent.click(q(container, "window"));
    expect(document.documentElement.dataset.theme).toBe("day");
    expect(tip(container)!.querySelector(".s")!.textContent).toBe("● 09:00");
  });

  it("the window tooltip has no Open link", () => {
    const { container } = mount();
    act(() => q(container, "window").focus());
    expect(tip(container)).not.toBeNull();
    expect(tip(container)!.textContent).not.toContain("Open");
    expect(tip(container)!.querySelector("a")).toBeNull();
  });

  it("pointerout closes the tooltip only after the delay", () => {
    vi.useFakeTimers();
    const { container } = mount();
    const rack = q(container, "rack");
    fireEvent.pointerOver(rack, { pointerType: "mouse" });
    expect(tip(container)).not.toBeNull();
    fireEvent.pointerOut(rack, { pointerType: "mouse" });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(tip(container)).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(tip(container)).toBeNull();
  });

  it("unmount with a pending hide timer and the blink interval leaves no timers", () => {
    vi.useFakeTimers();
    document.documentElement.classList.add("motion-ok");
    const { container, unmount } = mount();
    const rack = q(container, "rack");
    fireEvent.pointerOver(rack, { pointerType: "mouse" });
    fireEvent.pointerOut(rack, { pointerType: "mouse" });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("Query blinks only under motion-ok", () => {
    vi.useFakeTimers();
    document.documentElement.classList.add("motion-ok");
    const on = mount();
    const eyesOn = on.container.querySelector("[data-eyes]") as SVGGElement;
    const before = eyesOn.style.transform;
    act(() => {
      vi.advanceTimersByTime(3400);
    });
    expect(eyesOn.style.transform).not.toBe(before);
    on.unmount();

    document.documentElement.classList.remove("motion-ok");
    const off = mount();
    const eyesOff = off.container.querySelector("[data-eyes]") as SVGGElement;
    act(() => {
      vi.advanceTimersByTime(3400);
    });
    expect(eyesOff.style.transform).toBe("");
  });
});
