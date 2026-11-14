/** App icon gradients (`PAL`). */
export const PAL = {
  tracker: ['#52c25f', '#379a46'],
  train: ['#e5483f', '#bd2a25'],
  nut: ['#f6f6f8', '#dcdce2'],
  rewards: ['#f4b93e', '#df8f1e'],
  quotes: ['#8e3fe0', '#f0782e'],
  books: ['#4f95dc', '#2f6fc2'],
  home: ['#ebebf1', '#c9c9d3'],
} as const satisfies Record<string, readonly [string, string]>;

export type AppKey = keyof typeof PAL;

/** Tile gradients, cycled by index (`TL`). */
export const TL: ReadonlyArray<readonly [string, string]> = [
  ['#e5483f', '#bd2a25'],
  ['#52c25f', '#379a46'],
  ['#4f95dc', '#2f6fc2'],
  ['#dc3f9c', '#a82a8f'],
  ['#f39430', '#dc6c16'],
  ['#9156e3', '#6236bd'],
  ['#2fc7bf', '#1b9ba2'],
  ['#f4bb3d', '#de9120'],
];

export const tileColors = (i: number) => TL[i % TL.length];
