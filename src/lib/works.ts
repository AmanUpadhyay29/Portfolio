import { allWorks as collected } from "content-collections";

/** Every case study, sorted by `order`. */
export const allWorks = [...collected].sort((a, b) => a.order - b.order);
export type Work = (typeof allWorks)[number];

export function getWork(slug: string): Work | undefined {
  return allWorks.find((w) => w.slug === slug);
}

/** Neighbours by `order` (null at either end). */
export function neighbours(slug: string): { prev: Work | null; next: Work | null } {
  const i = allWorks.findIndex((w) => w.slug === slug);
  return { prev: i > 0 ? allWorks[i - 1] : null, next: i >= 0 && i < allWorks.length - 1 ? allWorks[i + 1] : null };
}
