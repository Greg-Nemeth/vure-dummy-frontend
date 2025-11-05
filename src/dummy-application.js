import { LitElement, html, css } from 'lit';
import './login-screen.js';
import './registration-screen.js';
import { login, register } from './services/auth-service.js';

const logo = new URL('../assets/open-wc-logo.svg', import.meta.url).href;
const AUTH_COOKIE_NAME = 'auth_user';

class DummyApplication extends LitElement {
  static properties = {
    header: { type: String },
    isLoggedIn: { type: Boolean },
    currentUser: { type: String },
    activeView: { type: String },
    loginError: { type: String },
    registerError: { type: String },
    authLoading: { type: Boolean },
  }

  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      margin: 0;
      background-color: var(--dummy-application-background-color, #f8fafc);
    }

    .navbar {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      font-size: 1.25rem;
      color: #1a2b42;
    }

    .navbar-brand img {
      width: 32px;
      height: 32px;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.95rem;
    }

    .nav-link {
      background: none;
      border: none;
      color: #475569;
      font-weight: 600;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      transition: color 0.2s, background-color 0.2s;
    }

    .nav-link:hover,
    .nav-link[aria-current='page'] {
      color: #1d4ed8;
      background-color: rgba(29, 78, 216, 0.16);
      font-weight: 700;
    }

    .navbar-login {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #475569;
      font-size: 0.875rem;
    }

    .logout-btn {
      background: #ef4444;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.2s;
    }

    .logout-btn:hover {
      background: #dc2626;
    }

    .login-btn {
      background: #2563eb;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
      transition: background-color 0.2s;
    }

    .login-btn:hover {
      background: #1d4ed8;
    }

    .login-popover {
      margin: 0;
      padding: 0;
      border: none;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(15, 23, 42, 0.15);
      background: transparent;
      backdrop-filter: blur(8px);
    }

    .login-popover::backdrop {
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(2px);
    }

    main {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      max-width: 960px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    .login-container {
      width: 100%;
      max-width: 420px;
      margin: 2rem auto;
    }

    .register-container {
      width: 100%;
      max-width: 460px;
      margin: 2rem auto;
    }

    .welcome-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }

    .logo {
      animation: app-logo-spin infinite 20s linear;
    }

    @keyframes app-logo-spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      text-align: center;
      padding: 1rem;
      color: #64748b;
    }

    .app-footer a {
      margin-left: 5px;
      color: #2563eb;
      text-decoration: underline;
    }
  `;

  constructor() {
    super();
    this.header = 'My app';
    this.isLoggedIn = false;
    this.currentUser = '';
    this.activeView = 'home';
    this.loginError = '';
    this.registerError = '';
    this.authLoading = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._restoreSessionFromCookie();
  }

  render() {
    return html`
      <nav class="navbar">
        <div class="navbar-brand">
          <img alt="open-wc logo" src=${logo} />
          ${this.header}
        </div>
        <div class="nav-links">
          <button
            class="nav-link"
            type="button"
            aria-current=${this.activeView === 'home' ? 'page' : 'false'}
            @click=${this._goHome}
          >
            Home
          </button>
          ${this.isLoggedIn
            ? null
            : html`
                <button
                  class="nav-link"
                  type="button"
                  aria-current=${this.activeView === 'register' ? 'page' : 'false'}
                  @click=${this._openRegistration}
                >
                  Register
                </button>
              `}
        </div>
        <div class="navbar-login">
          ${this.isLoggedIn
            ? html`
                <div class="user-info">
                  <span>Welcome, ${this.currentUser}</span>
                </div>
                <button class="logout-btn" @click=${this._handleLogout}>
                  Logout
                </button>
              `
            : html`
                <button
                  class="login-btn"
                  popovertarget="login-popover"
                  type="button"
                >
                  Sign In
                </button>
                <div
                  id="login-popover"
                  popover="auto"
                  class="login-popover"
                >
                  <login-screen
                    heading="Sign In"
                    .errorMessage=${this.loginError}
                    @login-submit=${this._handleLogin}
                  >
                    <a slot="helper" href="#">Forgot password?</a>
                    <a slot="action" href="#" @click=${this._openRegistration}>Create account</a>
                  </login-screen>
                </div>
              `}
        </div>
      </nav>

      <main>
        ${this.isLoggedIn
          ? html`
              <div class="welcome-content">
                <div class="logo"><img alt="open-wc logo" src=${logo} /></div>
                <h1>Welcome to ${this.header}!</h1>
                <p>
                  You are successfully logged in as
                  <strong>${this.currentUser}</strong>
                </p>
                <vulnerable-display .userInput=${this.currentUser}></vulnerable-display>

                <p>Edit <code>src/DummyApplication.js</code> and save to reload.</p>
                <a
                  class="app-link"
                  href="https://open-wc.org/guides/developing-components/code-examples/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Code examples
                </a>
              </div>
            `
          : this.activeView === 'register'
            ? html`
                <div class="register-container">
                  <registration-screen
                    heading="Create your account"
                    .errorMessage=${this.registerError}
                    @register-submit=${this._handleRegister}
                  >
                    <a slot="action" href="#" @click=${this._goHome}>Back to sign in</a>
                  </registration-screen>
                </div>
              `
            : html`
                <div class="welcome-content">
                  <div class="logo"><img alt="open-wc logo" src=${logo} /></div>
                  <h1>Welcome to ${this.header}</h1>
                  <p>Please sign in using the form in the navigation bar above.</p>
                </div>
              `}
      </main>

      <p class="app-footer">
        🚽 Made with love by
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/open-wc"
          >open-wc</a
        >.
      </p>
    `;
  }

  async _handleLogin(event) {
    const { email, password } = event.detail;
    this.loginError = '';
    this.authLoading = true;

    try {
      const { user } = await login({ email, password });
      this.isLoggedIn = true;
      this.currentUser = user?.email ?? email;
      this.activeView = 'home';
      this._hideLoginPopover();
    } catch (error) {
      this.loginError = error.message || 'Unable to sign in right now.';
    } finally {
      this.authLoading = false;
    }
  }

  async _handleRegister(event) {
    const { username, password } = event.detail;
    this.registerError = '';
    this.authLoading = true;

    try {
      const { user } = await register({ username, password });
      this.isLoggedIn = true;
      this.currentUser = user?.email ?? username;
      this.activeView = 'home';
      this.loginError = '';
      this._hideLoginPopover();
    } catch (error) {
      this.registerError = error.message || 'Unable to create account at the moment.';
    } finally {
      this.authLoading = false;
    }
  }

  _handleLogout() {
    this.isLoggedIn = false;
    this.currentUser = '';
    this.activeView = 'home';
    this.loginError = '';
    this.registerError = '';
    this._clearAuthCookie();
  }

  _openRegistration(event) {
    event?.preventDefault();
    if (this.isLoggedIn) {
      return;
    }
    this.activeView = 'register';
    this._hideLoginPopover();
    this.registerError = '';
  }

  _goHome(event) {
    event?.preventDefault();
    this.activeView = 'home';
    this._hideLoginPopover();
    this.registerError = '';
  }

  _hideLoginPopover() {
    const popover = this.shadowRoot?.getElementById('login-popover');
    if (popover && typeof popover.hidePopover === 'function') {
      popover.hidePopover();
    }
  }

  _restoreSessionFromCookie() {
    if (typeof document === 'undefined') {
      return;
    }
    const cookieValue = this._readCookie(AUTH_COOKIE_NAME);
    if (cookieValue) {
      this.isLoggedIn = true;
      this.currentUser = cookieValue;
    }
  }

  _clearAuthCookie() {
    if (typeof document === 'undefined') {
      return;
    }
    document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
  }

  _readCookie(name) {
    if (typeof document === 'undefined') {
      return '';
    }
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const entry of cookies) {
      if (entry.startsWith(`${name}=`)) {
        return decodeURIComponent(entry.slice(name.length + 1));
      }
    }
    return '';
  }
}

customElements.define('dummy-application', DummyApplication);