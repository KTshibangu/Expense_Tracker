import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getExpenses, deleteExpense } from '../api';

const currency = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });
const PAGE_SIZE = 15;

export default function Expenses() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [month, setMonth] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Reset to page 1 whenever a filter changes, so you don't land on an
  // out-of-range page for the new filter.
  useEffect(() => {
    setPage(1);
  }, [month, categoryId]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getExpenses({ page, pageSize: PAGE_SIZE, month: month || undefined, categoryId: categoryId || undefined })
      .then((result) => {
        setItems(result.items ?? []);
        setTotalCount(result.totalCount ?? 0);
        setTotalPages(result.totalPages ?? 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, month, categoryId]);

  const total = items.reduce((sum, e) => sum + Number(e.amount), 0);
  const hasFilters = month || categoryId;

  function handleEdit(expense) {
    navigate(`/edit/${expense.id}`, { state: { expense } });
  }

  async function handleDelete(expense) {
    if (!window.confirm(`Delete "${expense.name}"? This can't be undone.`)) return;
    setDeletingId(expense.id);
    try {
      await deleteExpense(expense.id);
      // If we just deleted the only item on a page beyond page 1, step back
      // a page; otherwise just refetch the current page.
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        const result = await getExpenses({
          page,
          pageSize: PAGE_SIZE,
          month: month || undefined,
          categoryId: categoryId || undefined,
        });
        setItems(result.items ?? []);
        setTotalCount(result.totalCount ?? 0);
        setTotalPages(result.totalPages ?? 1);
      }
    } catch (err) {
      window.alert(`Couldn't delete that: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

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

        {!loading && !error && items.length === 0 && (
          <p className="empty-state">
            No entries {hasFilters ? 'match those filters' : 'yet'}.
          </p>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <table className="ledger">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th className="num">Amount</th>
                  <th className="actions-head"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id}>
                    <td data-label="Date">{e.paymentDate}</td>
                    <td data-label="Description" className="name">{e.name}</td>
                    <td data-label="Category">
                      <span className="category-pill">{e.category}</span>
                    </td>
                    <td data-label="Amount" className="num">{currency.format(e.amount)}</td>
                    <td data-label="Actions" className="actions">
                      <button type="button" className="row-action" onClick={() => handleEdit(e)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="row-action danger"
                        disabled={deletingId === e.id}
                        onClick={() => handleDelete(e)}
                      >
                        {deletingId === e.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ledger-total">
              <span className="label">Page total</span>
              <span>{currency.format(total)}</span>
            </div>

            <div className="pagination">
              <button
                type="button"
                className="row-action"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </button>
              <span className="pagination-status">
                Page {page} of {totalPages} · {totalCount} entries
              </span>
              <button
                type="button"
                className="row-action"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
