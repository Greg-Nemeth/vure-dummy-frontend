import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';

import '../src/registration-screen.js';

describe('RegistrationScreen', () => {
  it('dispatches register-submit with trimmed credentials when valid', async () => {
    const element = await fixture(html`<registration-screen></registration-screen>`);
    const usernameInput = element.shadowRoot.getElementById('username');
    const passwordInput = element.shadowRoot.getElementById('password');
    const form = element.shadowRoot.querySelector('form');

    usernameInput.value = ' user@example.com ';
    usernameInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    passwordInput.value = 'supersecret';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    const registerEvent = oneEvent(element, 'register-submit');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const { detail } = await registerEvent;
    expect(detail).to.deep.equal({ username: 'user@example.com', password: 'supersecret' });
  });

  it('prevents submission when fields are empty', async () => {
    const element = await fixture(html`<registration-screen></registration-screen>`);
    const form = element.shadowRoot.querySelector('form');
    let submitted = false;
    element.addEventListener('register-submit', () => {
      submitted = true;
    });

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await element.updateComplete;
    expect(submitted).to.be.false;
    expect(form.checkValidity()).to.be.false;
  });

  it('passes the a11y audit', async () => {
    const element = await fixture(html`<registration-screen></registration-screen>`);
    await expect(element).shadowDom.to.be.accessible();
  });
});
