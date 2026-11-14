import { describe, expect, it } from 'vitest';
import { FIGURES } from '../../data/exercises';
import { blendPose, easeInOut, effortAt, repFrames, TIMELINE } from './motion';

const len = (p: { [k: string]: readonly [number, number] | undefined }, a: string, b: string) =>
  Math.hypot(p[b]![0] - p[a]![0], p[b]![1] - p[a]![1]);

describe('motion', () => {
  it('keeps bone length when rotating (no shrinking limbs mid-rep)', () => {
    const { A, B } = FIGURES.pushup;
    const mid = blendPose(A, B, 0.5);
    for (const [a, b] of [['S', 'E'], ['E', 'W'], ['H', 'K']] as const) {
      const expected = (len(A, a, b) + len(B, a, b)) / 2;
      expect(len(mid, a, b)).toBeCloseTo(expected, 6);
    }
  });

  it('planar joints move in a straight line (hands stay on the pull-up bar)', () => {
    const { A, B, planar } = FIGURES.pullup;
    for (const u of [0.25, 0.5, 0.75]) {
      const p = blendPose(A, B, u, planar);
      expect(p.W).toEqual(A.W);
      expect(p.E![0]).toBeCloseTo(A.E![0] + (B.E![0] - A.E![0]) * u, 6);
    }
  });

  it('blend endpoints are the key poses', () => {
    const { A, B } = FIGURES.bc;
    expect(blendPose(A, B, 0)).toBe(A);
    expect(blendPose(A, B, 1)).toBe(B);
  });

  it('rep timeline: holds at both ends, starts and ends at A, passes through B', () => {
    const { A, B, M } = FIGURES.bc;
    const f = repFrames(A, B, M);
    expect(f[0]).toEqual({ t: 0, pose: A });
    expect(f[f.length - 1]).toEqual({ t: 1, pose: A });
    expect(f.find((x) => x.t === TIMELINE.hold1)?.pose).toBe(B);
    expect(f.every((x, i) => i === 0 || x.t >= f[i - 1].t)).toBe(true);
  });

  it('easing and effort curve', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(0.5)).toBeCloseTo(0.5);
    expect(effortAt(0, false)).toBe(0);
    expect(effortAt(0.5, false)).toBe(1);
    expect(effortAt(0.99, true)).toBe(0);
  });
});
