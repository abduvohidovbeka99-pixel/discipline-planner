import { Link } from 'react-router-dom';
import type { AppKey } from '../data/palette';
import { AppIcon } from './AppIcon';

/** Inner screen header: back button, small icon and title. */
export function ScreenHeader({ app, title }: { app: AppKey; title: string }) {
  return (
    <div className="apph">
      <Link className="back" to="/" aria-label="На главную" style={{ display: 'grid', placeItems: 'center', textDecoration: 'none' }}>
        ‹
      </Link>
      <AppIcon app={app} size="s" />
      <b>{title}</b>
    </div>
  );
}
