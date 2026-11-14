import { describe, expect, it } from 'vitest';
import { initialData, migrate, SCHEMA_VERSION } from './migrations';

describe('migrations', () => {
  it('fresh install: default habits + pull-ups and dips (legacy v2 step)', () => {
    const d = initialData();
    expect(d.habits.map((h) => h.name)).toEqual([
      'Тренировка',
      'Книга',
      'Изучение Claude',
      '250 отжиманий',
      'Отложить по 50 тыс',
      'Английский',
      'Сон до 00:00',
      'Вода 3 л',
      'Пресс',
      'Подтягивания',
      'Брусья',
    ]);
    expect(d.habits[0]).toEqual({ id: 'h0', name: 'Тренировка', goal: 8 });
    expect(d.habits[9]).toEqual({ id: 'hn0', name: 'Подтягивания', goal: 12 });
    expect(d.v2).toBe(1);
    expect(d.schemaVersion).toBe(SCHEMA_VERSION);
    expect(d.nut).toEqual({ cr: { tot: 100, ml: 500, days: [] }, w: [], g: 0, tk: 2700 });
    expect(d.tr).toEqual({ k: {}, d: {} });
  });

  it('very old legacy data (no v2, no books/tr/nut) keeps marks and gets defaults', () => {
    const legacy = {
      habits: [
        { id: 'h0', name: 'Тренировка', goal: 8 },
        { id: 'h1', name: 'Брусья', goal: 5 },
      ],
      data: { '2026-9': { c: { h0: [1, 2, 3] }, mood: { 1: 4 }, mot: {} } },
    };
    const d = migrate(legacy);
    expect(d.data['2026-9'].c.h0).toEqual([1, 2, 3]);
    expect(d.data['2026-9'].mood).toEqual({ 1: 4 });
    // "Брусья" already exists → only "Подтягивания" is added
    expect(d.habits.map((h) => h.name)).toEqual(['Тренировка', 'Брусья', 'Подтягивания']);
    expect(d.books).toEqual({});
    expect(d.v2).toBe(1);
  });

  it('legacy data that already has v2 is not touched', () => {
    const d = migrate({ habits: [{ id: 'x', name: 'Only', goal: 3 }], data: {}, v2: 1 });
    expect(d.habits).toHaveLength(1);
  });

  it('invalid input falls back to defaults; garbage fields are cleaned', () => {
    expect(migrate('nonsense').habits).toHaveLength(11);
    const d = migrate({
      habits: [{ id: 'a', name: 'A', goal: 'x' }, 42],
      data: { '2026-1': { c: { a: [1, '2', null, 3] } }, bad: 5 },
      nut: { w: [{ d: '2026-02-02', v: 70 }, { d: '2026-01-01', v: 69 }, { v: 1 }], cr: { tot: 0 } },
      v2: 1,
    });
    expect(d.habits).toEqual([{ id: 'a', name: 'A', goal: 0 }]);
    expect(d.data).toEqual({ '2026-1': { c: { a: [1, 3] }, mood: {}, mot: {} } });
    expect(d.nut.w).toEqual([
      { d: '2026-01-01', v: 69 },
      { d: '2026-02-02', v: 70 },
    ]);
    expect(d.nut.cr.tot).toBe(100);
  });

  it('is idempotent on current data', () => {
    const d = initialData();
    expect(migrate(migrate(d))).toEqual(d);
  });

  it('refuses data from a newer schema', () => {
    expect(() => migrate({ habits: [], schemaVersion: SCHEMA_VERSION + 1 })).toThrow();
  });
});
