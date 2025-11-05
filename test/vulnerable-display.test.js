import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import '../src/vulnerable-display.js';

describe('VulnerableDisplay', () => {
  it('renders user input', async () => {
    const userInput = 'Hello, world!';
    const el = await fixture(html`<vulnerable-display .userInput=${userInput}></vulnerable-display>`);
    const div = el.shadowRoot.querySelector('div div');
    expect(div.innerHTML).to.equal(userInput);
  });
});
