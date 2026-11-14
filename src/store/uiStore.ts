import { create } from 'zustand';
import type { FoodCategory } from '../data/foods';
import type { QuoteCategory } from '../data/quotes';

/**
 * Transient UI state (not persisted) — mirrors the prototype's globals
 * (`Y`, `M`, `TV`, `SD`, `NV`, `FC`, `NG`, `Q`, `TX`, `FI`, `PD`).
 * It lives outside components so it survives navigation between screens.
 */

export type TrackerView = 'day' | 'cal' | 'hab' | 'tbl';
export type NutView = 'food' | 'plan' | 'cr' | 'w';

interface UiState {
  /** Month shown in the tracker (null = follow the current month). */
  tracker: { y: number; m: number } | null;
  trackerView: TrackerView;
  /** Selected day in the "Day" view, bound to a month key. */
  selDay: { k: string; d: number } | null;

  nutView: NutView;
  foodCat: FoodCategory;
  portion: number;

  quoteCat: QuoteCategory;
  /** Index within the filtered list; -1 = pick a random one. */
  quoteIdx: number;

  program: string;
  figIdx: number;
  /** Animation period, seconds. */
  tempo: number;

  /** Rest timer: end timestamp (ms) or null; `restLeft` is mirrored for rendering. */
  restEnd: number | null;
  restLeft: number;

  set(patch: Partial<Omit<UiState, 'set' | 'startRest'>>): void;
  startRest(seconds: number): void;
}

let restTimer: ReturnType<typeof setInterval> | undefined;

export const useUi = create<UiState>()((set, get) => ({
  tracker: null,
  trackerView: 'day',
  selDay: null,

  nutView: 'food',
  foodCat: 'Все',
  portion: 100,

  quoteCat: 'Все',
  quoteIdx: -1,

  program: 'pu',
  figIdx: 0,
  tempo: 2.4,

  restEnd: null,
  restLeft: 0,

  set: (patch) => set(patch),

  startRest: (seconds) => {
    clearInterval(restTimer);
    const end = Date.now() + seconds * 1000;
    set({ restEnd: end, restLeft: seconds });
    restTimer = setInterval(() => {
      const left = Math.max(0, Math.round((end - Date.now()) / 1000));
      if (left !== get().restLeft) set({ restLeft: left });
      if (left <= 0) {
        clearInterval(restTimer);
        try {
          navigator.vibrate?.(300);
        } catch {
          /* vibration unsupported */
        }
      }
    }, 250);
  },
}));
