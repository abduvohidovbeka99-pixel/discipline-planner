import type { AppKey } from './palette';

export interface AppDef {
  key: Exclude<AppKey, 'home'>;
  title: string;
  path: string;
}

/** Home screen apps, in display order (`AP2`). */
export const APPS: AppDef[] = [
  { key: 'tracker', title: 'Трекер', path: '/tracker' },
  { key: 'train', title: 'Тренировки', path: '/train' },
  { key: 'nut', title: 'Питание', path: '/nut' },
  { key: 'rewards', title: 'Награды', path: '/rewards' },
  { key: 'quotes', title: 'Мотивация', path: '/quotes' },
  { key: 'books', title: 'Книги', path: '/books' },
];
