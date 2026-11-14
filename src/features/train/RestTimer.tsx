import { REST_OPTIONS } from '../../data/exercises';
import { useUi } from '../../store/uiStore';
import { Tile } from '../../ui/Tiles';
import { GLYPHS } from '../../ui/Icons';

/** Rest timer 30/45/60/90 s with vibration at the end (`startRest`). */
export function RestTimer({ colorOffset }: { colorOffset: number }) {
  const { restEnd, restLeft, startRest } = useUi();
  const label = restEnd === null ? '—' : restLeft > 0 ? restLeft + ' с' : 'Вперёд! 💪';
  return (
    <div className="ctl">
      <span>Отдых:</span>
      {REST_OPTIONS.map((s, i) => (
        <Tile key={s} small color={colorOffset + i} icon={GLYPHS.timer} label={s + ' с'} onClick={() => startRest(s)} />
      ))}
      <b style={{ fontSize: 22, color: 'var(--acc)' }} aria-live="polite">
        {label}
      </b>
    </div>
  );
}
