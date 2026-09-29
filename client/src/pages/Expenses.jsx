import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getExpenses, deleteExpense } from '../api';

const currency = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });
const PAGE_SIZE = 10;

const toYm = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const toIso = (d) => d.toISOString().slice(0, 10);
const currentMonth = () => toYm(new Date());

function shiftMonth(ym, delta) {
  const [y, m] = ym.split('-').map(Number);
  return toYm(new Date(y, m - 1 + delta, 1));
}

function monthLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
}

// Parse "YYYY-MM-DD" by hand so timezones can't shift the day.
function parseIso(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function shortDate(iso) {
  return parseIso(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

function rangeLabel(startDate, endDate) {
  if (startDate && endDate) {
    const s = parseIso(startDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
    const e = parseIso(endDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${s} – ${e}`;
  }
  if (startDate) return `From ${parseIso(startDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  if (endDate) return `Up to ${parseIso(endDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  return 'Custom range';
}

// [1, 'gap-1', 4, 5, 6, 'gap-2', 12] style page list
function pageList(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = [...new Set([1, total, page - 1, page, page + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out = [];
  wanted.forEach((p, i) => {
    if (i > 0 && p - wanted[i - 1] > 1) out.push(`gap-${i}`);
    out.push(p);
  });
  return out;
}

// Safely coerce whatever the API sent for totalAmount into a real number,
// so a missing/odd field shows R0.00 instead of "NaN".
function safeAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function Expenses() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  // scope: 'month' | 'range' | 'all'
  const [scope, setScope] = useState('month');
  const [month, setMonth] = useState(currentMonth());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [data, setData] = useState(null); // { items, totalCount, totalAmount, totalPages }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getExpenses({
      page,
      pageSize: PAGE_SIZE,
      month: scope === 'month' ? month : undefined,
      startDate: scope === 'range' ? startDate || undefined : undefined,
      endDate: scope === 'range' ? endDate || undefined : undefined,
      categoryId: categoryId || undefined,
    })
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [scope, month, startDate, endDate, categoryId, page, reloadKey]);

  function selectMonthScope() {
    setScope('month');
    setMonth(currentMonth());
    setPage(1);
  }

  function selectRangeScope() {
    if (scope !== 'range') {
      // Default a sensible starting range: this calendar month.
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(toIso(first));
      setEndDate(toIso(now));
    }
    setScope('range');
    setPage(1);
  }

  function selectAllScope() {
    setScope('all');
    setPage(1);
  }

  function changeMonth(next) {
    setMonth(next);
    setPage(1);
  }

  function changeCategory(next) {
    setCategoryId(next);
    setPage(1);
  }

  async function handleDelete(expense) {
    if (!window.confirm(`Delete "${expense.name}"? This can't be undone.`)) return;
    setDeletingId(expense.id);
    try {
      await deleteExpense(expense.id);
      if (data.items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        setReloadKey((k) => k + 1);
      }
    } catch (err) {
      window.alert(`Couldn't delete that: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalAmount = safeAmount(data?.totalAmount);
  const scopeCategoryLabel = categoryId
    ? categories.find((c) => String(c.id) === String(categoryId))?.name
    : 'all categories';

  return (
    <div>
      <div className="scope-tabs">
        <button type="button" className={scope === 'month' ? 'active' : ''} onClick={selectMonthScope}>
          By month
        </button>
        <button type="button" className={scope === 'range' ? 'active' : ''} onClick={selectRangeScope}>
          Date range
        </button>
        <button type="button" className={scope === 'all' ? 'active' : ''} onClick={selectAllScope}>
          All time
        </button>
      </div>

      <div className="view-bar">
        {scope === 'month' && (
          <div className="month-nav">
            <button
              type="button"
              className="icon-btn"
              aria-label="Previous month"
              onClick={() => changeMonth(shiftMonth(month, -1))}
            >
              ‹
            </button>
            <h2>{monthLabel(month)}</h2>
            <button
              type="button"
              className="icon-btn"
              aria-label="Next month"
              onClick={() => changeMonth(shiftMonth(month, 1))}
            >
              ›
            </button>
            <input
              type="month"
              className="month-jump"
              aria-label="Jump to month"
              value={month}
              onChange={(e) => e.target.value && changeMonth(e.target.value)}
            />
          </div>
        )}

        {scope === 'range' && (
          <div className="range-nav">
            <label>
              From
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <label>
              To
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
              />
            </label>
          </div>
        )}

        {scope === 'all' && <h2 className="scope-title">All time</h2>}

        <select
          className="select-inline"
          aria-label="Category"
          value={categoryId}
          onChange={(e) => changeCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sheet summary">
        <div className="label">Total spent</div>
        <div className="amount">{data ? currency.format(totalAmount) : '—'}</div>
        {data && (
          <div className="count">
            {data.totalCount} {data.totalCount === 1 ? 'entry' : 'entries'} · {scopeCategoryLabel}
            {scope === 'range' && (startDate || endDate) ? ` · ${rangeLabel(startDate, endDate)}` : ''}
          </div>
        )}
      </div>

      <div className="sheet">
        {loading && !data && <p className="load-state">Loading entries…</p>}

        {error && <p className="empty-state">Couldn't load expenses: {error}</p>}

        {!error && data && items.length === 0 && (
          <p className="empty-state">Nothing recorded for this view.</p>
        )}

        {!error && items.length > 0 && (
          <ul className="entries" style={{ opacity: loading ? 0.55 : 1 }}>
            {items.map((e) => (
              <li className="entry" key={e.id}>
                <span className="entry-date">{shortDate(e.paymentDate)}</span>
                <div className="entry-main">
                  <div className="entry-name">{e.name}</div>
                  <span className="category-pill">{e.category}</span>
                </div>
                <span className="entry-amount">{currency.format(e.amount)}</span>
                <div className="entry-actions">
                  <button
                    type="button"
                    className="row-action"
                    onClick={() => navigate(`/edit/${e.id}`, { state: { expense: e } })}
                  >
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
                </div>
              </li>
            ))}
          </ul>
        )}

        {!error && totalPages > 1 && (
          <nav className="pagination" aria-label="Pages">
            <button
              type="button"
              className="page-btn"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ‹
            </button>
            {pageList(page, totalPages).map((p) =>
              typeof p === 'string' ? (
                <span key={p} className="page-gap">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`page-btn ${p === page ? 'current' : ''}`}
                  aria-current={p === page ? 'page' : undefined}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              className="page-btn"
              aria-label="Next page"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
