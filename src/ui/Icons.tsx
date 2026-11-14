import type { ReactNode } from 'react';
import type { AppKey } from '../data/palette';

/* ---------------- Line glyphs used on tiles (`GL`) ---------------- */

const G = ({ children }: { children: ReactNode }) => (
  <svg className="gl" viewBox="0 0 24 24" aria-hidden="true">
    {children}
  </svg>
);

const wheatLeaf = (y: number) => (
  <>
    <path d={`M12 ${y}c-2.5 0-4-1.8-4-4 2.5 0 4 1.8 4 4z`} />
    <path d={`M12 ${y}c2.5 0 4-1.8 4-4-2.5 0-4 1.8-4 4z`} />
  </>
);

export const GLYPHS = {
  day: (
    <G>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
    </G>
  ),
  cal: (
    <G>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <circle cx="8.5" cy="14" r=".6" />
      <circle cx="12" cy="14" r=".6" />
      <circle cx="15.5" cy="14" r=".6" />
      <circle cx="8.5" cy="17.2" r=".6" />
      <circle cx="12" cy="17.2" r=".6" />
    </G>
  ),
  hab: (
    <G>
      <path d="M3.5 7l2 2 3.5-3.5M3.5 15l2 2 3.5-3.5M12 7.5h8.5M12 15.5h8.5" />
    </G>
  ),
  tbl: (
    <G>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M3.5 14.5h17M9.2 4.5v15M14.8 4.5v15" />
    </G>
  ),
  apple: (
    <G>
      <path d="M12 8.2c-3-2.2-7-.6-7 4 0 4.2 2.6 8 5 8 1 0 1.4-.5 2-.5s1 .5 2 .5c2.4 0 5-3.8 5-8 0-4.6-4-6.2-7-4z" />
      <path d="M12 8.2c0-2 1-3.5 3-4.5" />
    </G>
  ),
  plan: (
    <G>
      <rect x="5" y="4" width="14" height="17.5" rx="2.5" />
      <path d="M9 2.5h6v3H9zM9 11h6M9 15h6" />
    </G>
  ),
  flask: (
    <G>
      <path d="M9.5 3h5M10.5 3v6l-5 9a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3l-5-9V3" />
      <path d="M8 15.5h8" />
    </G>
  ),
  scale: (
    <G>
      <rect x="3.5" y="4" width="17" height="16" rx="4" />
      <path d="M8 10a4 4 0 0 1 8 0M12 10l2.2-2.4" />
    </G>
  ),
  all: (
    <G>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.8" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8" />
    </G>
  ),
  egg: (
    <G>
      <path d="M12 3c4 0 7 6.5 7 11a7 7 0 0 1-14 0c0-4.5 3-11 7-11z" />
    </G>
  ),
  wheat: (
    <G>
      <path d="M12 21V9" />
      {wheatLeaf(9)}
      {wheatLeaf(14)}
      {wheatLeaf(19)}
    </G>
  ),
  nut: (
    <G>
      <path d="M12 3c-3 0-4.5 2-4.5 4.2 0 1.8 1.5 2.8 1.5 4.8s-1.5 3-1.5 4.8C7.5 19 9 21 12 21s4.5-2 4.5-4.2c0-1.8-1.5-2.8-1.5-4.8s1.5-3 1.5-4.8C16.5 5 15 3 12 3z" />
    </G>
  ),
  star: (
    <G>
      <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.3 6L12 16.5l-5.4 2.9 1.3-6-4.5-4.1 6-.7z" />
    </G>
  ),
  crown: (
    <G>
      <path d="M3.5 8l4.5 4.5L12 5l4 7.5L20.5 8l-2 11h-13z" />
    </G>
  ),
  flag: (
    <G>
      <path d="M5.5 21V4" />
      <path d="M5.5 4.5H18l-2.5 4 2.5 4H5.5" />
    </G>
  ),
  column: (
    <G>
      <path d="M4 8.5L12 4l8 4.5" />
      <path d="M6.5 10.5v7M10 10.5v7M14 10.5v7M17.5 10.5v7M4 20h16" />
    </G>
  ),
  sword: (
    <G>
      <path d="M20 4l-9.5 9.5M15.5 4H20v4.5M11 13l-4.5 4.5M5 15l4 4M3.5 20.5l3-3" />
    </G>
  ),
  flame: (
    <G>
      <path d="M12 3c.8 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4.5 3-6.5.7 1.8 1.6 2.3 2.7 2.3 0-2.8.3-4.6.3-6.8z" />
    </G>
  ),
  chev1: (
    <G>
      <path d="M9 6l6 6-6 6" />
    </G>
  ),
  chev2: (
    <G>
      <path d="M5 6l6 6-6 6M12 6l6 6-6 6" />
    </G>
  ),
  chev3: (
    <G>
      <path d="M3 6l5 6-5 6M10 6l5 6-5 6M17 6l5 6-5 6" />
    </G>
  ),
  timer: (
    <G>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 9.5v4.5l3 2M9.5 3h5" />
    </G>
  ),
  gem: (
    <G>
      <path d="M6 9.5L9 5h6l3 4.5L12 20z" />
      <path d="M6 9.5h12M9 5l1.5 4.5L12 20l1.5-10.5L15 5" />
    </G>
  ),
  medal: (
    <G>
      <circle cx="12" cy="15" r="5.5" />
      <path d="M8.5 3.5l2.2 6.2M15.5 3.5l-2.2 6.2M12 12.6v4.8" />
    </G>
  ),
  moon: (
    <G>
      <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />
    </G>
  ),
  sun: (
    <G>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8" />
    </G>
  ),
  auto: (
    <G>
      <rect x="3.5" y="4.5" width="17" height="12" rx="2.5" />
      <path d="M9 20.5h6M12 16.5v4" />
      <path d="M12 7.5a3 3 0 0 0 0 6z" fill="#fff" />
    </G>
  ),
  trash: (
    <G>
      <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
    </G>
  ),
  gear: (
    <G>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8" />
    </G>
  ),
} satisfies Record<string, ReactNode>;

export type GlyphName = keyof typeof GLYPHS;

/* ---------------- Check mark ---------------- */

export const CheckMark = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

/* ---------------- App icons (`IC`, final iOS-like set) ---------------- */

export const APP_ICONS: Record<AppKey, ReactNode> = {
  home: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M9 31L32 11l23 20" fill="none" stroke="#4b4663" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 29v22a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4V29L32 17z" fill="#4b4663" />
      <rect x="26" y="37" width="12" height="18" rx="3" fill="#ebe8f5" />
    </svg>
  ),
  tracker: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="11" y="13" width="42" height="40" rx="9" fill="#f4f6f4" />
      <path d="M11 24a9 9 0 0 1 9-9h24a9 9 0 0 1 9 9v2H11z" fill="#d3e8d3" />
      <rect x="21" y="8" width="5" height="12" rx="2.5" fill="#f4f6f4" />
      <rect x="38" y="8" width="5" height="12" rx="2.5" fill="#f4f6f4" />
      <circle cx="32" cy="40" r="10" fill="#379a46" />
      <path d="M27 40l4 4 7-8" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  train: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g transform="rotate(-38 32 32)">
        <rect x="19" y="28" width="26" height="8" rx="4" fill="#f4f1f1" />
        <rect x="11" y="18" width="10" height="28" rx="4" fill="#fff" />
        <rect x="43" y="18" width="10" height="28" rx="4" fill="#fff" />
        <rect x="4" y="23" width="8" height="18" rx="3.5" fill="#f3d3d1" />
        <rect x="52" y="23" width="8" height="18" rx="3.5" fill="#f3d3d1" />
      </g>
    </svg>
  ),
  nut: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 20c-6-5-18-2-18 12 0 11 7 21 13 21 2 0 3-1 5-1s3 1 5 1c6 0 13-10 13-21 0-14-12-17-18-12z" fill="#e5483f" />
      <path d="M20 30c1-5 4-8 8-9" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 20c0-6 2-10 6-13" fill="none" stroke="#7a5b3a" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M38 12c5-3 11-1 13 4-5 3-11 2-13-4z" fill="#4fb868" />
    </svg>
  ),
  rewards: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M19 10h26v16c0 9-6 15-13 15s-13-6-13-15z" fill="#fff" />
      <path d="M19 15h-8c0 9 3 14 10 16M45 15h8c0 9-3 14-10 16" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <rect x="29" y="40" width="6" height="8" fill="#fdebc0" />
      <rect x="19" y="47" width="26" height="8" rx="3.5" fill="#fff" />
      <path d="M32 18l2.2 4.4 4.8.7-3.5 3.4.8 4.8-4.3-2.3-4.3 2.3.8-4.8-3.5-3.4 4.8-.7z" fill="#e8a32a" />
    </svg>
  ),
  quotes: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 6c3 9 15 14 15 29a15 15 0 0 1-30 0c0-7 3-10 6-14 1 4 3 6 5 6 0-8 1-14 4-21z" fill="#fff" />
      <path d="M32 28c2 5 8 7 8 14a8 8 0 0 1-16 0c0-4 3-7 4-10 1 2 2 3 4 3z" fill="#ffd9b0" />
    </svg>
  ),
  books: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M8 15c9-3 17-2 24 4v36c-7-5-15-6-24-3z" fill="#fff" />
      <path d="M56 15c-9-3-17-2-24 4v36c7-5 15-6 24-3z" fill="#d6e6fb" />
      <path d="M32 19v36" stroke="#9db9e2" strokeWidth="2.5" />
      <path d="M14 25c4-1 8-1 12 1M14 33c4-1 8-1 12 1M38 26c4-2 8-2 12-1M38 34c4-2 8-2 12-1" fill="none" stroke="#7fa3d8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M42 8v15l4.5-3.5L51 23V10z" fill="#e5483f" />
    </svg>
  ),
};
