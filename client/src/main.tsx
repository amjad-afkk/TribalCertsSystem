import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

window.addEventListener('error', (e) => {
  console.error('MoTA Window Error:', e);
  const root = document.getElementById('root');
  if (root && root.children.length === 0) {
    root.innerHTML = `
      <div style="padding: 2rem; font-family: sans-serif; background: #fff5f5; border: 1px solid #feb2b2; margin: 2rem; border-radius: 8px;">
        <h3 style="color: #c53030;">Initialization Error</h3>
        <p style="color: #742a2a; margin-top: 0.5rem;">${e.message || 'An error occurred during startup.'}</p>
      </div>
    `;
  }
});

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
