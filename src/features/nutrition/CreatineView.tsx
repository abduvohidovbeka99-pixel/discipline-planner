import { useId } from 'react';
import { useStore } from '../../store/useStore';
import { useToday } from '../../app/today';
import { creatineStats } from '../../lib/calc';
import { addWeeks, iso, WEEK_SHORT } from '../../lib/dates';
import { parseNum, rn } from '../../lib/format';
import { Bar } from '../../ui/Bar';
import { ConfirmButton } from '../../ui/ConfirmButton';
import { NumberField } from '../../ui/NumberField';

/** Jar with a fill level. */
function Jar({ fraction }: { fraction: number }) {
  const clip = 'bt' + useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 80 120" width="84" height="126" aria-hidden="true" style={{ flex: 'none' }}>
      <defs>
        <clipPath id={clip}>
          <rect x="14" y="26" width="52" height="88" rx="10" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x="14" y={26 + 88 * (1 - fraction)} width="52" height={88 * fraction} className="bl" />
      </g>
      <rect className="bo" x="14" y="26" width="52" height="88" rx="10" />
      <rect className="bo" x="28" y="8" width="24" height="18" rx="4" />
    </svg>
  );
}

export function CreatineView() {
  const t = useToday();
  const c = useStore((s) => s.nut.cr);
  const toggle = useStore((s) => s.toggleCreatine);
  const newPack = useStore((s) => s.newCreatinePack);
  const setPack = useStore((s) => s.setCreatinePack);
  const { taken, left, perServingMl, fraction, leftMl } = creatineStats(c);
  const on = c.days.includes(t.iso);

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(t.date);
    d.setDate(d.getDate() - i);
    return d;
  });

  return (
    <>
      <div className="card">
        <h2>Креатин моногидрат</h2>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <Jar fraction={fraction} />
          <div style={{ flex: 1 }}>
            <div className="big">{left}</div>
            <div className="sub">
              порций осталось из {c.tot} · ≈ {rn(leftMl)} из {c.ml} мл
            </div>
            <Bar pct={Math.round(fraction * 100)} style={{ marginTop: 10 }} />
          </div>
        </div>
        <button type="button" className={'pbtn' + (on ? ' done' : '')} style={{ width: '100%', marginTop: 14 }} onClick={() => toggle(t.iso)}>
          {on ? '✓ Сегодня принято (нажми, чтобы отменить)' : 'Принял креатин сегодня'}
        </button>
      </div>

      <div className="card">
        <h2>Последние 14 дней</h2>
        <div className="crs">
          {days.map((d) => {
            const s = iso(d);
            return (
              <button key={s} type="button" className={'crd' + (c.days.includes(s) ? ' on' : '')} onClick={() => toggle(s)} aria-pressed={c.days.includes(s)}>
                <small>{WEEK_SHORT[(d.getDay() + 6) % 7]}</small>
                <b>{d.getDate()}</b>
              </button>
            );
          })}
        </div>
        <div className="stats">
          <div>
            <b>{taken}</b>
            <small>принято порций</small>
          </div>
          <div>
            <b>{rn(perServingMl)} мл</b>
            <small>одна порция</small>
          </div>
          <div>
            <b>{left ? addWeeks(left / 7, t.date) : '—'}</b>
            <small>{left ? 'хватит до (при ежедневном приёме)' : 'упаковка закончилась'}</small>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Упаковка</h2>
        <div className="ctl" style={{ marginTop: 0 }}>
          <span>Порций:</span>
          <NumberField className="g" style={{ width: 70 }} min={1} value={c.tot} onCommit={(v) => setPack({ tot: Math.max(1, Math.round(parseNum(v)) || 100) })} aria-label="Порций" />
          <span>Объём, мл:</span>
          <NumberField className="g" style={{ width: 70 }} min={1} value={c.ml} onCommit={(v) => setPack({ ml: Math.max(1, parseNum(v) || 500) })} aria-label="Объём, мл" />
        </div>
        <ConfirmButton className="nav sm" armClass="" confirm="Точно начать новую упаковку?" onConfirm={newPack}>
          Начать новую упаковку
        </ConfirmButton>
        <div className="hint">
          Принимай по инструкции на упаковке — обычно каждый день, в том числе без тренировок, и пей достаточно воды. При проблемах с почками или другими
          заболеваниями сначала проконсультируйся с врачом.
        </div>
      </div>
    </>
  );
}
