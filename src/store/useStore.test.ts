import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from './useStore';
import { initialData } from './migrations';

const today = { y: 2026, m: 10, d: 14 };
const s = () => useStore.getState();

describe('store actions', () => {
  beforeEach(() => useStore.setState(initialData()));

  it('toggles a habit day', () => {
    s().toggleDay('2026-10', 'h0', 3);
    expect(s().data['2026-10'].c.h0).toEqual([3]);
    s().toggleDay('2026-10', 'h0', 3);
    expect(s().data['2026-10'].c.h0).toEqual([]);
  });

  it('mood picker toggles off on the same value; table cycles 0..5', () => {
    s().setScore('2026-10', 'mood', 1, 4);
    s().setScore('2026-10', 'mood', 1, 4);
    expect(s().data['2026-10'].mood[1]).toBe(0);
    for (let i = 0; i < 6; i++) s().cycleScore('2026-10', 'mot', 2);
    expect(s().data['2026-10'].mot[2]).toBe(0);
  });

  it('adds habits with goal capped at 31 and default 20', () => {
    s().addHabit('Медитация', 40);
    s().addHabit('Чтение', 0);
    expect(s().habits.slice(-2).map((h) => h.goal)).toEqual([31, 20]);
  });

  it('marking a set ticks the linked habit for today, unmarking does not untick', () => {
    s().toggleSet('pu', '0.0', today);
    expect(s().tr.d.pu).toEqual(['0.0']);
    expect(s().data['2026-10'].c.h3).toEqual([14]); // "250 отжиманий"
    s().toggleSet('pu', '0.1', today);
    expect(s().data['2026-10'].c.h3).toEqual([14]); // not duplicated
    s().toggleSet('pu', '0.1', today);
    expect(s().data['2026-10'].c.h3).toEqual([14]);
  });

  it('programs without a matching habit only record the set', () => {
    s().toggleSet('ch', '0.0', today);
    expect(s().tr.d.ch).toEqual(['0.0']);
    expect(s().data['2026-10']).toBeUndefined();
  });

  it('load multiplier is clamped to 50–200% in 10% steps', () => {
    for (let i = 0; i < 20; i++) s().changeLoad('pu', 0.1);
    expect(s().tr.k.pu).toBe(2);
    for (let i = 0; i < 20; i++) s().changeLoad('pu', -0.1);
    expect(s().tr.k.pu).toBe(0.5);
  });

  it('weight log: overwrite same date and keep sorted', () => {
    s().saveWeight('2026-11-10', 70);
    s().saveWeight('2026-11-01', 69);
    s().saveWeight('2026-11-10', 71);
    expect(s().nut.w).toEqual([
      { d: '2026-11-01', v: 69 },
      { d: '2026-11-10', v: 71 },
    ]);
  });
});
