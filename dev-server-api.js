import { randomUUID } from 'node:crypto';

const USERS = new Map([
  [
    'user@example.com',
    { email: 'user@example.com', password: 'secret123', token: 'mock-token-123' },
  ],
]);

const AUTH_COOKIE_NAME = 'auth_user';
const AUTH_COOKIE_MAX_AGE = 60 * 60; // one hour

function createToken() {
  return `mock-${randomUUID()}`;
}

function setAuthCookie(ctx, value) {
  const encodedValue = encodeURIComponent(value);
  const cookie = `${AUTH_COOKIE_NAME}=${encodedValue}; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
  ctx.append('Set-Cookie', cookie);
}

async function readJsonBody(ctx) {
  if (ctx.request.body) {
    return ctx.request.body;
  }

  let data = '';
  for await (const chunk of ctx.req) {
    data += chunk;
  }

  const trimmed = data.trim();
  if (!trimmed) {
    return {};
  }

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    ctx.status = 400;
    ctx.set('Content-Type', 'application/json');
    ctx.body = JSON.stringify({ message: 'Invalid JSON payload.' });
    return null;
  }
}

export function apiMockMiddleware() {
  return async function api(ctx, next) {
    if (!ctx.path.startsWith('/api/')) {
      return next();
    }

    if (!['POST'].includes(ctx.method)) {
      ctx.status = 405;
      ctx.set('Allow', 'POST');
      ctx.body = '';
      return;
    }

    const payload = await readJsonBody(ctx);
    if (payload === null) {
      return;
    }

    if (ctx.path === '/api/login') {
      const { email, password } = payload;
      if (!email || !password) {
        ctx.status = 400;
        ctx.set('Content-Type', 'application/json');
        ctx.body = JSON.stringify({ message: 'Email and password are required.' });
        return;
      }

      const user = USERS.get(email);
      if (!user || user.password !== password) {
        ctx.status = 401;
        ctx.set('Content-Type', 'application/json');
        ctx.body = JSON.stringify({ message: 'Invalid email or password.' });
        return;
      }

  const response = { user: { email: user.email }, token: user.token };
  setAuthCookie(ctx, user.email);
      ctx.status = 200;
      ctx.set('Content-Type', 'application/json');
      ctx.body = JSON.stringify(response);
      return;
    }

    if (ctx.path === '/api/register') {
      const { username, password } = payload;
      if (!username || !password) {
        ctx.status = 400;
        ctx.set('Content-Type', 'application/json');
        ctx.body = JSON.stringify({ message: 'Username and password are required.' });
        return;
      }

      if (password.length < 8) {
        ctx.status = 422;
        ctx.set('Content-Type', 'application/json');
        ctx.body = JSON.stringify({ message: 'Password must be at least 8 characters long.' });
        return;
      }

      if (USERS.has(username)) {
        ctx.status = 409;
        ctx.set('Content-Type', 'application/json');
        ctx.body = JSON.stringify({ message: 'User already exists.' });
        return;
      }

      const token = createToken();
      USERS.set(username, { email: username, password, token });
  setAuthCookie(ctx, username);
      ctx.status = 201;
      ctx.set('Content-Type', 'application/json');
      ctx.body = JSON.stringify({ user: { email: username }, token });
      return;
    }

    ctx.status = 404;
    ctx.body = '';
  };
}
