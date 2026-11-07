/** Joins class names; falsy values are dropped. (Replaces shadcn's clsx + tailwind-merge helper.) */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
