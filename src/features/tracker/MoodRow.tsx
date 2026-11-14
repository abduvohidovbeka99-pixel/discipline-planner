import { useStore, type ScoreKind } from '../../store/useStore';
import { EMOJI, type MonthCtx } from './context';

const ROWS: [ScoreKind, string][] = [
  ['mood', 'Настроение'],
  ['mot', 'Мотивация'],
];

/** Mood and motivation pickers for one day. */
export function MoodCard({ ctx, day }: { ctx: MonthCtx; day: number }) {
  const setScore = useStore((s) => s.setScore);
  return (
    <div className="card">
      {ROWS.map(([kind, title]) => (
        <div className="mrow" key={kind}>
          <b>{title}</b>
          <div>
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                className={'mb' + (ctx.md?.[kind][day] === v ? ' on' : '')}
                onClick={() => setScore(ctx.mk, kind, day, v)}
                aria-label={title + ' ' + v}
              >
                {EMOJI[v]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
