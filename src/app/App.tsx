import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { TodayProvider } from './today';
import { Dock } from '../ui/Dock';
import { ScreenHeader } from '../ui/ScreenHeader';
import { HomeScreen } from '../features/home/HomeScreen';
import type { AppKey } from '../data/palette';

const TrackerScreen = lazy(() => import('../features/tracker/TrackerScreen'));
const TrainScreen = lazy(() => import('../features/train/TrainScreen'));
const NutritionScreen = lazy(() => import('../features/nutrition/NutritionScreen'));
const AchievementsScreen = lazy(() => import('../features/achievements/AchievementsScreen'));
const QuotesScreen = lazy(() => import('../features/quotes/QuotesScreen'));
const BooksScreen = lazy(() => import('../features/books/BooksScreen'));
const SettingsScreen = lazy(() => import('../features/settings/SettingsScreen'));

/** Inner screen chrome: header + content + bottom dock. */
function Inner({ app, title, children }: { app: AppKey; title: string; children: ReactNode }) {
  return (
    <>
      <ScreenHeader app={app} title={title} />
      <Suspense fallback={null}>
        <div className="screen">{children}</div>
      </Suspense>
      <Dock />
    </>
  );
}

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <TodayProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <ScrollTop />
        <div className="app-bg" aria-hidden="true" />
        <div className="wrap">
          <Routes>
            <Route path="/" element={<div className="screen"><HomeScreen /></div>} />
            <Route path="/tracker" element={<Inner app="tracker" title="Трекер"><TrackerScreen /></Inner>} />
            <Route path="/train" element={<Inner app="train" title="Тренировки"><TrainScreen /></Inner>} />
            <Route path="/nut" element={<Inner app="nut" title="Питание"><NutritionScreen /></Inner>} />
            <Route path="/achievements" element={<Inner app="rewards" title="Достижения"><AchievementsScreen /></Inner>} />
            <Route path="/rewards" element={<Navigate to="/achievements" replace />} />
            <Route path="/quotes" element={<Inner app="quotes" title="Мотивация"><QuotesScreen /></Inner>} />
            <Route path="/books" element={<Inner app="books" title="Книги"><BooksScreen /></Inner>} />
            <Route path="/settings" element={<Inner app="home" title="Настройки"><SettingsScreen /></Inner>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TodayProvider>
  );
}
