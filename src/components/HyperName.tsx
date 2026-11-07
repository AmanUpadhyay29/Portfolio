"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";

type HyperTextType = ComponentType<{ children: string; as?: "span"; className?: string; duration?: number }>;

/**
 * The server renders a plain <span>, so the name is visible without JavaScript.
 * Only when motion is allowed, and only on the first hover or focus, it swaps to
 * Magic UI's Hyper Text (loaded then, so the motion library stays off the first
 * load) which decodes the letters.
 */
export default function HyperName({ text, className }: { text: string; className?: string }) {
  const [Hyper, setHyper] = useState<HyperTextType | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !document.documentElement.classList.contains("motion-ok")) return;
    let live = true;
    const load = () => {
      import("./ui/hyper-text").then((m) => {
        if (live) setHyper(() => m.HyperText as HyperTextType);
      });
    };
    // the span is not focusable; the link or button around it is
    const target = el.closest("a, button") ?? el;
    target.addEventListener("pointerenter", load, { once: true });
    target.addEventListener("focusin", load, { once: true });
    return () => {
      live = false;
      target.removeEventListener("pointerenter", load);
      target.removeEventListener("focusin", load);
    };
  }, []);

  if (!Hyper)
    return (
      <span ref={ref} className={className}>
        {text}
      </span>
    );
  return (
    <>
      <span aria-hidden="true">
        <Hyper as="span" className={`whitespace-pre ${className ?? ""}`} duration={700}>
          {text}
        </Hyper>
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
