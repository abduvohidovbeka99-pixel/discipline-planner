import type { WeightEntry } from '../../store/types';
import { fmtIsoShort } from '../../lib/dates';

/** Line chart of weight entries with an optional dashed goal line (`wch`). */
export function WeightChart({ w, goal }: { w: WeightEntry[]; goal: number }) {
  const W = 320;
  const H = 160;
  const P = 30;
  const vs = w.map((e) => e.v).concat(goal ? [goal] : []);
  const mn = Math.min(...vs) - 0.6;
  const mx = Math.max(...vs) + 0.6;
  const t = (e: WeightEntry) => new Date(e.d).getTime();
  const t0 = t(w[0]);
  const sp = Math.max(1, t(w[w.length - 1]) - t0);
  const X = (e: WeightEntry) => (w.length > 1 ? P + ((t(e) - t0) / sp) * (W - P - 14) : W / 2);
  const Y = (v: number) => H - P - ((v - mn) / (mx - mn)) * (H - P - 14);

  return (
    <svg className="wc" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="График веса">
      {[0, 0.5, 1].map((f) => {
        const v = mn + (mx - mn) * f;
        const y = Y(v);
        return (
          <g key={f}>
            <line x1={P} x2={W - 6} y1={y} y2={y} />
            <text x="2" y={y + 3}>
              {v.toFixed(1)}
            </text>
          </g>
        );
      })}
      {goal > 0 && <line className="gl" x1={P} x2={W - 6} y1={Y(goal)} y2={Y(goal)} />}
      <path d={'M' + w.map((e) => X(e).toFixed(1) + ' ' + Y(e.v).toFixed(1)).join('L')} />
      {w.map((e) => (
        <circle key={e.d} r="3.5" cx={X(e).toFixed(1)} cy={Y(e.v).toFixed(1)} />
      ))}
      <text x={P} y={H - 8}>
        {fmtIsoShort(w[0].d)}
      </text>
      <text x={W - 6} y={H - 8} textAnchor="end">
        {fmtIsoShort(w[w.length - 1].d)}
      </text>
    </svg>
  );
}
