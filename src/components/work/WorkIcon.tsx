import { boxFaces, iso, toPoints } from "../room/iso";
import type { Box, Pt3 } from "../room/iso";

type Colors = { top: string; left: string; right: string };

function Bx({ box, c }: { box: Box; c: Colors }) {
  const f = boxFaces(box);
  return (
    <>
      <polygon points={toPoints(f.left)} fill={c.left} />
      <polygon points={toPoints(f.right)} fill={c.right} />
      <polygon points={toPoints(f.top)} fill={c.top} />
    </>
  );
}

const poly = (pts: Pt3[], fill: string, key?: string | number) => <polygon key={key} points={toPoints(pts)} fill={fill} />;

// Object art uses the same colours as the room.
const DARK: Colors = { top: "#2b2e44", left: "#1b1d2c", right: "#23263a" };
const RACK_ROWS = [14, 44, 74, 104, 134, 160];

function Rack() {
  return (
    <svg viewBox="-64 -194 120 262" aria-hidden="true" focusable="false" className="h-16 w-auto">
      <Bx box={{ x: 0, y: 0, z: 0, w: 60, d: 70, h: 190 }} c={DARK} />
      {RACK_ROWS.map((z, i) => (
        <g key={z}>
          {poly([[60.5, 10, z], [60.5, 62, z], [60.5, 62, z + 16], [60.5, 10, z + 16]], "#15172a")}
          {[20, 32, 44].map((yy, j) => {
            const [cx, cy] = iso(60.6, yy, z + 8);
            return <circle key={yy} cx={cx} cy={cy} r={3.2} fill={j === 2 && i % 3 === 0 ? "#ffd27a" : "#c6f36b"} />;
          })}
        </g>
      ))}
    </svg>
  );
}

function Monitor({ kind }: { kind: "matrix" | "xchart" }) {
  const chart = [10, 22, 16, 30, 24, 36]
    .map((z, i) => iso(8 + i * 9, 4.1, 14 + z).map((n) => n.toFixed(2)).join(","))
    .join(" ");
  return (
    <svg viewBox="-6 -66 64 104" aria-hidden="true" focusable="false" className="h-16 w-auto">
      <Bx box={{ x: 28, y: 0, z: 0, w: 6, d: 6, h: 18 }} c={DARK} />
      {poly([[0, 4, 18], [62, 4, 18], [62, 4, 62], [0, 4, 62]], "#111325")}
      {poly([[3, 4.1, 21], [59, 4.1, 21], [59, 4.1, 59], [3, 4.1, 59]], kind === "matrix" ? "#1b2a4a" : "#1d1b3a")}
      {kind === "matrix" ? (
        [0, 1, 2, 3].map((i) => {
          const x1 = 7 + 22 + ((i * 11) % 24);
          return poly([[7, 4.2, 52 - i * 8], [x1, 4.2, 52 - i * 8], [x1, 4.2, 49 - i * 8], [7, 4.2, 49 - i * 8]], "#7cc4ff", i);
        })
      ) : (
        <polyline points={chart} fill="none" stroke="#ff9ecb" strokeWidth={2} />
      )}
    </svg>
  );
}

/** A small isometric icon of the room object a case study belongs to. */
export default function WorkIcon({ object }: { object: "rack" | "matrix" | "xchart" }) {
  return object === "rack" ? <Rack /> : <Monitor kind={object} />;
}
