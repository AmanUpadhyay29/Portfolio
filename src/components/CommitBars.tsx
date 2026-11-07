import type { CSSProperties } from "react";
import { getRepo } from "../lib/numbers";
import type { RepoKey } from "../lib/numbers";

/** A bar's height as a unitless fraction of the tallest, three decimals at most. CSS turns it into a height. */
export const barHeight = (n: number, max: number): number => Number((n / max).toFixed(3));

/** The bars alone, one <i> per day; the tallest is 1. */
export function Bars({ series }: { series: number[] }) {
  const max = Math.max(1, ...series);
  return series.map((n, i) => <i key={i} style={{ "--h": barHeight(n, max) } as CSSProperties} />);
}

/** Commits per day for the last `days` days. Plain markup: no hooks, no JS. */
export default function CommitBars({ repo, days }: { repo: RepoKey; days: number }) {
  return (
    <div className="commit-bars" role="img" aria-label={`Commits per day, last ${days} days`}>
      <Bars series={getRepo(repo).daily.slice(-days)} />
    </div>
  );
}
