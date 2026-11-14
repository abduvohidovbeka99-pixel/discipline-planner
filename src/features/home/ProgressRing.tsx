import { progressMessage } from '../../data/milestones';

/** Hero card with the overall progress ring and a motivational phrase. */
export function ProgressRing({ pct }: { pct: number }) {
  const C = 2 * Math.PI * 34;
  return (
    <div className="hero">
      <svg viewBox="0 0 80 80" width="88" height="88" aria-hidden="true">
        <circle cx="40" cy="40" r="34" fill="none" strokeWidth="8" className="ring-bg" />
        <circle
          cx="40"
          cy="40"
          r="34"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - Math.min(pct, 100) / 100)}
          transform="rotate(-90 40 40)"
          className="ring-fg"
        />
        <text x="40" y="46" textAnchor="middle" fontSize="18" fontWeight="700">
          {pct}%
        </text>
      </svg>
      <div>
        <div className="ht">Общий прогресс</div>
        <div className="hs">{progressMessage(pct)}</div>
      </div>
    </div>
  );
}
