import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

window.addEventListener('error', (e) => {
  console.error('MoTA Window Error:', e);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 2rem; font-family: sans-serif; background: #fff5f5; border: 1px solid #feb2b2; margin: 2rem; border-radius: 8px;">
        <h3 style="color: #c53030;">Application Error</h3>
        <p style="color: #742a2a; margin-top: 0.5rem;">${e.message || 'An error occurred during startup.'}</p>
        <pre style="color: #9b2c2c; font-size: 0.75rem; margin-top: 0.5rem; overflow-x: auto;">${e.error?.stack || ''}</pre>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('MoTA Unhandled Rejection:', e.reason);
});

try {
  const rootEl = document.getElementById('root');
  if (rootEl) {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
} catch (err: any) {
  console.error('Root render error:', err);
  const root = document.getElementById('root') || document.body;
  root.innerHTML = `
    <div style="padding: 2rem; font-family: sans-serif; background: #fff5f5; border: 1px solid #feb2b2; margin: 2rem; border-radius: 8px;">
      <h3 style="color: #c53030;">Startup Initialization Error</h3>
      <pre style="color: #742a2a; margin-top: 0.5rem;">${err?.stack || err?.message || err}</pre>
    </div>
  `;
}
