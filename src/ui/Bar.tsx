import type { CSSProperties, ReactNode } from 'react';
/** Thin horizontal progress bar. */
export function Bar({ pct, style }: { pct: number; style?: CSSProperties }) {
  return (
    <span className="bar" style={style} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: pct + '%' }} />
    </span>
  );
}

/** Bar with a "done/total" label on the right. */
export function BarRow({ pct, label }: { pct: number; label: ReactNode }) {
  return (
    <div className="barrow">
      <Bar pct={pct} />
      <b>{label}</b>
    </div>
  );
}
