/**
 * Geometry helpers for stick figures (ported from `lin`, `seg`, `shf`).
 * They return SVG path strings so that the same values can feed both the
 * static `d` attribute and the `<animate values>` keyframes.
 */
import type { Joint, Pose, Pt } from '../../data/exercises';

export type PathFn = (p: Pose) => string;

const pt = (p: Pose, j: Joint): Pt => p[j] ?? [0, 0];

/** Polyline through joints: lin('S','E','W'). */
export const lin =
  (...joints: Joint[]): PathFn =>
  (p) =>
    'M' + joints.map((j) => pt(p, j).join(' ')).join('L');

/** Part of segment j→k between fractions f and g (muscle highlight). */
export const seg =
  (j: Joint, k: Joint, f: number, g: number): PathFn =>
  (p) => {
    const a = pt(p, j);
    const b = pt(p, k);
    const q = (h: number) => [a[0] + (b[0] - a[0]) * h, a[1] + (b[1] - a[1]) * h].join(' ');
    return 'M' + q(f) + 'L' + q(g);
  };

/** Shift all joints by an offset (far-side limbs). */
export const shift = (p: Pose, o: Pt): Pose =>
  Object.fromEntries(Object.entries(p).map(([k, v]) => [k, [v[0] + o[0], v[1] + o[1]]])) as Pose;
