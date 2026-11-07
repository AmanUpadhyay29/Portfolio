/** Renders the 1200x630 Open Graph PNGs into public/og. Run by hand: `pnpm exec tsx scripts/make-og.tsx`. CI does not run it. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { allWorks } from "../.content-collections/generated/index.js";
import { site } from "../src/content/site";
import { boxFaces, toPoints, type Box } from "../src/components/room/iso";

const root = process.cwd();
const cache = join(root, "scripts", ".cache");
const outDir = join(root, "public", "og");

async function font(family: string, weight: number): Promise<Buffer> {
  const file = join(cache, `${family}-${weight}.ttf`);
  if (existsSync(file)) return readFileSync(file);
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`)).text();
  const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!url) throw new Error(`no font url for ${family} ${weight}`);
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  mkdirSync(cache, { recursive: true });
  writeFileSync(file, buf);
  return buf;
}

const GOLD = "#ffd27a";
const FG = "#f3f1ff";
const MUTED = "#a7a6c9";
const LIME = "#c6f36b";

type Shade = [top: string, left: string, right: string];
const rack: Shade = ["#3a3d6e", "#262850", "#2f3260"];

/** A small isometric object as an SVG data URI. */
function objectSvg(kind: "rack" | "matrix" | "xchart"): string {
  const polys: string[] = [];
  const add = (b: Box, [top, left, right]: Shade) => {
    const f = boxFaces(b);
    polys.push(
      `<polygon points="${toPoints(f.left)}" fill="${left}"/>`,
      `<polygon points="${toPoints(f.right)}" fill="${right}"/>`,
      `<polygon points="${toPoints(f.top)}" fill="${top}"/>`,
    );
  };
  if (kind === "rack") {
    add({ x: 0, y: 0, z: 0, w: 90, d: 70, h: 150 }, rack);
    for (let i = 0; i < 4; i++) {
      const f = boxFaces({ x: 0, y: 0, z: 18 + i * 32, w: 90, d: 70, h: 14 });
      polys.push(`<polygon points="${toPoints(f.left)}" fill="${GOLD}" opacity="0.85"/>`);
      const g = boxFaces({ x: 62, y: 0.5, z: 21 + i * 32, w: 18, d: 70, h: 6 });
      polys.push(`<polygon points="${toPoints(g.left)}" fill="${LIME}"/>`);
    }
  } else {
    add({ x: 20, y: 20, z: 0, w: 50, d: 30, h: 8 }, ["#4a4d80", "#262850", "#2f3260"]);
    add({ x: 36, y: 30, z: 8, w: 18, d: 10, h: 50 }, ["#4a4d80", "#262850", "#2f3260"]);
    add({ x: 0, y: 30, z: 58, w: 90, d: 10, h: 76 }, ["#4a4d80", "#262850", "#2f3260"]);
    const screen = boxFaces({ x: 6, y: 30, z: 66, w: 78, d: 10.5, h: 60 }).left;
    polys.push(`<polygon points="${toPoints(screen)}" fill="${kind === "matrix" ? "#7cc4ff" : "#ff9ecb"}"/>`);
    const bars = kind === "matrix" ? [20, 34, 26, 44] : [18, 30, 22, 40, 34];
    bars.forEach((h, i) => {
      const f = boxFaces({ x: 14 + i * 13, y: 30, z: 72, w: 7, d: 11, h }).left;
      polys.push(`<polygon points="${toPoints(f)}" fill="#141528" opacity="0.55"/>`);
    });
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-90 -190 220 300" width="440" height="600">${polys.join("")}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

type N = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): N => ({
  type,
  props: { style: { display: "flex", ...style }, children, ...extra },
});

const frame = (children: unknown[]): N =>
  h(
    "div",
    {
      width: 1200,
      height: 630,
      padding: 72,
      color: FG,
      fontFamily: "Inter",
      backgroundColor: "#141528",
      backgroundImage: "radial-gradient(ellipse at 75% 35%, #262850 0%, #141528 70%)",
      position: "relative",
    },
    children,
  );

const homeCard = (): N =>
  frame([
    h("div", { flexDirection: "column", justifyContent: "center", width: 1000 }, [
      h("div", { fontFamily: "Fredoka", fontSize: 38, color: MUTED }, site.name),
      h("div", { fontFamily: "Fredoka", fontSize: 88, lineHeight: 1.08, marginTop: 28, flexWrap: "wrap" }, [
        h("span", { marginRight: 22 }, site.headline.job),
        h("span", { color: GOLD, marginRight: 14 }, "Building"),
        h("span", {}, "is my habit."),
      ]),
      h("div", { fontSize: 28, color: MUTED, marginTop: 36, lineHeight: 1.4 }, site.rolesLine),
    ]),
  ]);

const workCard = (w: { title: string; status: string; object: "rack" | "matrix" | "xchart" }): N =>
  frame([
    h("div", { flexDirection: "column", justifyContent: "center", width: 640 }, [
      h("div", { fontFamily: "Fredoka", fontSize: 30, color: MUTED }, site.name),
      h("div", { fontFamily: "Fredoka", fontSize: 76, lineHeight: 1.1, marginTop: 24 }, w.title),
      h("div", { fontSize: 30, color: LIME, marginTop: 30 }, `● ${w.status}`),
    ]),
    {
      type: "img",
      props: { src: objectSvg(w.object), width: 440, height: 600, style: { position: "absolute", right: 70, top: 15 } },
    },
  ]);

async function main() {
  const fonts = [
    { name: "Fredoka", data: await font("Fredoka", 700), weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: await font("Inter", 500), weight: 500 as const, style: "normal" as const },
  ];
  mkdirSync(outDir, { recursive: true });
  const cards: [string, N][] = [
    ["home", homeCard()],
    ...allWorks.map((w): [string, N] => [w.slug, workCard(w)]),
  ];
  for (const [name, node] of cards) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svg = await satori(node as any, { width: 1200, height: 630, fonts });
    const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
    writeFileSync(join(outDir, `${name}.png`), png);
    console.log(`og/${name}.png ${png.length} bytes`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
