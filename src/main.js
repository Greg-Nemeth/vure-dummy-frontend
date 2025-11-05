async function bootstrap() {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    const { startBrowserWorker } = await import('./mocks/browser.js');
    await startBrowserWorker();
  }

  await import('./dummy-application.js');
  await import('./vulnerable-display.js');
}

bootstrap();
