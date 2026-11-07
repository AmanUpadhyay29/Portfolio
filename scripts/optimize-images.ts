// One-off: turns the owner's photo into the sizes the site serves.
// Local only: the photo's path comes from the gitignored scripts/local-paths.json
// (see local-paths.example.json). Run with `pnpm tsx scripts/optimize-images.ts`.
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { localPaths } from "./local-paths";

const SOURCE = localPaths().photo;
if (!SOURCE || !existsSync(SOURCE)) throw new Error(`the photo in scripts/local-paths.json does not exist: ${SOURCE}`);
const OUT_DIR = join(import.meta.dirname, "..", "public", "images");
const WIDTHS = [320, 640, 960];

mkdirSync(OUT_DIR, { recursive: true });
for (const w of WIDTHS) {
  const base = sharp(SOURCE).resize(w, w, { fit: "cover" });
  await base.clone().webp({ quality: 80 }).toFile(join(OUT_DIR, `aman-${w}.webp`));
  await base.clone().avif({ quality: 55 }).toFile(join(OUT_DIR, `aman-${w}.avif`));
  console.log(`wrote aman-${w}.{webp,avif}`);
}
