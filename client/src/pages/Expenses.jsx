import { useEffect, useMemo, useState } from 'react';
import { getCategories, getExpenses } from '../api';

const currency = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });

export default function Expenses() {
  const [categories, setCategories] = useState([]);
  const [month, setMonth] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getExpenses({ month: month || undefined, categoryId: categoryId || undefined })
      .then(setExpenses)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [month, categoryId]);

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  );

  const hasFilters = month || categoryId;

  return (
    <div>
      <div className="sheet filters">
        <div className="field">
          <label htmlFor="filter-month">Month</label>
          <input
            id="filter-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="filter-category">Category</label>
          <select
            id="filter-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button
            className="clear-link"
            type="button"
            onClick={() => {
              setMonth('');
              setCategoryId('');
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="sheet">
        {loading && <p className="load-state">Loading entries…</p>}

        {!loading && error && (
          <p className="empty-state">Couldn't load expenses: {error}</p>
        )}

        {!loading && !error && expenses.length === 0 && (
          <p className="empty-state">
            No entries {hasFilters ? 'match those filters' : 'yet'}.
          </p>
        )}

        {!loading && !error && expenses.length > 0 && (
          <>
            <table className="ledger">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="num">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td data-label="Date">{e.paymentDate}</td>
                    <td data-label="Description" className="name">{e.name}</td>
                    <td data-label="Category">
                      <span className="category-pill">{e.category}</span>
                    </td>
                    <td data-label="Amount" className="num">{currency.format(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ledger-total">
              <span className="label">Total</span>
              <span>{currency.format(total)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
