import { LitElement, html, css } from 'lit';

export class RegistrationScreen extends LitElement {
  static properties = {
    heading: { type: String },
    username: { type: String },
    password: { type: String },
    errorMessage: { type: String, attribute: 'error-message' },
    _hasHelper: { state: true },
    _hasAction: { state: true },
  };

  constructor() {
    super();
    this.heading = 'Create your account';
    this.username = '';
    this.password = '';
    this.errorMessage = '';
    this._hasHelper = false;
    this._hasAction = false;
  }

  static styles = css`
    :host {
      display: block;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1f2933;
    }

    .card {
      background: white;
      border-radius: 16px;
      max-width: 460px;
      margin: 2rem auto;
      padding: 2.5rem 2.25rem;
      box-shadow: 0 10px 40px rgba(15, 23, 42, 0.12);
      border: 1px solid rgba(15, 23, 42, 0.08);
    }

    h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.625rem;
      line-height: 1.2;
      text-align: center;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.9375rem;
    }

    input {
      font: inherit;
      padding: 0.75rem 0.85rem;
      border-radius: 12px;
      border: 1px solid rgba(15, 23, 42, 0.18);
      background-color: #f8fafc;
      transition: border-color 200ms ease, box-shadow 200ms ease;
    }

    input:focus {
      outline: none;
      border-color: #7c3aed;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
      background-color: white;
    }

    button {
      appearance: none;
      border: none;
      border-radius: 999px;
      background: linear-gradient(135deg, #7c3aed, #6366f1);
      color: white;
      font-weight: 600;
      padding: 0.9rem 1.25rem;
      cursor: pointer;
      transition: transform 150ms ease, box-shadow 150ms ease;
    }

    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 24px rgba(99, 102, 241, 0.18);
    }

    button:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.28);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
      box-shadow: none;
    }

    .helper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
      color: #52606d;
    }

    .helper[hidden] {
      display: none;
    }

    ::slotted(a) {
      color: #7c3aed;
      text-decoration: none;
      font-weight: 600;
    }

    ::slotted(a:hover) {
      text-decoration: underline;
    }

    .inputs {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .error {
      margin: -0.25rem 0 0;
      padding: 0.75rem;
      border-radius: 12px;
      background: rgba(220, 38, 38, 0.12);
      color: #b91c1c;
      font-size: 0.875rem;
    }
  `;

  render() {
    return html`
      <section class="card">
        <h2 id="register-heading">${this.heading}</h2>
        <form aria-labelledby="register-heading" @submit=${this._handleSubmit}>
          <div class="inputs">
            <label for="username">
              Email address
              <input
                id="username"
                name="username"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                .value=${this.username}
                required
                @input=${this._handleInput}
              />
            </label>

            <label for="password">
              Password
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="new-password"
                minlength="8"
                placeholder="At least 8 characters"
                .value=${this.password}
                required
                @input=${this._handleInput}
              />
            </label>
          </div>

          ${this.errorMessage
            ? html`<p class="error" role="alert">${this.errorMessage}</p>`
            : null}

          <div class="helper" ?hidden=${!(this._hasHelper || this._hasAction)}>
            <slot name="helper" @slotchange=${this._onHelperSlotChange}></slot>
            <slot name="action" @slotchange=${this._onActionSlotChange}></slot>
          </div>

          <button type="submit">Create account</button>
        </form>
      </section>
    `;
  }

  _handleInput(event) {
    const { name, value } = event.target;
    if (name === 'username') {
      this.username = value;
    }
    if (name === 'password') {
      this.password = value;
    }
    this.errorMessage = '';
  }

  _handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const detail = {
      username: this.username.trim(),
      password: this.password,
    };

    this.dispatchEvent(
      new CustomEvent('register-submit', {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  _onHelperSlotChange(event) {
    this._hasHelper = event.target.assignedNodes({ flatten: true }).length > 0;
  }

  _onActionSlotChange(event) {
    this._hasAction = event.target.assignedNodes({ flatten: true }).length > 0;
  }
}

customElements.define('registration-screen', RegistrationScreen);
