import { forwardRef, useId, type CSSProperties, type ReactNode } from 'react';
import { FIGURES, type EqShape, type FigureDef, type Joint, type Pose, type Pt } from '../../data/exercises';
import { seg, shift } from './figureGeometry';
import { effortAt, repFrames, type Frame } from './motion';

/**
 * "Illustrated" exercise figure: the same pose data as the stick figure, drawn
 * as a fitness-poster athlete — muscular build with outlines, beard and long
 * hair, dark shorts with a teal stripe, sneakers, metal dumbbells and an orange
 * motion arrow. Motion is sampled by `motion.ts` (bone rotation, holds,
 * easing) and played back as linear SMIL keyframes.
 */

type V = [number, number];
type PathOf = (p: Pose) => string;

const r2 = (n: number) => Math.round(n * 100) / 100;
const pt = (p: Pose, j: Joint): V => [...(p[j] ?? [0, 0])] as V;
const lerp = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const line = (a: V, b: V) => `M${r2(a[0])} ${r2(a[1])}L${r2(b[0])} ${r2(b[1])}`;
const P = (v: V) => `${r2(v[0])} ${r2(v[1])}`;
const norm = (v: V): V => {
  const l = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / l, v[1] / l];
};
const perp = (a: V, b: V): V => {
  const d = norm([b[0] - a[0], b[1] - a[1]]);
  return [-d[1], d[0]];
};
const add = (a: V, b: V, k = 1): V => [a[0] + b[0] * k, a[1] + b[1] * k];

/* ------------------------------------------------------------------ */
/* Animation primitives                                                */
/* ------------------------------------------------------------------ */

interface Ctx {
  dur: number;
  frames: Frame[];
}

const keyTimes = (ctx: Ctx) => ctx.frames.map((f) => r2(f.t * 1000) / 1000).join(';');

/** Linear keyframe animation built from sampled frames. */
function Keyframes({ ctx, attr, values, type }: { ctx: Ctx; attr: string; values: string[]; type?: 'translate' | 'rotate' }) {
  if (values.every((v) => v === values[0])) return null;
  const common = { values: values.join(';'), keyTimes: keyTimes(ctx), dur: ctx.dur + 's', repeatCount: 'indefinite', calcMode: 'linear' as const };
  return type ? <animateTransform attributeName="transform" type={type} {...common} /> : <animate attributeName={attr} {...common} />;
}

/** Path whose geometry follows the pose. */
function APath({ ctx, f, className, style }: { ctx: Ctx; f: PathOf; className: string; style?: CSSProperties }) {
  const values = ctx.frames.map((fr) => f(fr.pose));
  return (
    <path className={className} d={values[0]} style={style}>
      <Keyframes ctx={ctx} attr="d" values={values} />
    </path>
  );
}

/** Group moved to a joint and rotated by `rot` degrees (head, hands, feet). */
function AGroup({ ctx, at, rot, children }: { ctx: Ctx; at: (p: Pose) => V; rot?: (p: Pose) => number; children: ReactNode }) {
  const tr = ctx.frames.map((fr) => P(at(fr.pose)));
  // unwrap the angle so the head never spins the long way round
  const angles: number[] = [];
  if (rot)
    ctx.frames.forEach((fr, i) => {
      let a = rot(fr.pose);
      if (i) {
        while (a - angles[i - 1] > 180) a -= 360;
        while (angles[i - 1] - a > 180) a += 360;
      }
      angles.push(a);
    });
  const rv = angles.map((a) => String(r2(a)));
  return (
    <g transform={`translate(${tr[0]})`}>
      <Keyframes ctx={ctx} attr="transform" type="translate" values={tr} />
      <g transform={rot ? `rotate(${rv[0]})` : undefined}>
        {rot && <Keyframes ctx={ctx} attr="transform" type="rotate" values={rv} />}
        {children}
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Body parts                                                          */
/* ------------------------------------------------------------------ */

/** A stroke between two points along a bone (fractions), with width. */
interface Seg {
  a: Joint;
  b: Joint;
  from?: number;
  to?: number;
  w: number;
}

const OUTLINE = 4;

/** Muscular arm: deltoid cap, biceps bulge, forearm bulge. */
const ARM: Seg[] = [
  { a: 'S', b: 'E', w: 15 },
  { a: 'S', b: 'E', from: 0.28, to: 0.68, w: 19 },
  { a: 'E', b: 'W', w: 11.5 },
  { a: 'E', b: 'W', from: 0.08, to: 0.45, w: 14.5 },
  { a: 'S', b: 'E', from: 0, to: 0.12, w: 22 },
];
/** Heavy legs: quads and calves. */
const LEG: Seg[] = [
  { a: 'H', b: 'K', w: 22 },
  { a: 'H', b: 'K', from: 0.25, to: 0.7, w: 25 },
  { a: 'K', b: 'F', w: 13 },
  { a: 'K', b: 'F', from: 0.12, to: 0.45, w: 17 },
];

const segPath = (s: Seg): PathOf => (p) => {
  const a = pt(p, s.a);
  const b = pt(p, s.b);
  return line(lerp(a, b, s.from ?? 0), lerp(a, b, s.to ?? 1));
};

/** Outlined limb: all outlines first, then all skin passes (clean silhouette). */
function Limb({ ctx, segs, far }: { ctx: Ctx; segs: Seg[]; far?: boolean }) {
  return (
    <g className={far ? 'il-far' : undefined}>
      {segs.map((s, i) => (
        <APath key={'o' + i} ctx={ctx} className="il-ol" style={{ strokeWidth: s.w + OUTLINE }} f={segPath(s)} />
      ))}
      {segs.map((s, i) => (
        <APath key={'s' + i} ctx={ctx} className="il-skin" style={{ strokeWidth: s.w }} f={segPath(s)} />
      ))}
    </g>
  );
}

/** Muscle definition on the near arm: deltoid split and biceps line. */
function ArmLines({ ctx }: { ctx: Ctx }) {
  const f: PathOf = (p) => {
    const s = pt(p, 'S');
    const e = pt(p, 'E');
    const w = pt(p, 'W');
    const n = perp(s, e);
    const n2 = perp(e, w);
    const delt = `M${P(add(lerp(s, e, 0.05), n, -9))}Q${P(add(lerp(s, e, 0.22), n, -2))} ${P(add(lerp(s, e, 0.16), n, 8))}`;
    const bi = line(add(lerp(s, e, 0.32), n, 4.5), add(lerp(s, e, 0.78), n, 4));
    const fore = line(add(lerp(e, w, 0.12), n2, 3), add(lerp(e, w, 0.55), n2, 2));
    return delt + bi + fore;
  };
  return <APath ctx={ctx} className="il-mline" f={f} />;
}

/** Quad and calf lines on the near leg. */
function LegLines({ ctx }: { ctx: Ctx }) {
  const f: PathOf = (p) => {
    const k = pt(p, 'K');
    const ft = pt(p, 'F');
    const n = perp(k, ft);
    return line(add(lerp(k, ft, 0.15), n, -4), add(lerp(k, ft, 0.5), n, -3));
  };
  return <APath ctx={ctx} className="il-mline" f={f} />;
}

/** Shorts on a thigh (+ teal side stripe). */
function ShortsLeg({ ctx, far }: { ctx: Ctx; far?: boolean }) {
  const thigh: PathOf = (p) => line(pt(p, 'H'), lerp(pt(p, 'H'), pt(p, 'K'), 0.5));
  const stripe: PathOf = (p) => {
    const h = pt(p, 'H');
    const k = pt(p, 'K');
    const n = perp(h, k);
    return line(add(lerp(h, k, 0.05), n, 7.5), add(lerp(h, k, 0.46), n, 7.5));
  };
  return (
    <g className={far ? 'il-far' : undefined}>
      <APath ctx={ctx} className="il-ol" style={{ strokeWidth: 30 }} f={thigh} />
      <APath ctx={ctx} className="il-shorts" style={{ strokeWidth: 26 }} f={thigh} />
      {!far && <APath ctx={ctx} className="il-stripe" f={stripe} />}
    </g>
  );
}

function Shoe({ ctx, dir, far }: { ctx: Ctx; dir: number; far?: boolean }) {
  return (
    <AGroup ctx={ctx} at={(p) => pt(p, 'F')}>
      <path className={'il-shoe' + (far ? ' il-shoe-far' : '')} d={`M${-4 * dir} 1L${10 * dir} 3`} />
      <path className="il-sole" d={`M${-6 * dir} 6.5L${12 * dir} 6.5`} />
    </AGroup>
  );
}

/**
 * Torso as a filled silhouette with a broad chest and traps. In all pose data
 * the chest faces `-perp(S→H)`.
 */
function Torso({ ctx }: { ctx: Ctx }) {
  const frame = (p: Pose) => {
    const S = pt(p, 'S');
    const H = pt(p, 'H');
    const d = norm([H[0] - S[0], H[1] - S[1]]);
    const back = perp(S, H);
    const front: V = [-back[0], -back[1]];
    const at = (t: number, side: V, k: number) => add(lerp(S, H, t), side, k);
    return { S, H, d, back, front, at };
  };
  const body: PathOf = (p) => {
    const { S, H, d, back, front, at } = frame(p);
    const b0 = add(add(S, back, 14), d, -2);
    const b1 = at(0.55, back, 12);
    const b2 = add(H, back, 13);
    const f2 = add(H, front, 12.5);
    const f1 = at(0.6, front, 14);
    const f0 = at(0.22, front, 20.5);
    const top = add(S, front, 10);
    return (
      `M${P(b0)}Q${P(at(0.3, back, 16))} ${P(b1)}Q${P(at(0.85, back, 11.5))} ${P(b2)}` +
      `Q${P(add(H, d, 11))} ${P(f2)}Q${P(at(0.82, front, 12.5))} ${P(f1)}Q${P(at(0.4, front, 21))} ${P(f0)}` +
      `Q${P(add(S, front, 19))} ${P(top)}Q${P(add(S, d, -15))} ${P(b0)}Z`
    );
  };
  const lines: PathOf = (p) => {
    const { front, at } = frame(p);
    const pec = `M${P(at(0.4, front, 17))}Q${P(at(0.44, front, 8))} ${P(at(0.3, front, 2))}`;
    const ab = (t: number) => `M${P(at(t, front, 13))}Q${P(at(t + 0.02, front, 10))} ${P(at(t, front, 7))}`;
    const lat = `M${P(at(0.25, front, -2))}Q${P(at(0.45, front, -6))} ${P(at(0.62, front, -10))}`;
    return pec + ab(0.54) + ab(0.65) + ab(0.76) + lat;
  };
  const shine: PathOf = (p) => {
    const { back, at } = frame(p);
    return line(at(0.14, back, 8), at(0.58, back, 7));
  };
  const hips: PathOf = (p) => line(lerp(pt(p, 'S'), pt(p, 'H'), 0.8), pt(p, 'H'));
  return (
    <>
      <APath ctx={ctx} className="il-torso" f={body} />
      <APath ctx={ctx} className="il-hl" f={shine} />
      <APath ctx={ctx} className="il-abs" f={lines} />
      <APath ctx={ctx} className="il-ol" style={{ strokeWidth: 31 }} f={hips} />
      <APath ctx={ctx} className="il-shorts" style={{ strokeWidth: 27 }} f={hips} />
    </>
  );
}

/*
 * Head drawn in local coordinates: facing +x, "up" is -y.
 * Long hair parted on top: one side falls back to the nape, the other forms a
 * fringe over the forehead. Full beard (no moustache), profile nose, brow.
 */
const HAIR =
  'M-10.2 13.2C-14.4 4-13.4-10.4-2-14.8C6.2-17 12.8-12.4 13.2-5.4C10.8-7.6 7.2-8.7 3.6-8.6C-1-8.5-4.6-6.9-6-3.4C-7.2 0-7 6.2-5.8 12.6C-7.3 13.8-8.9 13.9-10.2 13.2Z';
const HAIR_STRANDS = 'M-1.8-14.6C-7.2-12.6-10.8-6.6-10.8 3.5M-1.8-14.6C3.8-15.2 9.6-12 12-6.4M-5-12.8C-9-8.6-9.6-1.5-8.6 9M2.6-14.6C7-13.4 10.4-10.4 11.6-6.8';
const BEARD = 'M-3.4 5C-1.2 8.8 3.2 10.2 7.2 8.8C9.6 7.9 10.9 5.6 11.3 3C11.9 7 11 11 7.4 13.2C3.4 15.4-2 14.4-4.6 10.8C-5.4 9.2-5.2 7-3.4 5Z';

/** `mirror` flips the face to the other side; `tilt` adds a constant rotation (chin up). */
function Head({ ctx, mirror, tilt = 0 }: { ctx: Ctx; mirror: boolean; tilt?: number }) {
  // Head "up" follows the neck direction (S → D).
  const rot = (p: Pose) => {
    const s = pt(p, 'S');
    const d = pt(p, 'D');
    return (Math.atan2(d[1] - s[1], d[0] - s[0]) * 180) / Math.PI + 90 + tilt;
  };
  const neck: PathOf = (p) => line(pt(p, 'S'), lerp(pt(p, 'S'), pt(p, 'D'), 0.62));
  return (
    <>
      <APath ctx={ctx} className="il-ol" style={{ strokeWidth: 18 }} f={neck} />
      <APath ctx={ctx} className="il-skin" style={{ strokeWidth: 14 }} f={neck} />
      <AGroup ctx={ctx} at={(p) => pt(p, 'D')} rot={rot}>
        <g transform={mirror ? 'scale(-1 1)' : undefined}>
          <g transform="scale(1.06)">
            <path className="il-nose" d="M10.6-2.2L13.6 2.4L10.8 3.2" />
            <ellipse className="il-headc" cx="0.5" cy="0" rx="10.8" ry="12.4" />
            <path className="il-beard" d={BEARD} />
            <path className="il-brow" d="M6.2-3.4L11-2.6" />
            <ellipse className="il-eye" cx="8.6" cy="-0.6" rx="0.9" ry="1.1" />
            <path className="il-hair" d={HAIR} />
            <path className="il-strand" d={HAIR_STRANDS} />
            <ellipse className="il-ear" cx="-2.8" cy="1.5" rx="2.3" ry="3.1" />
          </g>
        </g>
      </AGroup>
    </>
  );
}

function Hand({ ctx, far, weight, r }: { ctx: Ctx; far?: boolean; weight?: boolean; r: number }) {
  return (
    <AGroup ctx={ctx} at={(p) => pt(p, 'W')}>
      {weight ? (
        <g className={far ? 'il-db il-db-far' : 'il-db'}>
          <circle r={r + 3.5} className="il-plate" />
          <circle r={r} className="il-plate2" />
          <circle r={2.6} className="il-hub" />
        </g>
      ) : (
        <circle r={6.5} className={'il-hand' + (far ? ' il-far-fill' : '')} />
      )}
    </AGroup>
  );
}

function Equipment({ shapes }: { shapes: EqShape[] }) {
  return (
    <>
      {shapes.map((s, i) => {
        switch (s.t) {
          case 'ellipse':
            return <ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} className="il-shadow" />;
          case 'rect':
            return <rect key={i} className="il-mat" x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} />;
          case 'path':
            return <path key={i} className={s.cls === 'bn' ? 'il-bench' : 'il-metal'} d={s.d} style={s.sw ? { strokeWidth: s.sw } : undefined} />;
        }
      })}
    </>
  );
}

/** Orange curved arrow showing the direction of the first phase. */
function MotionArrow({ d }: { d: FigureDef }) {
  let best: Joint = 'W';
  let len = 0;
  for (const j of ['W', 'D', 'F', 'K'] as Joint[]) {
    if (!d.A[j] || !d.B[j]) continue;
    const l = Math.hypot(pt(d.B, j)[0] - pt(d.A, j)[0], pt(d.B, j)[1] - pt(d.A, j)[1]);
    if (l > len) {
      len = l;
      best = j;
    }
  }
  if (len < 14) return null;
  const a = pt(d.A, best);
  const b = pt(d.B, best);
  // Default: the side away from the hips; flip it if the arrow would cover the head.
  const h = pt(d.A, 'H');
  const heads = [pt(d.A, 'D'), pt(d.B, 'D')];
  let n = perp(a, b);
  const mid = lerp(a, b, 0.5);
  const fromHip = (k: number) => {
    const q = add(mid, n, k);
    return Math.hypot(q[0] - h[0], q[1] - h[1]);
  };
  if (fromHip(20) < fromHip(-20)) n = [-n[0], -n[1]];
  const hitsHead = [0.2, 0.5, 0.8].some((t) => {
    const q = add(add(lerp(a, b, t), n, 22), n, t === 0.5 ? 14 : 4);
    return heads.some((o) => Math.hypot(q[0] - o[0], q[1] - o[1]) < 16);
  });
  if (hitsHead) n = [-n[0], -n[1]];
  if (d.arrowFlip) n = [-n[0], -n[1]];
  const off = 22;
  const from = add(lerp(a, b, 0.12), n, off);
  const to = add(lerp(a, b, 0.88), n, off);
  const ctrl = add(mid, n, off + 14);
  const t = norm([to[0] - ctrl[0], to[1] - ctrl[1]]);
  const tn: V = [-t[1], t[0]];
  const tip = add(to, t, 6);
  const head = `M${P(tip)}L${P(add(add(to, t, -6), tn, 6.5))}L${P(add(add(to, t, -6), tn, -6.5))}Z`;
  return (
    <g className="il-arrow">
      <path d={`M${P(from)}Q${P(ctrl)} ${P(to)}`} />
      <path className="il-arrow-head" d={head} />
    </g>
  );
}

/* ------------------------------------------------------------------ */

interface Props {
  name: string;
  dur?: number;
}

export const ExerciseIllustration = forwardRef<SVGSVGElement, Props>(function ExerciseIllustration({ name, dur = 2.4 }, ref) {
  const uid = useId().replace(/:/g, '');
  const d = FIGURES[name];
  const glId = 'ilg' + uid;
  const frames = repFrames(d.A, d.B, d.M, d.planar);
  const near: Ctx = { dur, frames };
  const shifted = (o: Pt): Ctx => ({ dur, frames: frames.map((f) => ({ t: f.t, pose: shift(f.pose, o) })) });
  const farArm = d.fa
    ? { dur, frames: frames.map((f) => ({ t: f.t, pose: { S: d.fa![0], E: d.fa![1], W: d.fa![2] } as Pose })) }
    : shifted(d.fo);
  const farLeg = shifted(d.fl);
  const s = pt(d.A, 'S');
  const dh = pt(d.A, 'D');
  // The chest faces -perp(S→H) in all pose data; the face looks the same way.
  const hip = pt(d.A, 'H');
  const td = norm([hip[0] - s[0], hip[1] - s[1]]);
  const front: V = [td[1], -td[0]];
  const up = norm([dh[0] - s[0], dh[1] - s[1]]);
  const mirror = -up[1] * front[0] + up[0] * front[1] < 0;
  const tilt = d.chinUp ? (mirror ? d.chinUp : -d.chinUp) : 0;
  // Toes point forward when upright, away from the head when lying down.
  const upright = Math.abs(td[1]) > 0.7;
  const dir = upright ? (front[0] < 0 ? -1 : 1) : hip[0] - s[0] < 0 ? -1 : 1;
  const wr = d.wr ?? 8;
  const kt = keyTimes(near);

  const body = (
    <>
      <Equipment shapes={d.eq} />
      {/* far side */}
      <Limb ctx={farArm} segs={ARM} far />
      <Hand ctx={farArm} far weight={!!d.fw} r={wr} />
      <Limb ctx={farLeg} segs={LEG} far />
      <ShortsLeg ctx={farLeg} far />
      <Shoe ctx={farLeg} dir={dir} far />
      {/* body */}
      <Torso ctx={near} />
      <Limb ctx={near} segs={LEG} />
      <LegLines ctx={near} />
      <ShortsLeg ctx={near} />
      <Shoe ctx={near} dir={dir} />
      <Head ctx={near} mirror={mirror} tilt={tilt} />
      {d.ex?.map((e, i) => (
        <APath key={i} ctx={near} className="il-cable" f={(p) => line(pt(p, e.joints[0]), pt(p, e.joints[1]))} />
      ))}
      {/* near arm */}
      <Limb ctx={near} segs={ARM} />
      <ArmLines ctx={near} />
      <Hand ctx={near} weight={!!d.wt} r={wr} />
      {/* working muscles */}
      {d.hl.map((h, i) => {
        const f = seg(h[0], h[1], h[2], h[3]);
        const values = frames.map((fr) => f(fr.pose));
        const op = frames.map((fr) => r2(0.06 + 0.5 * effortAt(fr.t, d.m === 'c2')));
        return (
          <path key={i} className="il-glow" filter={`url(#${glId})`} style={{ strokeWidth: h[4] + 2 + 'px' }} d={values[0]}>
            <Keyframes ctx={near} attr="d" values={values} />
            <animate attributeName="opacity" values={op.join(';')} keyTimes={kt} dur={dur + 's'} repeatCount="indefinite" />
          </path>
        );
      })}
      <MotionArrow d={d} />
    </>
  );

  return (
    <svg ref={ref} className="ill" viewBox="0 0 240 170" role="img">
      <defs>
        <filter id={glId} filterUnits="userSpaceOnUse" x="-100" y="-100" width="480" height="400">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>
      {d.sc ? <g transform="translate(31 11) scale(.74)">{body}</g> : body}
      <g className="il-ph">
        {[
          [d.ph[0], '1;0'],
          [d.ph[1], '0;1'],
        ].map(([t, v]) => (
          <text key={v} x="8" y="14">
            {t}
            <animate attributeName="opacity" values={v} keyTimes="0;.5" calcMode="discrete" dur={dur + 's'} repeatCount="indefinite" />
          </text>
        ))}
      </g>
    </svg>
  );
});
