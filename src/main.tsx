import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Figtree (variable 300–900) for everything; Instrument Serif italic for a few accents
import '@fontsource-variable/figtree/wght.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource/instrument-serif/latin-ext-400-italic.css';
import App from './App';
import './index.css';
import { listenForInstall } from './utils/install';

// iOS Safari only applies :active styles when a touch listener exists,
// which the pressed effect on buttons relies on.
document.addEventListener('touchstart', () => {}, { passive: true });

// Before the first render: Chrome may offer its install prompt while the app is still loading
listenForInstall();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
