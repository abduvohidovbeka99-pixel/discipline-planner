import { forwardRef, useId, type CSSProperties, type ReactNode } from 'react';
import { FIGURES, type EqShape, type FigureDef, type Joint, type Pose, type Pt } from '../../data/exercises';
import { seg, shift } from './figureGeometry';

/**
 * "Illustrated" exercise figure: the same pose data as the stick figure, but
 * drawn as a fitness-poster athlete — skin-tone limbs with outlines, muscle
 * lines, dark shorts with a teal stripe, sneakers, hair, metal dumbbells and an
 * orange motion arrow. Every shape is derived from the joints, so all
 * exercises get the new look automatically and keep their SMIL animation.
 */

const EASE2 = '.45 0 .55 1;.45 0 .55 1';
const EASE4 = '.42 0 1 1;0 0 .58 1;.42 0 1 1;0 0 .58 1';

type V = [number, number];
type PathOf = (p: Pose) => string;

const r2 = (n: number) => Math.round(n * 100) / 100;
const pt = (p: Pose, j: Joint): V => [...(p[j] ?? [0, 0])] as V;
const lerp = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const line = (a: V, b: V) => `M${r2(a[0])} ${r2(a[1])}L${r2(b[0])} ${r2(b[1])}`;
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
  A: Pose;
  B: Pose;
  M?: Pose;
}

const valuesOf = (a: string, b: string, m?: string) => (m === undefined ? `${a};${b};${a}` : `${a};${m};${b};${m};${a}`);
const timing = (ctx: Ctx, mid: boolean) => ({
  keyTimes: mid ? '0;.25;.5;.75;1' : '0;.5;1',
  dur: ctx.dur + 's',
  repeatCount: 'indefinite',
  calcMode: 'spline' as const,
  keySplines: mid ? EASE4 : EASE2,
});

/** Path whose geometry follows the pose. */
function APath({ ctx, f, className, style, filter }: { ctx: Ctx; f: PathOf; className: string; style?: CSSProperties; filter?: string }) {
  const a = f(ctx.A);
  const b = f(ctx.B);
  const m = ctx.M && f(ctx.M);
  return (
    <path className={className} d={a} style={style} filter={filter}>
      {a !== b && <animate attributeName="d" values={valuesOf(a, b, m)} {...timing(ctx, !!m)} />}
    </path>
  );
}

/** Group moved to a joint and rotated by `rot` degrees (head, hand, dumbbell). */
function AGroup({ ctx, at, rot, children }: { ctx: Ctx; at: (p: Pose) => V; rot?: (p: Pose) => number; children: ReactNode }) {
  const tr = (p: Pose) => `${r2(at(p)[0])} ${r2(at(p)[1])}`;
  const a = tr(ctx.A);
  const b = tr(ctx.B);
  const m = ctx.M && tr(ctx.M);
  const ra = rot ? r2(rot(ctx.A)) : 0;
  let rb = rot ? r2(rot(ctx.B)) : 0;
  let rm = rot && ctx.M ? r2(rot(ctx.M)) : undefined;
  // avoid spinning the long way round
  if (rb - ra > 180) rb -= 360;
  if (ra - rb > 180) rb += 360;
  if (rm !== undefined) {
    if (rm - ra > 180) rm -= 360;
    if (ra - rm > 180) rm += 360;
  }
  return (
    <g transform={`translate(${a})`}>
      {a !== b && <animateTransform attributeName="transform" type="translate" values={valuesOf(a, b, m)} {...timing(ctx, !!m)} />}
      <g transform={`rotate(${ra})`}>
        {rot && ra !== rb && (
          <animateTransform attributeName="transform" type="rotate" values={valuesOf(String(ra), String(rb), rm === undefined ? undefined : String(rm))} {...timing(ctx, !!m)} />
        )}
        {children}
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Body parts                                                          */
/* ------------------------------------------------------------------ */

interface Seg {
  a: Joint;
  b: Joint;
  w: number;
}

const ARM: Seg[] = [
  { a: 'S', b: 'E', w: 15 },
  { a: 'E', b: 'W', w: 11 },
];
const LEG: Seg[] = [
  { a: 'H', b: 'K', w: 21 },
  { a: 'K', b: 'F', w: 14 },
];

/** Outlined tapered limb: dark outline pass, then skin pass. */
function Limb({ ctx, segs, far }: { ctx: Ctx; segs: Seg[]; far?: boolean }) {
  return (
    <g className={far ? 'il-far' : undefined}>
      {segs.map((s) => (
        <APath key={'o' + s.a + s.b} ctx={ctx} className="il-ol" style={{ strokeWidth: s.w + 3.5 }} f={(p) => line(pt(p, s.a), pt(p, s.b))} />
      ))}
      {segs.map((s) => (
        <APath key={'s' + s.a + s.b} ctx={ctx} className="il-skin" style={{ strokeWidth: s.w }} f={(p) => line(pt(p, s.a), pt(p, s.b))} />
      ))}
    </g>
  );
}

/** Muscle definition lines on the upper arm and forearm. */
function ArmLines({ ctx }: { ctx: Ctx }) {
  const biceps: PathOf = (p) => {
    const s = pt(p, 'S');
    const e = pt(p, 'E');
    const n = perp(s, e);
    return line(add(lerp(s, e, 0.3), n, 3.2), add(lerp(s, e, 0.82), n, 3.2));
  };
  return <APath ctx={ctx} className="il-mline" f={biceps} />;
}

/** Shorts on a thigh (+ teal side stripe). */
function ShortsLeg({ ctx, far }: { ctx: Ctx; far?: boolean }) {
  const thigh: PathOf = (p) => line(pt(p, 'H'), lerp(pt(p, 'H'), pt(p, 'K'), 0.48));
  const stripe: PathOf = (p) => {
    const h = pt(p, 'H');
    const k = pt(p, 'K');
    const n = perp(h, k);
    return line(add(lerp(h, k, 0.05), n, 6.5), add(lerp(h, k, 0.45), n, 6.5));
  };
  return (
    <g className={far ? 'il-far' : undefined}>
      <APath ctx={ctx} className="il-ol" style={{ strokeWidth: 26.5 }} f={thigh} />
      <APath ctx={ctx} className="il-shorts" style={{ strokeWidth: 23 }} f={thigh} />
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
 * Torso as a filled silhouette. In all pose data the chest faces
 * `-perp(S→H)`, so we can shape a chest/abs profile on the front side.
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
    const P = (v: V) => `${r2(v[0])} ${r2(v[1])}`;
    const b0 = add(S, back, 13);
    const b1 = at(0.55, back, 11);
    const b2 = add(H, back, 12.5);
    const f2 = add(H, front, 12);
    const f1 = at(0.58, front, 13.5);
    const f0 = at(0.2, front, 18);
    const top = add(S, front, 9);
    return (
      `M${P(b0)}Q${P(at(0.3, back, 14))} ${P(b1)}Q${P(at(0.85, back, 11))} ${P(b2)}` +
      `Q${P(add(H, d, 11))} ${P(f2)}Q${P(at(0.8, front, 12))} ${P(f1)}Q${P(at(0.38, front, 18.5))} ${P(f0)}` +
      `Q${P(add(S, front, 16))} ${P(top)}Q${P(add(S, d, -12))} ${P(b0)}Z`
    );
  };
  const lines: PathOf = (p) => {
    const { front, at } = frame(p);
    const P = (v: V) => `${r2(v[0])} ${r2(v[1])}`;
    // pec line + three side ab notches
    const pec = `M${P(at(0.36, front, 15))}Q${P(at(0.4, front, 8))} ${P(at(0.3, front, 3))}`;
    const ab = (t: number) => `M${P(at(t, front, 12.5))}L${P(at(t, front, 7.5))}`;
    return pec + ab(0.5) + ab(0.62) + ab(0.74);
  };
  const shine: PathOf = (p) => {
    const { back, at } = frame(p);
    return line(at(0.15, back, 7), at(0.6, back, 6));
  };
  const hips: PathOf = (p) => line(lerp(pt(p, 'S'), pt(p, 'H'), 0.8), pt(p, 'H'));
  return (
    <>
      <APath ctx={ctx} className="il-torso" f={body} />
      <APath ctx={ctx} className="il-hl" f={shine} />
      <APath ctx={ctx} className="il-abs" f={lines} />
      <APath ctx={ctx} className="il-ol" style={{ strokeWidth: 30 }} f={hips} />
      <APath ctx={ctx} className="il-shorts" style={{ strokeWidth: 26.5 }} f={hips} />
    </>
  );
}

function Head({ ctx, dir }: { ctx: Ctx; dir: number }) {
  // Head "up" follows the neck direction (S → D).
  const rot = (p: Pose) => {
    const s = pt(p, 'S');
    const d = pt(p, 'D');
    return (Math.atan2(d[1] - s[1], d[0] - s[0]) * 180) / Math.PI + 90;
  };
  return (
    <>
      <APath ctx={ctx} className="il-ol" style={{ strokeWidth: 14.5 }} f={(p) => line(pt(p, 'S'), lerp(pt(p, 'S'), pt(p, 'D'), 0.6))} />
      <APath ctx={ctx} className="il-skin" style={{ strokeWidth: 11 }} f={(p) => line(pt(p, 'S'), lerp(pt(p, 'S'), pt(p, 'D'), 0.6))} />
      <AGroup ctx={ctx} at={(p) => pt(p, 'D')} rot={rot}>
        <g transform={dir < 0 ? 'scale(-1 1)' : undefined}>
          <ellipse className="il-headc" cx="0" cy="0" rx="10.5" ry="12" />
          <path className="il-hair" d="M-10.8 1.5C-12.2-7-7.5-13.2 0.5-13.4C6.5-13.5 10.8-10 11.2-5.5C7.5-8.2 2.5-8.6-1.5-7.2C-5.2-6-6.8-2.8-6.8 1.2C-8.4 0.6-9.6 0.8-10.8 1.5Z" />
          <ellipse className="il-ear" cx="-2.5" cy="1" rx="2.2" ry="3" />
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
          <circle r={r + 3} className="il-plate" />
          <circle r={r - 1} className="il-plate2" />
          <circle r={2.4} className="il-hub" />
        </g>
      ) : (
        <circle r={6} className={'il-hand' + (far ? ' il-far-fill' : '')} />
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
  const cands: Joint[] = ['W', 'D', 'F', 'K'];
  let best: Joint = 'W';
  let dist = 0;
  for (const j of cands) {
    if (!d.A[j] || !d.B[j]) continue;
    const a = pt(d.A, j);
    const b = pt(d.B, j);
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (l > dist) {
      dist = l;
      best = j;
    }
  }
  if (dist < 14) return null;
  const a = pt(d.A, best);
  const b = pt(d.B, best);
  const h = pt(d.A, 'H');
  let n = perp(a, b);
  const mid = lerp(a, b, 0.5);
  const away = (k: number) => {
    const q = add(mid, n, k);
    return Math.hypot(q[0] - h[0], q[1] - h[1]);
  };
  if (away(20) < away(-20)) n = [-n[0], -n[1]];
  const off = 20;
  const from = add(lerp(a, b, 0.12), n, off);
  const to = add(lerp(a, b, 0.88), n, off);
  const ctrl = add(mid, n, off + 14);
  const t = norm([to[0] - ctrl[0], to[1] - ctrl[1]]);
  const tn: V = [-t[1], t[0]];
  const tip = add(to, t, 6);
  const head = `M${r2(tip[0])} ${r2(tip[1])}L${r2(to[0] - t[0] * 6 + tn[0] * 6.5)} ${r2(to[1] - t[1] * 6 + tn[1] * 6.5)}L${r2(to[0] - t[0] * 6 - tn[0] * 6.5)} ${r2(to[1] - t[1] * 6 - tn[1] * 6.5)}Z`;
  return (
    <g className="il-arrow">
      <path d={`M${r2(from[0])} ${r2(from[1])}Q${r2(ctrl[0])} ${r2(ctrl[1])} ${r2(to[0])} ${r2(to[1])}`} />
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
  const near: Ctx = { dur, A: d.A, B: d.B, M: d.M };
  const sh = (o: Pt) => (p?: Pose) => p && shift(p, o);
  const fa = sh(d.fo);
  const fl = sh(d.fl);
  const farArm: Ctx = { dur, A: fa(d.A)!, B: fa(d.B)!, M: fa(d.M) };
  const farLeg: Ctx = { dur, A: fl(d.A)!, B: fl(d.B)!, M: fl(d.M) };
  const s = pt(d.A, 'S');
  const dh = pt(d.A, 'D');
  const dir = Math.abs(dh[0] - s[0]) < 2 ? 1 : Math.sign(dh[0] - s[0]);
  const wr = d.wr ?? 8;
  const staticFarArm: Ctx | null = d.fa ? { dur, A: { S: d.fa[0], E: d.fa[1], W: d.fa[2] }, B: { S: d.fa[0], E: d.fa[1], W: d.fa[2] } } : null;

  const body = (
    <>
      <Equipment shapes={d.eq} />
      {/* far side */}
      <Limb ctx={staticFarArm ?? farArm} segs={ARM} far />
      <Hand ctx={staticFarArm ?? farArm} far weight={!!d.fw} r={wr} />
      <Limb ctx={farLeg} segs={LEG} far />
      <ShortsLeg ctx={farLeg} far />
      <Shoe ctx={farLeg} dir={dir} far />
      {/* body */}
      <Torso ctx={near} />
      <Limb ctx={near} segs={LEG} />
      <ShortsLeg ctx={near} />
      <Shoe ctx={near} dir={dir} />
      <Head ctx={near} dir={dir} />
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
        return (
          <path key={i} className="il-glow" filter={`url(#${glId})`} style={{ strokeWidth: h[4] + 'px' }} d={f(d.A)}>
            <animate attributeName="d" values={valuesOf(f(d.A), f(d.B), d.M && f(d.M))} {...timing(near, !!d.M)} />
            {d.m === 'c2' ? (
              <animate attributeName="opacity" values=".1;.3;.75;.1" keyTimes="0;.5;.8;1" dur={dur + 's'} repeatCount="indefinite" />
            ) : (
              <animate attributeName="opacity" values=".1;.75;.1" keyTimes="0;.5;1" dur={dur + 's'} repeatCount="indefinite" />
            )}
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
