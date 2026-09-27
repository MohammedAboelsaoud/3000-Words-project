import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../design-system/project/components/bundle.css';
import './styles/tokens.css';
import './styles/app.css';
import { App } from './App';

// Follow the system light/dark preference.
const media = window.matchMedia('(prefers-color-scheme: dark)');
const applyTheme = () => { document.documentElement.dataset.theme = media.matches ? 'dark' : 'light'; };
applyTheme();
media.addEventListener('change', applyTheme);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
