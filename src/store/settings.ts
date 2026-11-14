import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { localBackend } from './storage';

export type ThemePref = 'dark' | 'light' | 'system';

export interface Settings {
  theme: ThemePref;
  /** Show the background photo. */
  bgPhoto: boolean;
  /** Vibrate when the rest timer ends. */
  vibrate: boolean;
}

export const SETTINGS_KEY = 'discipline-settings';
export const DEFAULT_SETTINGS: Settings = { theme: 'dark', bgPhoto: true, vibrate: true };

interface SettingsStore extends Settings {
  set(patch: Partial<Settings>): void;
  reset(): void;
}

/** App preferences (kept apart from habit data: not part of backups). */
export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      set: (patch) => set(patch),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: SETTINGS_KEY,
      version: 1,
      storage: createJSONStorage(() => localBackend as Storage),
      partialize: ({ theme, bgPhoto, vibrate }) => ({ theme, bgPhoto, vibrate }),
    },
  ),
);

export const THEME_COLORS = { dark: '#14111b', light: '#f4f1fa' } as const;

const systemTheme = (): 'dark' | 'light' =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

export const resolveTheme = (t: ThemePref): 'dark' | 'light' => (t === 'system' ? systemTheme() : t);

/** Apply settings to <html> (theme attribute, background toggle, status-bar colour). */
export function applySettings(s: Settings): void {
  const theme = resolveTheme(s.theme);
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.bg = s.bgPhoto ? 'on' : 'off';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme);
}

/** Keep <html> in sync with the settings store and the OS theme. */
export function bindSettings(): void {
  applySettings(useSettings.getState());
  useSettings.subscribe(applySettings);
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => applySettings(useSettings.getState()));
}
