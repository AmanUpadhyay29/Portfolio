"use client";

import { useLayoutEffect, useRef } from "react";
import CommitBars from "../CommitBars";
import type { RoomObject } from "./objects";

const W = 260;
const MARGIN = 8;

export type TooltipProps = {
  obj: RoomObject;
  id: string;
  anchor: { left: number; top: number; right: number; bottom: number };
  /** Replaces the blurb (the window says what a click will do). */
  note?: string;
  /** The theme on screen: the window's clock follows it. */
  night: boolean;
  onEnter: () => void;
  onLeave: () => void;
};

export default function Tooltip({ obj, id, anchor, note, night, onEnter, onLeave }: TooltipProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const h = el.offsetHeight;
    const left = Math.max(MARGIN, Math.min(vw - W - MARGIN, (anchor.left + anchor.right) / 2 - W / 2));
    let top = anchor.bottom + 10;
    if (top + h > vh - MARGIN) top = Math.max(MARGIN, anchor.top - h - 10);
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }, [anchor, obj.id]);

  return (
    <div ref={ref} id={id} role="tooltip" className="room-tip" onPointerEnter={onEnter} onPointerLeave={onLeave}>
      <strong className="t">{obj.label}</strong>
      <div className="s">● {!night && obj.dayStatus ? obj.dayStatus : obj.status}</div>
      <p>{note ?? obj.blurb}</p>
      {obj.repo ? <CommitBars repo={obj.repo} days={60} /> : null}
      {obj.href ? (
        <a className="open" href={obj.href}>
          Open →
        </a>
      ) : null}
    </div>
  );
}
