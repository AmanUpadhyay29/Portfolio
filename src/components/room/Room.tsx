import type { ReactNode } from "react";
import "./room.css";
import { boxFaces, iso, toPoints } from "./iso";
import type { Pt3 } from "./iso";
import { objectById } from "./objects";
import type { RoomObjectId } from "./objects";
import Query from "./Query";

const C = Math.cos(Math.PI / 6);

function Poly({ pts, fill }: { pts: Pt3[]; fill: string }) {
  return <polygon points={toPoints(pts)} style={{ fill }} />;
}

type BoxProps = { x: number; y: number; z: number; w: number; d: number; h: number; top: string; left: string; right: string };

/** A box: left face, right face, then top, as in the mockup. */
function Bx({ x, y, z, w, d, h, top, left, right }: BoxProps) {
  const f = boxFaces({ x, y, z, w, d, h });
  return (
    <>
      <Poly pts={f.left} fill={left} />
      <Poly pts={f.right} fill={right} />
      <Poly pts={f.top} fill={top} />
    </>
  );
}

type Bounds = [x0: number, x1: number, y0: number, y1: number, z0: number, z1: number];

/** Transparent outline around an object's silhouette; shown on :focus-visible without relying on CSS filter. */
function FocusRing({ b: [x0, x1, y0, y1, z0, z1] }: { b: Bounds }) {
  const pts: Pt3[] = [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y1, z1]];
  return <polygon className="focus-ring" points={toPoints(pts)} />;
}

/** A linked object. The window has no href: it is a button that the theme toggle wires up later. */
function Obj({ id, ring, children }: { id: RoomObjectId; ring: Bounds; children: ReactNode }) {
  const o = objectById(id);
  if (o.href === null) {
    return (
      <a role="button" tabIndex={0} data-obj={id} aria-label={o.label} className="obj">
        {children}
        <FocusRing b={ring} />
      </a>
    );
  }
  return (
    <a href={o.href} data-obj={id} aria-label={o.label} className="obj">
      {children}
      <FocusRing b={ring} />
    </a>
  );
}

const WOOD = { top: "#c08757", left: "#8f5f39", right: "#a46e45" };
const LEG = { top: "#8f5f39", left: "#6f4628", right: "#7d5232" };
const DARK = { top: "#333", left: "#222", right: "#2a2a2a" };

const monitorLines = [0, 1, 2, 3, 4].map((i) => {
  const x2 = 150 + ((i * 7) % 28);
  const z = 130 - i * 6;
  const pts: Pt3[] = [[136, 30.8, z], [x2, 30.8, z], [x2, 30.8, z + 2], [136, 30.8, z + 2]];
  return { i, pts, fill: i % 2 ? "#7cc4ff" : "#c6f36b" };
});

const chartZ = [110, 116, 112, 122, 118, 128, 124, 131];
const chartPoints = chartZ.map((z, i) => iso(206 + i * 7, 30.9, z).map((n) => n.toFixed(2)).join(",")).join(" ");

const stars: [number, number][] = [[170, 200], [190, 150], [215, 175], [240, 140], [175, 135]];
const rackRows = Array.from({ length: 9 }, (_, i) => 20 + i * 19);
const plantLeaves: [number, number][] = [[0, 0], [-8, 6], [8, 4]];

const [moonX, moonY] = iso(230, 0, 196);
const [glowX, glowY] = iso(266, 44, 112);
const [steamX, steamY] = iso(180, 60, 96);
const [queryX, queryY] = iso(12, 183, 156);

/*
 * Photo frame: a flat image mapped onto the left wall (x = 0) with one affine matrix.
 * Local (u, v) -> wall y = 236 - (u + 3), z = 200 - (v + 3), i.e. a 3 unit inset in the frame.
 *   X = (u + 3) * C - 236 * C   Y = (236 - u - 3) / 2 - (200 - v - 3)
 */
const photoMatrix = `matrix(${C.toFixed(4)} -0.5 0 1 ${(-233 * C).toFixed(3)} -80.5)`;

export default function Room() {
  return (
    <svg className="room" viewBox="-430 -330 860 640" role="group" aria-labelledby="room-title" aria-describedby="room-desc">
      <title id="room-title">An isometric room</title>
      <desc id="room-desc">
        A cozy isometric room with a server rack, a desk with two monitors, a shelf with a database mascot, a photo and a window. Each object links to a section of this site.
      </desc>
      <defs>
        <radialGradient id="room-lamp-grad">
          <stop offset="0" stopColor="#ffd27a" stopOpacity=".35" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="room-sun-grad">
          <stop offset="0" stopColor="#ffd27a" stopOpacity=".6" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <clipPath id="room-photo-clip">
          <rect x="0" y="0" width="34" height="34" />
        </clipPath>
      </defs>

      {/* shell and rug */}
      <g>
        <Poly pts={[[0, 0, 0], [300, 0, 0], [300, 300, 0], [0, 300, 0]]} fill="var(--room-floor)" />
        <Poly pts={[[0, 0, 0], [0, 300, 0], [0, 300, 260], [0, 0, 260]]} fill="var(--room-wall-left)" />
        <Poly pts={[[0, 0, 0], [300, 0, 0], [300, 0, 260], [0, 0, 260]]} fill="var(--room-wall-back)" />
        <Poly pts={[[110, 120, 0.5], [250, 120, 0.5], [250, 250, 0.5], [110, 250, 0.5]]} fill="var(--room-rug)" />
      </g>

      {/* window (back wall) */}
      <Obj id="window" ring={[148, 262, 0, 1, 118, 222]}>
        <Poly pts={[[150, 0, 120], [260, 0, 120], [260, 0, 220], [150, 0, 220]]} fill="var(--room-window-frame)" />
        <Poly pts={[[156, 0.5, 126], [254, 0.5, 126], [254, 0.5, 214], [156, 0.5, 214]]} fill="var(--room-sky)" />
        <circle className="moon" cx={moonX} cy={moonY} r={13} fill="#fff3c4" />
        <circle className="sun" cx={moonX} cy={moonY} r={30} fill="url(#room-sun-grad)" />
        <circle className="sun" cx={moonX} cy={moonY} r={13} fill="#ffd27a" />
        {stars.map(([a, b]) => {
          const [sx, sy] = iso(a, 0, b);
          return <circle key={`${a}-${b}`} className="star led" cx={sx} cy={sy} r={1.6} fill="#fff" />;
        })}
        <Poly pts={[[205, 0.6, 120], [207, 0.6, 120], [207, 0.6, 220], [205, 0.6, 220]]} fill="var(--room-window-frame)" />
        <Poly pts={[[150, 0.6, 169], [260, 0.6, 169], [260, 0.6, 171], [150, 0.6, 171]]} fill="var(--room-window-frame)" />
      </Obj>

      {/* server rack (left wall) */}
      <Obj id="rack" ring={[8, 72, 28, 102, 0, 220]}>
        <Bx x={10} y={30} z={0} w={60} d={70} h={190} top="#2b2e44" left="#1b1d2c" right="#23263a" />
        {rackRows.map((z, i) => (
          <g key={z}>
            <Poly pts={[[70.5, 40, z], [70.5, 92, z], [70.5, 92, z + 12], [70.5, 40, z + 12]]} fill="#15172a" />
            {[48, 56, 64].map((yy, j) => {
              const [lx, ly] = iso(70.6, yy + 20, z + 6);
              return (
                <circle
                  key={yy}
                  className="led"
                  cx={lx}
                  cy={ly}
                  r={2.2}
                  fill={j === 2 && i % 3 === 0 ? "#ffd27a" : "#c6f36b"}
                  style={{ animationDelay: `${(i * 0.17 + j * 0.3).toFixed(2)}s` }}
                />
              );
            })}
          </g>
        ))}
      </Obj>

      {/* desk (back wall) */}
      <g>
        <Bx x={120} y={20} z={70} w={150} d={60} h={8} {...WOOD} />
        <Bx x={124} y={24} z={0} w={8} d={8} h={70} {...LEG} />
        <Bx x={258} y={24} z={0} w={8} d={8} h={70} {...LEG} />
        <Bx x={124} y={68} z={0} w={8} d={8} h={70} {...LEG} />
        <Bx x={258} y={68} z={0} w={8} d={8} h={70} {...LEG} />
      </g>

      {/* monitors */}
      <Obj id="matrix" ring={[126, 192, 26, 36, 76, 142]}>
        <Bx x={135} y={28} z={78} w={6} d={6} h={20} {...DARK} />
        <Poly pts={[[128, 30, 96], [190, 30, 96], [190, 30, 140], [128, 30, 140]]} fill="#111325" />
        <Poly pts={[[131, 30.5, 99], [187, 30.5, 99], [187, 30.5, 137], [131, 30.5, 137]]} fill="#1b2a4a" />
        {monitorLines.map((l) => (
          <Poly key={l.i} pts={l.pts} fill={l.fill} />
        ))}
      </Obj>
      <Obj id="xchart" ring={[198, 264, 26, 36, 76, 142]}>
        <Bx x={212} y={28} z={78} w={6} d={6} h={20} {...DARK} />
        <Poly pts={[[200, 30, 96], [262, 30, 96], [262, 30, 140], [200, 30, 140]]} fill="#111325" />
        <Poly pts={[[203, 30.5, 99], [259, 30.5, 99], [259, 30.5, 137], [203, 30.5, 137]]} fill="#1d1b3a" />
        <polyline points={chartPoints} fill="none" stroke="#ff9ecb" strokeWidth={2} />
      </Obj>

      {/* coffee mug */}
      <g>
        <Bx x={175} y={55} z={78} w={10} d={10} h={12} top="#f3f1ff" left="#cfcde6" right="#e2e0f5" />
        <path
          className="steam"
          d={`M${steamX.toFixed(2)} ${steamY.toFixed(2)} q-4 -6 0 -12 q4 -6 0 -12`}
          stroke="rgba(255,255,255,.6)"
          fill="none"
          strokeWidth={2}
        />
      </g>

      {/* lamp: the glow sits above the desk and never takes clicks */}
      <circle className="lamp-glow" cx={glowX} cy={glowY} r={60} fill="url(#room-lamp-grad)" pointerEvents="none" />
      <g>
        <Bx x={262} y={40} z={78} w={8} d={8} h={30} top="#ffd27a" left="#c9a25a" right="#e0b86a" />
      </g>

      {/* shelf (left wall) with Query where the mockup has the disc stack */}
      <g>
        <Bx x={0} y={150} z={150} w={26} d={90} h={6} {...WOOD} />
      </g>
      <Obj id="query" ring={[0, 26, 166, 200, 154, 212]}>
        <Query bx={queryX} by={queryY} scale={0.2} />
      </Obj>

      {/* photo frame (left wall) */}
      <Obj id="photo" ring={[0, 1, 194, 238, 158, 202]}>
        <Poly pts={[[0.6, 196, 160], [0.6, 236, 160], [0.6, 236, 200], [0.6, 196, 200]]} fill="#f3f1ff" />
        <g transform={photoMatrix}>
          <g clipPath="url(#room-photo-clip)">
            <rect x="0" y="0" width="34" height="34" fill="#cfcde6" />
            <image href="/images/aman-320.webp" x="0" y="0" width="34" height="34" preserveAspectRatio="xMidYMid slice" />
          </g>
        </g>
      </Obj>

      {/* plant and chair */}
      <g>
        <Bx x={270} y={250} z={0} w={20} d={20} h={22} top="#d27a5a" left="#a95a3e" right="#bd684b" />
        {plantLeaves.map(([a, b]) => (
          <Bx key={a} x={276 + a} y={256 + b} z={22} w={8} d={8} h={26 + Math.abs(a) * 1.5} top="#7bc47f" left="#4f9a55" right="#62ae67" />
        ))}
      </g>
      <g>
        <Bx x={170} y={105} z={38} w={44} d={40} h={6} top="#5d5a8f" left="#45427a" right="#514e86" />
        <Bx x={170} y={141} z={44} w={44} d={6} h={46} top="#5d5a8f" left="#45427a" right="#514e86" />
        <Bx x={188} y={123} z={0} w={8} d={8} h={38} {...DARK} />
      </g>
    </svg>
  );
}
