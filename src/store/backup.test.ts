import { describe, expect, it } from 'vitest';
import { parseBackup, serialize, summarize } from './backup';
import { initialData } from './migrations';

describe('backup', () => {
  it('round-trips through serialize/parse', () => {
    const d = initialData();
    d.data['2026-10'] = { c: { h0: [1, 2] }, mood: { 1: 5 }, mot: {} };
    d.books.p1 = true;
    expect(parseBackup(serialize(d))).toEqual(d);
  });

  it('export keeps the legacy shape (old prototype can read it)', () => {
    const o = JSON.parse(serialize(initialData()));
    expect(Object.keys(o).sort()).toEqual(['books', 'data', 'habits', 'nut', 'schemaVersion', 'tr', 'v2']);
  });

  it('accepts a raw legacy dump and a zustand envelope', () => {
    const legacy = { habits: [{ id: 'h0', name: 'X', goal: 1 }], data: {} };
    expect(parseBackup(JSON.stringify(legacy)).habits[0].name).toBe('X');
    expect(parseBackup(JSON.stringify({ state: legacy, version: 0 })).habits[0].name).toBe('X');
  });

  it('rejects non-JSON and unrelated JSON', () => {
    expect(() => parseBackup('hello')).toThrow(/JSON/);
    expect(() => parseBackup('{"foo":1}')).toThrow(/привычек/);
  });

  it('summarizes content', () => {
    const d = initialData();
    d.data['2026-10'] = { c: { h0: [1, 2], h1: [3] }, mood: {}, mot: {} };
    d.tr.d.pu = ['0.0', '0.1'];
    expect(summarize(d)).toMatchObject({ habits: 11, months: 1, marks: 3, sets: 2 });
  });
});
