import { setupWorker } from 'msw/browser';
import { handlers } from './handlers.js';

export const worker = setupWorker(...handlers);

export function startBrowserWorker(options = {}) {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  return worker.start({
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
    onUnhandledRequest: 'bypass',
    ...options,
  });
}
