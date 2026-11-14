import { MONTHS } from '../../lib/dates';

interface Props {
  y: number;
  m: number;
  onPrev(): void;
  onNext(): void;
  onToday(): void;
}

export function MonthNav({ y, m, onPrev, onNext, onToday }: Props) {
  return (
    <div className="mnav">
      <button type="button" className="nav" onClick={onPrev} aria-label="Предыдущий месяц">
        ←
      </button>
      <div className="m">
        {MONTHS[m]} {y}
      </div>
      <button type="button" className="nav" onClick={onNext} aria-label="Следующий месяц">
        →
      </button>
      <button type="button" className="nav" onClick={onToday}>
        Сегодня
      </button>
    </div>
  );
}
