const BASE = '/api';

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${BASE}/categories`);
  return handle(res);
}

export async function getExpenses({ month, categoryId } = {}) {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (categoryId) params.set('categoryId', categoryId);
  const qs = params.toString();
  const res = await fetch(`${BASE}/expenses${qs ? `?${qs}` : ''}`);
  return handle(res);
}

export async function createExpense(expense) {
  const res = await fetch(`${BASE}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  return handle(res);
}
