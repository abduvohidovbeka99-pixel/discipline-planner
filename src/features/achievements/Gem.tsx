import { useId } from 'react';
import { RANKS } from '../../data/ranks';

/** Faceted gem in the colours of a rank (1..7). `locked` renders it grey. */
export function Gem({ rank, size = 48, locked = false }: { rank: number; size?: number; locked?: boolean }) {
  const id = 'gem' + useId().replace(/:/g, '');
  const r = RANKS[Math.max(0, rank - 1)];
  return (
    <svg className={'gem' + (locked ? ' locked' : '')} viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={r.c1} />
          <stop offset="1" stopColor={r.c2} />
        </linearGradient>
      </defs>
      <path d="M10 23L22 9h20l12 14L32 57z" fill={`url(#${id})`} />
      <path d="M22 9h20l-5 14H27z" fill="#fff" opacity=".35" />
      <path d="M10 23h44M22 9l5 14 5 34 5-34 5-14" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 23L22 9h20l12 14L32 57z" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="1.2" strokeLinejoin="round" />
      {rank === RANKS.length && !locked && (
        <path d="M51 6l1.4 3.6L56 11l-3.6 1.4L51 16l-1.4-3.6L46 11l3.6-1.4z" fill="#fff" />
      )}
    </svg>
  );
}
