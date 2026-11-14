import { useRef } from 'react';
import { MUSCLES, PROGRAMS, TEMPOS } from '../../data/exercises';
import { useStore } from '../../store/useStore';
import { useUi } from '../../store/uiStore';
import { Tile, Tiles } from '../../ui/Tiles';
import { GLYPHS } from '../../ui/Icons';
import { ExerciseFigure } from './ExerciseFigure';
import { ExerciseIllustration } from './ExerciseIllustration';
import { RestTimer } from './RestTimer';
import { WeekPlan } from './WeekPlan';
import { useRepCounter } from './useRepCounter';
import './train.css';

const PROGRAM_TILES = PROGRAMS.map((p) => ({ key: p.id, label: p.name, icon: <ExerciseFigure name={p.thumb} thumb /> }));

export default function TrainScreen() {
  const { program, figIdx, tempo, set } = useUi();
  const e = PROGRAMS.find((p) => p.id === program) ?? PROGRAMS[0];
  const fig = e.figs[Math.min(figIdx, e.figs.length - 1)];
  const k = useStore((s) => s.tr.k[e.id] || 1);
  const changeLoad = useStore((s) => s.changeLoad);

  const svg = useRef<SVGSVGElement>(null);
  const animKey = fig[0] + '@' + tempo;
  const { reps, paused, toggle } = useRepCounter(svg, tempo, animKey);
  const [hot, other] = MUSCLES[fig[0]];

  return (
    <>
      <Tiles items={PROGRAM_TILES} value={e.id} onChange={(id) => set({ program: id, figIdx: 0 })} />
      <div className="card">
        <div className="tg">
          <div className="fgw il-panel">
            <ExerciseIllustration key={animKey} ref={svg} name={fig[0]} dur={tempo} />
          </div>
          <div>
            {e.figs.length > 1 && (
              <Tiles
                items={e.figs.map((f, i) => ({ key: String(i), label: f[1], icon: <ExerciseFigure name={f[0]} thumb /> }))}
                value={String(Math.min(figIdx, e.figs.length - 1))}
                onChange={(i) => set({ figIdx: +i })}
              />
            )}
            <h2 style={{ marginTop: 0 }}>{fig[1]}</h2>
            <div>
              {hot.map((x) => (
                <span key={x} className="mc hot">
                  {x}
                </span>
              ))}
              {other.map((x) => (
                <span key={x} className="mc">
                  {x}
                </span>
              ))}
            </div>
            <p>{fig[2]}</p>

            <div className="ctl">
              <button type="button" className="nav sm" onClick={toggle}>
                {paused ? '▶ Старт' : '⏸ Пауза'}
              </button>
              <span>Темп:</span>
              {TEMPOS.map((p, i) => (
                <Tile key={p.dur} small color={3 + i} active={p.dur === tempo} icon={GLYPHS[p.glyph]} label={p.label} onClick={() => set({ tempo: p.dur })} />
              ))}
              <span>
                Повторов: <b style={{ color: 'var(--acc)' }}>{reps}</b>
              </span>
            </div>

            <div className="ctl">
              <span>
                Нагрузка: <b>{Math.round(k * 100)}%</b>
              </span>
              <button type="button" className="nav sm" onClick={() => changeLoad(e.id, -0.1)} aria-label="Уменьшить нагрузку">
                −
              </button>
              <button type="button" className="nav sm" onClick={() => changeLoad(e.id, 0.1)} aria-label="Увеличить нагрузку">
                +
              </button>
            </div>

            <RestTimer colorOffset={3 + TEMPOS.length} />
          </div>
        </div>
      </div>
      <WeekPlan key={e.id} program={e} />
    </>
  );
}
