import type { AppData } from './types';
import { migrate, SCHEMA_VERSION } from './migrations';
import { iso } from '../lib/dates';

/**
 * Export format = the legacy `habit-tracker-v1` object plus `schemaVersion`.
 * The prototype ignores unknown keys, so the file can be imported both here
 * and back into the old single-file version.
 */
export function serialize(data: AppData): string {
  return JSON.stringify({ ...data, schemaVersion: SCHEMA_VERSION }, null, 2);
}

export const exportFileName = (d = new Date()) => `discipline-backup-${iso(d)}.json`;

export interface ImportSummary {
  habits: number;
  months: number;
  marks: number;
  books: number;
  sets: number;
  weights: number;
  creatine: number;
}

export function summarize(d: AppData): ImportSummary {
  return {
    habits: d.habits.length,
    months: Object.keys(d.data).length,
    marks: Object.values(d.data).reduce((a, m) => a + Object.values(m.c).reduce((s, l) => s + l.length, 0), 0),
    books: Object.values(d.books).filter(Boolean).length,
    sets: Object.values(d.tr.d).reduce((a, l) => a + l.length, 0),
    weights: d.nut.w.length,
    creatine: d.nut.cr.days.length,
  };
}

/**
 * Parse an exported/legacy JSON string. Accepts:
 *  - the raw legacy localStorage value (`habit-tracker-v1`)
 *  - this app's export
 *  - a zustand-style envelope `{ state, version }`
 */
export function parseBackup(text: string): AppData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('Файл не похож на JSON');
  }
  if (raw && typeof raw === 'object' && 'state' in raw && !('habits' in raw)) {
    raw = (raw as { state: unknown }).state;
  }
  if (!raw || typeof raw !== 'object' || !Array.isArray((raw as { habits?: unknown }).habits)) {
    throw new Error('В файле нет списка привычек — это не резервная копия ежедневника');
  }
  return migrate(raw);
}

/** Trigger a download (or the share sheet on mobile when available). */
export async function downloadBackup(data: AppData): Promise<void> {
  const text = serialize(data);
  const name = exportFileName();
  const file = new File([text], name, { type: 'application/json' });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
    try {
      await nav.share({ files: [file], title: 'Ежедневник — резервная копия' });
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
