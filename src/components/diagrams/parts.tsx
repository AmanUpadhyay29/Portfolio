import type { ReactNode } from "react";
import "./diagrams.css";
import { boxFaces, iso, toPoints } from "../room/iso";
import type { Pt3 } from "../room/iso";

const C = Math.cos(Math.PI / 6);
const r2 = (n: number) => Math.round(n * 100) / 100;

/** A filled face in local iso coordinates. */
export function Face({ pts, fill }: { pts: Pt3[]; fill: string }) {
  return <polygon points={toPoints(pts)} style={{ fill }} />;
}

/** A box at the local origin, coloured by the theme (or by explicit colours). */
export function Box3({
  w,
  d,
  h,
  z = 0,
  x = 0,
  y = 0,
  top = "var(--dg-top)",
  left = "var(--dg-left)",
  right = "var(--dg-right)",
}: {
  w: number;
  d: number;
  h: number;
  x?: number;
  y?: number;
  z?: number;
  top?: string;
  left?: string;
  right?: string;
}) {
  const f = boxFaces({ x, y, z, w, d, h });
  return (
    <>
      <Face pts={f.left} fill={left} />
      <Face pts={f.right} fill={right} />
      <Face pts={f.top} fill={top} />
    </>
  );
}

/** A rectangle on the box's left face (the plane y = d), from a0..a1 along x and z0..z1 up. */
export const leftFace = (d: number, a0: number, a1: number, z0: number, z1: number): Pt3[] => [
  [a0, d + 0.2, z0],
  [a1, d + 0.2, z0],
  [a1, d + 0.2, z1],
  [a0, d + 0.2, z1],
];

/** A rectangle on the box's right face (the plane x = w), from a0..a1 along y and z0..z1 up. */
export const rightFace = (w: number, a0: number, a1: number, z0: number, z1: number): Pt3[] => [
  [w + 0.2, a0, z0],
  [w + 0.2, a1, z0],
  [w + 0.2, a1, z1],
  [w + 0.2, a0, z1],
];

/** Screen point of a local iso point. */
export const pt = (x: number, y: number, z: number) => iso(x, y, z).map(r2) as [number, number];

/**
 * Places a w-by-d footprint so it is centred on screen x `cx` and its front corner sits on `baseY`.
 * Draws a floor tile under it. Children are drawn in local iso coordinates.
 */
export function Node({ cx, baseY, w, d, children }: { cx: number; baseY: number; w: number; d: number; children: ReactNode }) {
  const tx = r2(cx - ((w - d) * C) / 2);
  const ty = r2(baseY - (w + d) / 2);
  const pad = 6;
  const floor: Pt3[] = [
    [-pad, -pad, 0],
    [w + pad, -pad, 0],
    [w + pad, d + pad, 0],
    [-pad, d + pad, 0],
  ];
  return (
    <g transform={`translate(${tx} ${ty})`}>
      <Face pts={floor} fill="var(--dg-floor)" />
      {children}
    </g>
  );
}

/** An upright cylinder (a database), centred on screen x `cx`, its base centre at `baseY`. */
export function Cylinder({ cx, baseY, r, h, bands = [] }: { cx: number; baseY: number; r: number; h: number; bands?: number[] }) {
  const rx = r2(r * Math.sqrt(1.5));
  const ry = r2(r / Math.SQRT2);
  const top = baseY - h;
  return (
    <g>
      <ellipse cx={cx} cy={baseY + 4} rx={rx + 6} ry={ry + 4} style={{ fill: "var(--dg-floor)" }} />
      <path
        d={`M${cx - rx},${top} L${cx - rx},${baseY} A${rx},${ry} 0 0 0 ${cx + rx},${baseY} L${cx + rx},${top} Z`}
        style={{ fill: "var(--dg-right)" }}
      />
      <path d={`M${cx - rx},${top} L${cx - rx},${baseY} A${rx},${ry} 0 0 0 ${cx},${r2(baseY + ry)} L${cx},${top} Z`} style={{ fill: "var(--dg-left)" }} />
      {bands.map((z) => (
        <path
          key={z}
          d={`M${cx - rx},${baseY - z} A${rx},${ry} 0 0 0 ${cx + rx},${baseY - z}`}
          style={{ fill: "none", stroke: "var(--status)", strokeWidth: 2.5 }}
        />
      ))}
      <ellipse cx={cx} cy={top} rx={rx} ry={ry} style={{ fill: "var(--dg-top)" }} />
    </g>
  );
}

/** A title and up to two sub-lines, centred on x. */
export function Label({ x, y, title, sub = [], anchor = "middle" }: { x: number; y: number; title: string; sub?: string[]; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} textAnchor={anchor}>
      <tspan className="t" x={x}>
        {title}
      </tspan>
      {sub.map((s) => (
        <tspan key={s} className="s" x={x} dy={17}>
          {s}
        </tspan>
      ))}
    </text>
  );
}

/** A flow line from a to b with an arrowhead at b (and at a too, if `both`). */
export function Flow({ id, from, to, both = false }: { id: string; from: [number, number]; to: [number, number]; both?: boolean }) {
  return (
    <line
      className="flow"
      x1={from[0]}
      y1={from[1]}
      x2={to[0]}
      y2={to[1]}
      markerEnd={`url(#${id}-head)`}
      markerStart={both ? `url(#${id}-tail)` : undefined}
    />
  );
}

/** A small caption beside a flow line. */
export function FlowLabel({ x, y, text, anchor = "middle" }: { x: number; y: number; text: string; anchor?: "start" | "middle" | "end" }) {
  return (
    <text className="a" x={x} y={y} textAnchor={anchor}>
      {text}
    </text>
  );
}

/**
 * The frame every diagram uses: a scaling SVG with role="img", a <title> and a <desc> that
 * say the whole flow in words, and the arrowhead markers. The caption is real text under it.
 */
export function DiagramFrame({
  id,
  title,
  desc,
  width,
  height,
  maxWidth,
  caption,
  children,
}: {
  id: string;
  title: string;
  desc: string;
  width: number;
  height: number;
  maxWidth: number;
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="my-10">
      <svg
        className="dg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
        style={{ maxWidth }}
      >
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>{desc}</desc>
        <defs>
          <marker id={`${id}-head`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" className="head" />
          </marker>
          <marker id={`${id}-tail`} viewBox="0 0 10 10" refX="2" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="head" />
          </marker>
        </defs>
        {children}
      </svg>
      <figcaption className="mt-3 text-center font-mono text-xs text-muted">{caption}</figcaption>
    </figure>
  );
}
