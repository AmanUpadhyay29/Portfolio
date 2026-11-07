"use client";

import { ignoreKeyRepeat, setTheme } from "@/lib/theme";

/** The text-list twin of the room's window: switches day and night. The name contains the visible "window". */
export default function WindowButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="window: switch day and night"
      className={className}
      onClick={() => setTheme(document.documentElement.dataset.theme === "day" ? "night" : "day")}
      onKeyDown={ignoreKeyRepeat}
    >
      window
    </button>
  );
}
