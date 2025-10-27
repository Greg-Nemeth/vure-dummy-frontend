import { startBrowserWorker, worker } from '../src/mocks/browser.js';

before(async () => {
	try {
		await startBrowserWorker({ onUnhandledRequest: 'error' });
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('Failed to start MSW in tests:', error);
	}
});

afterEach(() => worker.resetHandlers());
after(() => worker.stop());
