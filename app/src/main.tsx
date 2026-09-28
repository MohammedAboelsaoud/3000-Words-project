import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../design-system/project/components/bundle.css';
import './styles/tokens.css';
import './styles/app.css';
import { App } from './App';

// Follow the system light/dark preference.
// A theme the host page already chose (data-theme on <html>) wins.
const media = window.matchMedia('(prefers-color-scheme: dark)');
const hostTheme = document.documentElement.dataset.theme;
const applyTheme = () => { document.documentElement.dataset.theme = media.matches ? 'dark' : 'light'; };
if (!hostTheme) {
  applyTheme();
  media.addEventListener('change', applyTheme);
}

if (import.meta.env.PROD && !import.meta.env.VITE_ARTIFACT) {
  try {
    navigator.serviceWorker?.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  } catch {
    // Service workers are unavailable in some frames and private windows.
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
