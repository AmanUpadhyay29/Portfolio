import { execSync } from "node:child_process";

/** Generate .content-collections before any test, so `vitest` works from a clean checkout. */
export default function setup() {
  execSync("pnpm exec content-collections build", { stdio: "inherit" });
}
