import { forwardRef, useId, type ReactNode } from 'react';
import { FIGURES, type FigureDef, type Joint, type Pose, type EqShape } from '../../data/exercises';
import { lin, seg, shift, type PathFn } from './figureGeometry';

const EASE2 = '.45 0 .55 1;.45 0 .55 1';
const EASE4 = '.42 0 1 1;0 0 .58 1;.42 0 1 1;0 0 .58 1';

interface AnimCtx {
  dur: number;
  /** Thumbnails: no animation, no filters, no captions. */
  still: boolean;
}

/** A → B → A (or A → M → B → M → A) keyframe animation of one attribute. */
function Anim({ ctx, attr, a, b, m }: { ctx: AnimCtx; attr: string; a: string | number; b: string | number; m?: string | number }) {
  if (ctx.still) return null;
  const withMid = m !== undefined;
  return (
    <animate
      attributeName={attr}
      values={withMid ? `${a};${m};${b};${m};${a}` : `${a};${b};${a}`}
      keyTimes={withMid ? '0;.25;.5;.75;1' : '0;.5;1'}
      dur={ctx.dur + 's'}
      repeatCount="indefinite"
      calcMode="spline"
      keySplines={withMid ? EASE4 : EASE2}
    />
  );
}

/** Animated path for a body part. */
function Part({ ctx, cls, f, A, B, M }: { ctx: AnimCtx; cls: string; f: PathFn; A: Pose; B: Pose; M?: Pose }) {
  return (
    <path className={cls} d={f(A)}>
      <Anim ctx={ctx} attr="d" a={f(A)} b={f(B)} m={M && f(M)} />
    </path>
  );
}

/** Animated circle on a joint (head, dumbbell). */
function Dot({ ctx, cls, r, j, A, B, M }: { ctx: AnimCtx; cls: string; r: number; j: Joint; A: Pose; B: Pose; M?: Pose }) {
  const a = A[j]!;
  const b = B[j]!;
  const m = M?.[j];
  return (
    <circle className={cls} r={r} cx={a[0]} cy={a[1]}>
      <Anim ctx={ctx} attr="cx" a={a[0]} b={b[0]} m={m?.[0]} />
      <Anim ctx={ctx} attr="cy" a={a[1]} b={b[1]} m={m?.[1]} />
    </circle>
  );
}

function Equipment({ shapes }: { shapes: EqShape[] }) {
  return (
    <>
      {shapes.map((s, i) => {
        switch (s.t) {
          case 'ellipse':
            return <ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill="#000" opacity={s.opacity} />;
          case 'rect':
            return <rect key={i} className="mat" x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} />;
          case 'path':
            return <path key={i} className={s.cls} d={s.d} style={s.sw ? { strokeWidth: s.sw } : undefined} />;
        }
      })}
    </>
  );
}

/** Working-muscle glow: pulsing highlighted segment. */
function Glow({ ctx, d, h, filter }: { ctx: AnimCtx; d: FigureDef; h: FigureDef['hl'][number]; filter?: string }) {
  const f = seg(h[0], h[1], h[2], h[3]);
  return (
    <path className="g" filter={filter} style={{ strokeWidth: h[4] + 'px' }} d={f(d.A)}>
      <Anim ctx={ctx} attr="d" a={f(d.A)} b={f(d.B)} m={d.M && f(d.M)} />
      {!ctx.still &&
        (d.m === 'c2' ? (
          <animate attributeName="opacity" values=".15;.4;1;.15" keyTimes="0;.5;.8;1" dur={ctx.dur + 's'} repeatCount="indefinite" />
        ) : (
          <animate attributeName="opacity" values=".15;1;.15" keyTimes="0;.5;1" dur={ctx.dur + 's'} repeatCount="indefinite" />
        ))}
    </path>
  );
}

function Phases({ ph, dur }: { ph: [string, string]; dur: number }) {
  return (
    <g className="ph">
      {[
        [ph[0], '1;0'],
        [ph[1], '0;1'],
      ].map(([t, v]) => (
        <text key={v} x="8" y="14">
          {t}
          <animate attributeName="opacity" values={v} keyTimes="0;.5" calcMode="discrete" dur={dur + 's'} repeatCount="indefinite" />
        </text>
      ))}
    </g>
  );
}

interface Props {
  /** Figure key from FIGURES (e.g. "pushup", "bc"). */
  name: string;
  /** Animation period in seconds. */
  dur?: number;
  /** Static thumbnail for tiles. */
  thumb?: boolean;
}

/**
 * Animated SVG stick figure of an exercise. Animation uses SMIL `<animate>`,
 * so the parent can pause it via `svg.pauseAnimations()` (ref is forwarded).
 */
export const ExerciseFigure = forwardRef<SVGSVGElement, Props>(function ExerciseFigure({ name, dur = 2.4, thumb = false }, ref) {
  const uid = useId().replace(/:/g, '');
  const d = FIGURES[name];
  const ctx: AnimCtx = { dur, still: thumb };
  const dsId = 'ds' + uid;
  const glId = 'gl' + uid;
  const A = d.A;
  const B = d.B;
  const M = d.M;
  const far = (p?: Pose) => p && shift(p, d.fo);
  const farLeg = (p?: Pose) => p && shift(p, d.fl);
  const arm = lin('S', 'E', 'W');
  const leg = lin('H', 'K', 'F');
  const wr = d.wr ?? 8;

  const body: ReactNode = (
    <>
      <Equipment shapes={d.eq} />
      <g filter={thumb ? undefined : `url(#${dsId})`}>
        {d.fa ? (
          <path className="b a f" d={arm({ S: d.fa[0], E: d.fa[1], W: d.fa[2] })} />
        ) : (
          <Part ctx={ctx} cls="b a f" f={arm} A={far(A)!} B={far(B)!} M={far(M)} />
        )}
        <Part ctx={ctx} cls="b l f" f={leg} A={farLeg(A)!} B={farLeg(B)!} M={farLeg(M)} />
        <Part ctx={ctx} cls="b t" f={lin('S', 'H')} A={A} B={B} M={M} />
        <Part ctx={ctx} cls="b l" f={leg} A={A} B={B} M={M} />
        <Dot ctx={ctx} cls="h" r={11} j="D" A={A} B={B} M={M} />
        {d.fw && <Dot ctx={ctx} cls="wt f" r={wr} j="W" A={far(A)!} B={far(B)!} M={far(M)} />}
        {d.ex?.map((e, i) => (
          <Part key={i} ctx={ctx} cls={e.cls} f={lin(...e.joints)} A={A} B={B} M={M} />
        ))}
        <Part ctx={ctx} cls="b a" f={arm} A={A} B={B} M={M} />
        {d.wt && <Dot ctx={ctx} cls="wt" r={wr} j="W" A={A} B={B} M={M} />}
      </g>
      {d.hl.map((h, i) => (
        <Glow key={i} ctx={ctx} d={d} h={h} filter={thumb ? undefined : `url(#${glId})`} />
      ))}
    </>
  );

  const wide = d.glowRegion === 'wide';
  return (
    <svg ref={ref} className={'fg' + (thumb ? ' th' : '')} viewBox="0 0 240 170" aria-hidden={thumb || undefined} role={thumb ? undefined : 'img'}>
      {!thumb && (
        <defs>
          <filter id={dsId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity=".3" />
          </filter>
          <filter
            id={glId}
            filterUnits="userSpaceOnUse"
            x={wide ? -100 : 0}
            y={wide ? -100 : 0}
            width={wide ? 480 : 240}
            height={wide ? 400 : 170}
          >
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>
      )}
      {d.sc ? <g transform="translate(31 11) scale(.74)">{body}</g> : body}
      {!thumb && <Phases ph={d.ph} dur={dur} />}
    </svg>
  );
});
