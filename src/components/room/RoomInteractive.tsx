"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { resolveTheme, setTheme } from "../../lib/theme";
import { objectById } from "./objects";
import type { RoomObjectId } from "./objects";
import { nextTapAction } from "./tap";
import Tooltip from "./Tooltip";

export const QUERY_LINES = [
  "Hi, I'm Query. I keep Aman's databases up.",
  "SELECT * FROM fun;",
  "Backups: done ✓",
  "40+ processes, zero naps.",
];

type Rect = { left: number; top: number; right: number; bottom: number };
type Pointer = "touch" | "mouse" | "keyboard";

const objIdOf = (t: EventTarget | null): RoomObjectId | null => {
  const el = (t as Element | null)?.closest?.("[data-obj]");
  return (el?.getAttribute("data-obj") as RoomObjectId | null) ?? null;
};

const isNight = () => resolveTheme(document.documentElement.dataset.theme ?? null) === "night";

const typeOf = (e: { pointerType?: string }): Pointer =>
  e.pointerType === "touch" || e.pointerType === "pen" ? "touch" : "mouse";

export default function RoomInteractive({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const tipId = useId();
  const [active, setActive] = useState<{ id: RoomObjectId; rect: Rect } | null>(null);
  const [line, setLine] = useState<{ text: string; rect: Rect } | null>(null);
  const [night, setNight] = useState(true);
  const pointer = useRef<Pointer>("mouse");
  const preview = useRef<RoomObjectId | null>(null);
  const lineIdx = useRef(-1);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lineTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const elFor = useCallback(
    (id: RoomObjectId) => wrap.current?.querySelector<HTMLElement>(`[data-obj="${id}"]`) ?? null,
    [],
  );
  const rectFor = (id: RoomObjectId): Rect | null => {
    const r = elFor(id)?.getBoundingClientRect();
    return r ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } : null;
  };

  const cancelHide = () => clearTimeout(hideTimer.current);
  const show = (id: RoomObjectId) => {
    cancelHide();
    const rect = rectFor(id);
    if (rect) {
      setNight(isNight());
      setActive({ id, rect });
    }
  };
  const hideNow = useCallback(() => {
    clearTimeout(hideTimer.current);
    preview.current = null;
    setActive(null);
    setLine(null);
  }, []);
  const hideSoon = () => {
    cancelHide();
    hideTimer.current = setTimeout(hideNow, 160);
  };

  // aria-describedby on the object that owns the visible tooltip
  const activeId = active?.id;
  const activeRef = useRef<RoomObjectId | null>(null);
  useEffect(() => {
    activeRef.current = activeId ?? null;
  }, [activeId]);
  useEffect(() => {
    if (!activeId) return;
    const el = elFor(activeId);
    el?.setAttribute("aria-describedby", tipId);
    return () => el?.removeAttribute("aria-describedby");
  }, [activeId, tipId, elFor]);

  // Escape, scroll and outside taps close the tooltip
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hideNow();
    };
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.("[data-obj], .room-tip")) hideNow();
    };
    // Scroll and resize move the object: follow it. Tab-focus scrolls the page after focusin,
    // so closing here would drop the tooltip for keyboard users. Close only when it is fully off screen.
    const onMove = () => {
      const cur = activeRef.current;
      if (!cur) return;
      const rect = rectFor(cur);
      if (!rect) return;
      if (rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
        hideNow();
        return;
      }
      setActive({ id: cur, rect });
      setLine((l) => (l ? { ...l, rect: rectFor("query") ?? l.rect } : l));
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onMove, { passive: true });
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onMove);
      window.removeEventListener("resize", onMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideNow]);

  // Query blinks every 3.4 s, only when motion is allowed
  useEffect(() => {
    if (!document.documentElement.classList.contains("motion-ok")) return;
    const eyes = wrap.current?.querySelector<SVGGElement>("[data-eyes]");
    if (!eyes) return;
    eyes.style.transformBox = "fill-box";
    eyes.style.transformOrigin = "center";
    let reopen: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      eyes.style.transform = "scaleY(0.1)";
      reopen = setTimeout(() => {
        eyes.style.transform = "";
      }, 140);
    }, 3400);
    return () => {
      clearInterval(id);
      clearTimeout(reopen);
      eyes.style.transform = "";
    };
  }, []);

  useEffect(
    () => () => {
      clearTimeout(hideTimer.current);
      clearTimeout(lineTimer.current);
    },
    [],
  );

  const sayNext = () => {
    lineIdx.current = (lineIdx.current + 1) % QUERY_LINES.length;
    const rect = rectFor("query");
    if (!rect) return;
    setLine({ text: QUERY_LINES[lineIdx.current], rect });
    clearTimeout(lineTimer.current);
    lineTimer.current = setTimeout(() => setLine(null), 5000);
  };

  const toggleTheme = () => {
    setTheme(isNight() ? "day" : "night");
    setNight(isNight());
  };

  const onPointerOver = (e: React.PointerEvent) => {
    pointer.current = typeOf(e);
    const id = objIdOf(e.target);
    if (id && pointer.current !== "touch") show(id);
    else if (!id && (e.target as Element).closest(".room-tip")) cancelHide();
  };
  const onPointerOut = (e: React.PointerEvent) => {
    if (typeOf(e) === "touch") return;
    if (objIdOf(e.target)) hideSoon();
  };
  const onPointerDown = (e: React.PointerEvent) => {
    pointer.current = typeOf(e);
  };
  const onFocusIn = (e: React.FocusEvent) => {
    const id = objIdOf(e.target);
    if (id) show(id);
    else cancelHide();
  };

  const onClick = (e: React.MouseEvent) => {
    const id = objIdOf(e.target);
    if (!id) return;
    const native = e.nativeEvent as PointerEvent;
    const kind: Pointer = native.pointerType ? typeOf(native) : pointer.current;
    if (id === "window") {
      e.preventDefault();
      toggleTheme();
      show(id);
      return;
    }
    if (id === "query") {
      // Enter on Query follows its link; a mouse click or a tap says the next line instead
      if (kind === "keyboard") return;
      e.preventDefault();
      preview.current = id;
      sayNext();
      show(id);
      return;
    }
    if (nextTapAction({ pointer: kind, previewOpenFor: preview.current }, id) === "preview") {
      e.preventDefault();
      preview.current = id;
      show(id);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    pointer.current = "keyboard";
    if (objIdOf(e.target) === "window" && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      if (e.repeat) return; // a held key toggles once, not on every repeat
      toggleTheme();
    }
  };

  const obj = active ? objectById(active.id) : null;
  const bubbleLeft = line
    ? Math.max(8, Math.min(window.innerWidth - 228, (line.rect.left + line.rect.right) / 2 - 110))
    : 0;

  return (
    <div
      ref={wrap}
      className="room-wrap"
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onPointerDown={onPointerDown}
      onFocus={onFocusIn}
      onBlur={hideSoon}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {children}
      {obj && active ? (
        <Tooltip
          obj={obj}
          id={tipId}
          anchor={active.rect}
          note={obj.id === "window" ? `Click to switch to ${night ? "day" : "night"}` : undefined}
          night={night}
          onEnter={cancelHide}
          onLeave={hideSoon}
        />
      ) : null}
      {line ? (
        <div className="room-bubble" role="status" style={{ left: bubbleLeft, top: Math.max(8, line.rect.top - 54) }}>
          {line.text}
        </div>
      ) : null}
    </div>
  );
}
