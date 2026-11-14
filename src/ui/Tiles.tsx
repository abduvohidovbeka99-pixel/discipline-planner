import type { CSSProperties, ReactNode } from 'react';
import { tileColors } from '../data/palette';

export interface TileProps {
  label: ReactNode;
  icon: ReactNode;
  active?: boolean;
  small?: boolean;
  /** Index into the tile palette (`TL`). */
  color: number;
  onClick(): void;
}

/** A single colourful icon tile with a caption (replaces tab buttons). */
export function Tile({ label, icon, active, small, color, onClick }: TileProps) {
  const [t1, t2] = tileColors(color);
  return (
    <button type="button" className={'apt' + (active ? ' on' : '') + (small ? ' sm' : '')} onClick={onClick} aria-pressed={!!active}>
      <span className="ico" style={{ '--t1': t1, '--t2': t2 } as CSSProperties}>
        {icon}
      </span>
      <span className="lb">{label}</span>
    </button>
  );
}

export interface TileItem<K extends string> {
  key: K;
  label: ReactNode;
  icon: ReactNode;
}

interface TilesProps<K extends string> {
  items: TileItem<K>[];
  value: K | null;
  onChange(key: K): void;
}

/** Grid of tiles acting as a single-choice control (tabs, filters). */
export function Tiles<K extends string>({ items, value, onChange }: TilesProps<K>) {
  return (
    <div className="tiles" role="tablist">
      {items.map((it, i) => (
        <Tile key={it.key} label={it.label} icon={it.icon} active={it.key === value} color={i} onClick={() => onChange(it.key)} />
      ))}
    </div>
  );
}
