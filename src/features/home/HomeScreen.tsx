import { Link, useNavigate } from 'react-router-dom';
import { APPS, type AppDef } from '../../data/apps';
import { MILESTONES } from '../../data/milestones';
import { BOOKS } from '../../data/books';
import { useStore, type Store } from '../../store/useStore';
import { useOverallProgress } from '../../app/hooks';
import { useToday } from '../../app/today';
import type { Today } from '../../lib/dates';
import { monthKey } from '../../lib/dates';
import { remainingToday } from '../../lib/calc';
import { rn } from '../../lib/format';
import { AppIcon } from '../../ui/AppIcon';
import { GLYPHS } from '../../ui/Icons';
import { ProgressRing } from './ProgressRing';
import './home.css';

/** Badge count and status caption under each app icon (`appInfo`). */
function appInfo(key: AppDef['key'], s: Store, t: Today, pct: number): [number, string] {
  switch (key) {
    case 'tracker': {
      const rem = remainingToday(s.data[monthKey(t.y, t.m)], s.habits, t.d);
      return [rem, rem ? 'Сегодня осталось ' + rem : 'Сегодня всё ✓'];
    }
    case 'train':
      return [0, 'Тренировок: ' + Object.values(s.tr.d).reduce((a, l) => a + l.length, 0)];
    case 'nut': {
      const w = s.nut.w;
      return [0, w.length ? rn(w[w.length - 1].v) + ' кг' : 'Добавь вес'];
    }
    case 'rewards':
      return [0, 'Открыто ' + MILESTONES.filter((m) => pct >= m.pct).length + ' из ' + MILESTONES.length];
    case 'quotes':
      return [0, 'Цитаты дня'];
    case 'books':
      return [0, 'Прочитано ' + BOOKS.filter((b) => s.books[b.id]).length + ' из ' + BOOKS.length];
  }
}

export function HomeScreen() {
  const s = useStore();
  const t = useToday();
  const pct = useOverallProgress();
  const nav = useNavigate();

  return (
    <>
      <div className="apph">
        <span className="spacer" />
        <Link to="/settings" className="iconbtn" aria-label="Настройки">
          {GLYPHS.gear}
        </Link>
      </div>
      <ProgressRing pct={pct} />
      <div className="apps">
        {APPS.map((a) => {
          const [badge, caption] = appInfo(a.key, s, t, pct);
          return (
            <button key={a.key} type="button" className="app" onClick={() => nav(a.path)}>
              <AppIcon app={a.key} badge={badge} />
              <b>{a.title}</b>
              <small>{caption}</small>
            </button>
          );
        })}
      </div>
    </>
  );
}
