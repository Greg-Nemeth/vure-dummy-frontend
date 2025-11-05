import { html, LitElement } from 'lit';

class VulnerableDisplay extends LitElement {
  static get properties() {
    return {
      userInput: { type: String },
    };
  }

  constructor() {
    super();
    this.userInput = '';
  }

  render() {
    return html`
      <div>
        <h2>Vulnerable Component</h2>
        <p>User Input:</p>
        <div .innerHTML=${this.userInput}></div>
      </div>
    `;
  }
}

customElements.define('vulnerable-display', VulnerableDisplay);
