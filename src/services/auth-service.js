const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export async function login({ email, password }) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(response);
}

export async function register({ username, password }) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ username, password }),
  });

  return handleResponse(response);
}
