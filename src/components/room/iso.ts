export type Pt3 = [number, number, number];
export type Box = { x: number; y: number; z: number; w: number; d: number; h: number };

const C = Math.cos(Math.PI / 6);

/** Isometric projection: x runs down-right, y runs down-left, z runs up. */
export function iso(x: number, y: number, z: number): [number, number] {
  return [(x - y) * C, (x + y) * 0.5 - z];
}

/** The three faces of a box that face the viewer. x,y = floor corner, z = base height. */
export function boxFaces(b: Box): { left: Pt3[]; right: Pt3[]; top: Pt3[] } {
  const { x, y, z, w, d, h } = b;
  return {
    left: [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]],
    right: [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]],
    top: [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]],
  };
}

/** SVG `points` value for a face, projected and rounded to 2 decimals ("x,y x,y ..."). */
export function toPoints(face: Pt3[]): string {
  const r = (n: number) => String(Math.round(n * 100) / 100 + 0);
  return face.map((p) => iso(p[0], p[1], p[2]).map(r).join(",")).join(" ");
}
