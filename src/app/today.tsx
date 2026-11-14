import { createContext, useContext, type ReactNode } from 'react';
import { makeToday, useTodayClock, type Today } from '../lib/dates';

const TodayContext = createContext<Today>(makeToday());

/** Provides a single self-updating "today" to the whole app. */
export function TodayProvider({ children }: { children: ReactNode }) {
  const today = useTodayClock();
  return <TodayContext.Provider value={today}>{children}</TodayContext.Provider>;
}

export const useToday = () => useContext(TodayContext);
