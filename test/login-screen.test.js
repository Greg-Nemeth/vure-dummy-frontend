import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';

import '../src/login-screen.js';

describe('LoginScreen', () => {
  it('dispatches login-submit with trimmed credentials when form is valid', async () => {
    const element = await fixture(html`<login-screen></login-screen>`);
    const emailInput = element.shadowRoot.getElementById('email');
    const passwordInput = element.shadowRoot.getElementById('password');
    const form = element.shadowRoot.querySelector('form');

    emailInput.value = ' user@example.com ';
    emailInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    passwordInput.value = 'secret123';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    const loginEvent = oneEvent(element, 'login-submit');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const { detail } = await loginEvent;
    expect(detail).to.deep.equal({ email: 'user@example.com', password: 'secret123' });
  });

  it('prevents form submission when required fields are empty', async () => {
    const element = await fixture(html`<login-screen></login-screen>`);
    const form = element.shadowRoot.querySelector('form');
    let submitted = false;
    element.addEventListener('login-submit', () => {
      submitted = true;
    });

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await element.updateComplete;
    expect(submitted).to.be.false;
    expect(form.checkValidity()).to.be.false;
  });

  it('passes the a11y audit', async () => {
    const element = await fixture(html`<login-screen></login-screen>`);
    await expect(element).shadowDom.to.be.accessible();
  });
});
