import type { CSSProperties } from 'react';
import { RANKS } from '../../data/ranks';
import { useStore } from '../../store/useStore';
import { useToday } from '../../app/today';
import { useOverallProgress } from '../../app/hooks';
import { rankHistory, rankIndex, rankMaxPct, rankMinPct } from '../../lib/achievements';
import { MONTHS } from '../../lib/dates';
import { Bar } from '../../ui/Bar';
import { Gem } from './Gem';

const monthName = (y: number, m: number) => MONTHS[m] + ' ' + y;

/** Current month's rank, the ladder of all ranks and the monthly history. */
export function RankView() {
  const t = useToday();
  const pct = useOverallProgress();
  const data = useStore((s) => s.data);
  const habits = useStore((s) => s.habits);
  const cur = rankIndex(pct);
  const r = cur ? RANKS[cur - 1] : null;
  const next = cur < RANKS.length ? RANKS[cur] : null;
  const toNext = next ? rankMinPct(cur + 1) - pct : 0;

  const history = rankHistory(data, habits).filter((h) => !(h.y === t.y && h.m === t.m));
  const best = history.reduce<(typeof history)[number] | null>((b, h) => (h.rank > (b?.rank ?? 0) ? h : b), null);

  return (
    <>
      <div className="card rank-hero" style={(r ? { '--r1': r.c1, '--r2': r.c2 } : {}) as CSSProperties}>
        <div className="rank-top">
          {r ? <Gem rank={cur} size={92} /> : <Gem rank={1} size={92} locked />}
          <div className="rank-info">
            <small>Титул за {monthName(t.y, t.m).toLowerCase()}</small>
            <b className="rank-name">{r ? r.name : 'Пока без титула'}</b>
            <span className="sub">Прогресс месяца: {pct}%</span>
          </div>
        </div>
        {next ? (
          <>
            <Bar pct={Math.round(((pct - (cur ? rankMinPct(cur) : 0)) / (rankMinPct(cur + 1) - (cur ? rankMinPct(cur) : 0))) * 100)} style={{ margin: '14px 0 6px' }} />
            <div className="hint" style={{ margin: 0 }}>
              До титула «{next.name}» — ещё {toNext}%
            </div>
          </>
        ) : (
          <div className="hint">Высший титул месяца. Удержи его до конца месяца!</div>
        )}
        {r ? (
          <blockquote className="rank-quote">
            <p className="rank-congrats">{r.congrats}</p>
            <p className="rank-q">«{r.quote}»</p>
            <cite>— {r.author}</cite>
          </blockquote>
        ) : (
          <p className="rank-congrats" style={{ marginTop: 14 }}>
            Набери {rankMinPct(1)}% общего прогресса за месяц — и получишь «Бронзу».
          </p>
        )}
        <div className="hint">Титул считается по общему прогрессу текущего месяца и начинается заново 1-го числа.</div>
      </div>

      <div className="card">
        <h2>Лестница титулов</h2>
        {RANKS.map((x, i) => {
          const n = i + 1;
          const state = n < cur ? 'done' : n === cur ? 'cur' : 'lock';
          return (
            <div key={x.id} className={'rank-row ' + state}>
              <Gem rank={n} size={40} locked={state === 'lock'} />
              <div className="fi">
                <b>{x.name}</b>
                <small>
                  {rankMinPct(n)}–{rankMaxPct(n)}% за месяц
                </small>
              </div>
              <span className="rank-st">{state === 'cur' ? 'сейчас' : state === 'done' ? '✓' : '🔒'}</span>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h2>История по месяцам</h2>
        {history.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--mut)' }}>
            Здесь появятся титулы прошлых месяцев.
          </p>
        ) : (
          <>
            {best && best.rank > 0 && (
              <div className="hint" style={{ margin: '0 0 6px' }}>
                Лучший титул: <b style={{ color: 'var(--ink)' }}>{RANKS[best.rank - 1].name}</b> — {monthName(best.y, best.m).toLowerCase()}
              </div>
            )}
            {history.map((h) => (
              <div className="fr" key={h.key}>
                {h.rank ? <Gem rank={h.rank} size={34} /> : <Gem rank={1} size={34} locked />}
                <div className="fi">
                  <b>{monthName(h.y, h.m)}</b>
                  <small>{h.rank ? RANKS[h.rank - 1].name : 'Без титула'}</small>
                </div>
                <div className="fk">
                  <b>{h.pct}%</b>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
