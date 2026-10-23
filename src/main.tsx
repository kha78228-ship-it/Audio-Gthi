import './utils/toast';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/tracksQueryService';
import App from './App.tsx';
import './index.css';

// Global Google Maps JS SDK authentication failure & cross-origin script error guard
if (typeof window !== 'undefined') {
  (window as any).gm_authFailure = () => {
    window.dispatchEvent(new CustomEvent('haevy-gmp-auth-error'));
  };

  window.addEventListener(
    'error',
    (event: ErrorEvent) => {
      const msg = String(event?.message || '');
      if (
        msg === 'Script error.' ||
        msg.includes('InvalidKeyMapError') ||
        msg.includes('Google Maps JavaScript API')
      ) {
        window.dispatchEvent(new CustomEvent('haevy-gmp-auth-error'));
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  const originalConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const joined = args.map((a) => (typeof a === 'string' ? a : '')).join(' ');
    if (
      joined.includes('InvalidKeyMapError') ||
      joined.includes('ApiNotActivatedMapError') ||
      joined.includes('RefererNotAllowedMapError') ||
      joined.includes('Google Maps JavaScript API error')
    ) {
      window.dispatchEvent(new CustomEvent('haevy-gmp-auth-error'));
      console.warn('[Haevy Maps] Google Maps API key is invalid or placeholder; falling back to Haevy Vector Map.');
      return;
    }
    originalConsoleError(...args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);

