import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import '../src/dummy-application.js';

describe('DummyApplication', () => {
  let element;
  beforeEach(async () => {
    element = await fixture(html`<dummy-application></dummy-application>`);
  });

  it('renders a h1', () => {
    const h1 = element.shadowRoot.querySelector('h1');
    expect(h1).to.exist;
    expect(h1.textContent).to.equal('Welcome to My app');
  });

  it('authenticates via the mock login endpoint', async () => {
    const originalFetch = window.fetch;

    window.fetch = () =>
      Promise.resolve(
        new Response(
          JSON.stringify({ user: { email: 'user@example.com' } }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

    try {
      await element._handleLogin({
        detail: { email: 'user@example.com', password: 'secret123' },
      });

      await element.updateComplete;

      expect(element.isLoggedIn).to.be.true;
      const userInfo = element.shadowRoot.querySelector('.user-info span');
      expect(userInfo).to.exist;
      expect(userInfo.textContent).to.contain('user@example.com');
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('surfaces validation errors from the mock register endpoint', async () => {
    element._openRegistration();
    await element.updateComplete;
    const originalFetch = window.fetch;

    window.fetch = () =>
      Promise.resolve(
        new Response(
          JSON.stringify({ message: 'That email is already registered.' }),
          {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );

    try {
      await element._handleRegister({
        detail: { username: 'user@example.com', password: 'password123' },
      });

      await element.updateComplete;

      expect(element.isLoggedIn).to.be.false;
      expect(element.registerError).to.equal('That email is already registered.');
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('passes the a11y audit', async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});
