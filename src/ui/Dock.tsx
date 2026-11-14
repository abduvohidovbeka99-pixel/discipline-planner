import { NavLink } from 'react-router-dom';
import { APPS } from '../data/apps';
import { AppIcon } from './AppIcon';

/** Bottom navigation with all sections (shown on inner screens; home is reached via the back button). */
export function Dock() {
  return (
    <nav className="dock" aria-label="Разделы">
      {APPS.map((a) => (
        <NavLink key={a.key} to={a.path} end className={({ isActive }) => 'dk' + (isActive ? ' on' : '')} onClick={() => window.scrollTo(0, 0)}>
          <AppIcon app={a.key} size="xs" />
          <small>{a.title}</small>
        </NavLink>
      ))}
    </nav>
  );
}
