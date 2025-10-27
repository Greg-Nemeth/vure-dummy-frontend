<p align="center">
  <img width="200" src="https://open-wc.org/hero.png"></img>
</p>

## Open-wc Starter App

[![Built with open-wc recommendations](https://img.shields.io/badge/built%20with-open--wc-blue.svg)](https://github.com/open-wc)

## Quickstart

To get started:

```bash
npm init @open-wc
# requires node 10 & npm 6 or higher
```

## Scripts

- `start` runs your app for development, reloading on file changes
- `start:build` runs your app after it has been built using the build command
- `build` builds your app and outputs it in your `dist` directory
- `test` runs your test suite with Web Test Runner
- `lint` runs the linter for your project
- `format` fixes linting and formatting errors

## Mock API workflow

- The dev server (`npm start`) automatically spins up a [Mock Service Worker](https://mswjs.io) instance. Requests to `/api/login` and `/api/register` are intercepted and resolved with the mocks declared in `src/mocks/handlers.js`.
- Update or extend the handlers in that file to model additional endpoints. State is stored in-memory, so restarting the dev server resets the mock database.
- Unit tests stub `fetch` per scenario, so they remain deterministic; browser-based manual testing continues to rely on MSW.
- The generated `mockServiceWorker.js` file lives at the project root. Make sure it is served alongside `index.html` when previewing the built app.

## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.
