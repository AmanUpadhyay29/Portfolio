import data from "../data/numbers.json";

export type RepoKey = "v1" | "matrix" | "xchart";
export type RepoNumbers = {
  total: number;
  first: string;
  daily: number[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const repos = data.repos as Record<RepoKey, RepoNumbers>;

function parseUtc(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function getRepo(k: RepoKey): RepoNumbers {
  return repos[k];
}

export function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

export function sinceLabel(iso: string): string {
  const d = parseUtc(iso);
  return `since ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function asOfLabel(): string {
  const d = parseUtc(data.asOf);
  return `as of ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
