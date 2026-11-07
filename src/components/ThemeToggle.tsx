"use client";

import { useSyncExternalStore } from "react";
import { ignoreKeyRepeat, resolveTheme, setTheme, type Theme } from "@/lib/theme";

function subscribe(cb: () => void) {
  window.addEventListener("pf-theme", cb);
  return () => window.removeEventListener("pf-theme", cb);
}
const read = (): Theme => resolveTheme(document.documentElement.dataset.theme ?? null);
const readServer = (): Theme => "night";

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, readServer);
  const next: Theme = theme === "night" ? "day" : "night";
  return (
    <button
      type="button"
      aria-label={`Switch to ${next}`}
      onClick={() => setTheme(next)}
      onKeyDown={ignoreKeyRepeat}
      suppressHydrationWarning
      className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-line bg-panel text-fg hover:text-primary-ink"
    >
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {theme === "night" ? (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  );
}
