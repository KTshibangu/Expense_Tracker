const BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'expenseTracker.token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function handle(res) {
  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After');
    throw new Error(
      retryAfter
        ? `Too many requests. Try again in ${retryAfter} seconds.`
        : 'Too many requests. Please try again shortly.'
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Fetch wrapper that attaches the JWT and clears it on a 401, so an expired
// or invalid token sends the user back to /login rather than showing a
// confusing "request failed" error.
async function authFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    setToken(null);
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Your session expired. Please log in again.');
  }

  return handle(res);
}

// ---------- Auth (no token required) ----------

export async function register({ name, email, password }) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return handle(res);
}

export async function login({ email, password }) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handle(res);
  if (!data?.token) {
    throw new Error("Login succeeded but no token was returned — check the response shape.");
  }
  setToken(data.token);
  return data;
}

// ---------- Categories ----------

export async function getCategories() {
  return authFetch('/categories');
}

// ---------- Expenses ----------

export async function getExpense(id) {
  return authFetch(`/expenses/${id}`);
}

export async function getExpenses({ page = 1, pageSize = 20, month, startDate, endDate, categoryId } = {}) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('pageSize', pageSize);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  if (!startDate && !endDate && month) params.set('month', month);
  if (categoryId) params.set('categoryId', categoryId);
  return authFetch(`/expenses?${params.toString()}`);
}

export async function createExpense(expense) {
  return authFetch('/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
}

export async function updateExpense(id, expense) {
  return authFetch(`/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: Number(id), ...expense }),
  });
}

export async function deleteExpense(id) {
  return authFetch(`/expenses/${id}`, { method: 'DELETE' });
}
