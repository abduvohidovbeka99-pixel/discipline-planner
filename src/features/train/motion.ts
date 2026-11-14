/**
 * Realistic motion for exercise figures.
 *
 * Instead of letting SMIL move every joint along a straight line (which makes
 * limbs shrink mid-rep), we sample the rep ourselves:
 *  - joints rotate around their parent joint (forward kinematics), so bones
 *    keep their length and hands/feet travel along arcs;
 *  - each rep has short holds at both ends and an ease-in-out tempo;
 *  - the return (second) phase is slightly slower than the first one.
 * The sampled frames become `values`/`keyTimes` of linear SMIL animations.
 */
import type { Joint, Pose, Pt } from '../../data/exercises';

/** Bones as [parent, child], in the order they must be resolved. */
const BONES: [Joint, Joint][] = [
  ['H', 'S'],
  ['S', 'D'],
  ['S', 'E'],
  ['E', 'W'],
  ['H', 'K'],
  ['K', 'F'],
];

const angle = (a: Pt, b: Pt) => Math.atan2(b[1] - a[1], b[0] - a[0]);
const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** Shortest signed angular difference. */
const dAngle = (from: number, to: number) => {
  let d = to - from;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
};

/**
 * Interpolate two poses by rotating bones (lengths are interpolated too).
 * Joints listed in `planar` move in a straight line instead (motion across the
 * viewer, e.g. elbows flaring out in a press, hands fixed on a pull-up bar).
 */
export function blendPose(P: Pose, Q: Pose, u: number, planar: Joint[] = []): Pose {
  if (u <= 0) return P;
  if (u >= 1) return Q;
  const out: Pose = {};
  const lin = (j: Joint) => {
    const a = P[j];
    const b = Q[j];
    if (a && b) out[j] = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  };
  lin('H');
  for (const [par, ch] of BONES) {
    const p0 = P[par];
    const c0 = P[ch];
    const p1 = Q[par];
    const c1 = Q[ch];
    const base = out[par];
    if (!p0 || !c0 || !p1 || !c1 || !base || planar.includes(ch)) {
      lin(ch);
      continue;
    }
    const a = angle(p0, c0) + dAngle(angle(p0, c0), angle(p1, c1)) * u;
    const l = dist(p0, c0) + (dist(p1, c1) - dist(p0, c0)) * u;
    out[ch] = [base[0] + Math.cos(a) * l, base[1] + Math.sin(a) * l];
  }
  // Joints outside the skeleton (cable anchor) move linearly.
  (Object.keys(P) as Joint[]).forEach((j) => {
    if (!out[j]) lin(j);
  });
  return out;
}

/** Smooth ease-in-out (cubic). */
export const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

export interface Frame {
  t: number;
  pose: Pose;
}

/** Rep timeline: hold → move (first phase) → hold → move back (slower) → hold. */
export const TIMELINE = { hold0: 0.04, go: 0.42, hold1: 0.54, back: 0.97 };

const STEPS = 14;

/** One movement A → (M) → B sampled with easing. */
function move(from: Pose, to: Pose, mid: Pose | undefined, t0: number, t1: number, planar: Joint[]): Frame[] {
  const out: Frame[] = [];
  for (let i = 1; i <= STEPS; i++) {
    const k = i / STEPS;
    const u = easeInOut(k);
    const pose = mid
      ? u < 0.5
        ? blendPose(from, mid, u * 2, planar)
        : blendPose(mid, to, (u - 0.5) * 2, planar)
      : blendPose(from, to, u, planar);
    out.push({ t: t0 + (t1 - t0) * k, pose });
  }
  return out;
}

/** All frames of one rep (t in 0..1). */
export function repFrames(A: Pose, B: Pose, M?: Pose, planar: Joint[] = []): Frame[] {
  const { hold0, go, hold1, back } = TIMELINE;
  return [
    { t: 0, pose: A },
    { t: hold0, pose: A },
    ...move(A, B, M, hold0, go, planar),
    { t: hold1, pose: B },
    ...move(B, A, M, hold1, back, planar),
    { t: 1, pose: A },
  ];
}

/** Effort curve 0..1 for the glow on working muscles (peaks at the far end of the rep). */
export const effortAt = (t: number, peakLate: boolean): number => {
  const { hold0, go, hold1, back } = TIMELINE;
  if (t <= hold0) return 0;
  if (t <= go) return peakLate ? Math.pow((t - hold0) / (go - hold0), 2) * 0.6 : (t - hold0) / (go - hold0);
  if (t <= hold1) return peakLate ? 0.6 + 0.4 * ((t - go) / (hold1 - go)) : 1;
  if (t <= back) return 1 - (t - hold1) / (back - hold1);
  return 0;
};
