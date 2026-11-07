import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type LocalPaths = { repos: Record<"v1" | "matrix" | "xchart", string>; photo: string };

/** Machine paths for the local-only scripts, from the gitignored scripts/local-paths.json. Throws if it is missing. */
export function localPaths(dir = import.meta.dirname): LocalPaths {
  const file = join(dir, "local-paths.json");
  if (!existsSync(file)) {
    throw new Error(`${file} is missing: copy scripts/local-paths.example.json to it and fill in this machine's paths`);
  }
  return JSON.parse(readFileSync(file, "utf8")) as LocalPaths;
}
