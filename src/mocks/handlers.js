import { http, HttpResponse } from 'msw';

const USERS = new Map([
  ['user@example.com', { email: 'user@example.com', password: 'secret123' }],
]);

export const handlers = [
  http.post('/api/login', async ({ request }) => {
    const { email, password } = await request.json();
    const user = USERS.get(email);

    if (user) {
      return HttpResponse.json({
        user: { email },
        token: 'mock-token-123',
      });
    }

    return HttpResponse.json(
      { message: 'Invalid email or password.' },
      { status: 401 },
    );
  }),

  http.post('/api/register', async ({ request }) => {
    const { username, password } = await request.json();

    if (USERS.has(username)) {
      return HttpResponse.json(
        { message: 'That email is already registered.' },
        { status: 409 },
      );
    }

    if (password.length < 8) {
      return HttpResponse.json(
        { message: 'Password must be at least 8 characters long.' },
        { status: 400 },
      );
    }

    USERS.set(username, { email: username, password });

    return HttpResponse.json({
      user: { email: username },
      token: 'mock-token-register',
    }, { status: 201 });
  }),
];
