export type Theme = "night" | "day";
export const THEME_KEY = "pf-theme";

export function resolveTheme(stored: string | null): Theme {
  return stored === "day" ? "day" : "night";
}

/**
 * A held Enter repeats keydown, and each repeat clicks a focused button: swallow the
 * repeats so a theme button switches once and the page does not flash.
 */
export function ignoreKeyRepeat(e: { repeat: boolean; key: string; preventDefault(): void }): void {
  if (e.repeat && (e.key === "Enter" || e.key === " ")) e.preventDefault();
}

/** Runs before first paint. Self-contained: no imports, never throws. */
export const themeInitScript = `(function(){var d=document.documentElement,t="night",r=false;try{if(localStorage.getItem("${THEME_KEY}")==="day")t="day"}catch(e){}try{r=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}d.dataset.theme=t;if(!r)d.classList.add("motion-ok")})();`;

export function setTheme(t: Theme): void {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {}
  window.dispatchEvent(new Event(THEME_KEY));
}
