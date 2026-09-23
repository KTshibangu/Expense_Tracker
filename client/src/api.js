const BASE = '/api';

async function handle(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getCategories() {
  const res = await fetch(`${BASE}/categories`);
  return handle(res);
}

export async function getExpenses({ page = 1, pageSize = 20, month, categoryId } = {}) {
  const params = new URLSearchParams();
  params.set('page', page);
  params.set('pageSize', pageSize);
  if (month) params.set('month', month);
  if (categoryId) params.set('categoryId', categoryId);
  const res = await fetch(`${BASE}/expenses?${params.toString()}`);
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

export async function updateExpense(id, expense) {
  const res = await fetch(`${BASE}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: Number(id), ...expense }),
  });
  return handle(res);
}

export async function deleteExpense(id) {
  const res = await fetch(`${BASE}/expenses/${id}`, {
    method: 'DELETE',
  });
  return handle(res);
}
