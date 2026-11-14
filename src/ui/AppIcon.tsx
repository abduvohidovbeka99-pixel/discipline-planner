import type { CSSProperties } from 'react';
import { PAL, type AppKey } from '../data/palette';
import { APP_ICONS } from './Icons';

interface Props {
  app: AppKey;
  size?: '' | 's' | 'xs';
  badge?: number;
}

/** iOS-like rounded gradient icon with optional red badge. */
export function AppIcon({ app, size = '', badge }: Props) {
  const [t1, t2] = PAL[app];
  return (
    <span className={'ico' + (size ? ' ' + size : '')} style={{ '--t1': t1, '--t2': t2 } as CSSProperties}>
      {APP_ICONS[app]}
      {badge ? <i className="bdg">{badge}</i> : null}
    </span>
  );
}
