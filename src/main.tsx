import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/roboto-serif/opsz.css';
import './styles/theme.css';
import './styles/global.css';
import { App } from './app/App';
import { registerSW } from 'virtual:pwa-register';
import { bindSettings } from './store/settings';

bindSettings();

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
