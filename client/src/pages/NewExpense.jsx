import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getCategories, getExpenses, createExpense, updateExpense } from '../api';

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  name: '',
  amount: '',
  categoryId: '',
  paymentDate: today(),
};

export default function NewExpense() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const location = useLocation();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loadingExisting, setLoadingExisting] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { ok: bool, message: string }

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => setCategoriesError(err.message));
  }, []);

  // Prefill the form when editing. The category select is keyed by id, but
  // an expense from the API only carries the category NAME, so we resolve
  // the name to an id once categories have loaded.
  useEffect(() => {
    if (!isEdit || categories.length === 0) return;

    const applyExpense = (expense) => {
      const match = categories.find((c) => c.name === expense.category);
      setForm({
        name: expense.name ?? '',
        amount: String(expense.amount ?? ''),
        categoryId: match ? String(match.id) : '',
        paymentDate: (expense.paymentDate ?? today()).slice(0, 10),
      });
    };

    const passed = location.state?.expense;
    if (passed && String(passed.id) === String(id)) {
      applyExpense(passed);
      setLoadingExisting(false);
      return;
    }

    // Fallback for a direct link/refresh with no router state: fetch a
    // large page and find the matching entry.
    getExpenses({ page: 1, pageSize: 1000 })
      .then((result) => {
        const found = (result.items ?? []).find((e) => String(e.id) === String(id));
        if (found) {
          applyExpense(found);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => setStatus({ ok: false, message: err.message }))
      .finally(() => setLoadingExisting(false));
  }, [isEdit, id, categories, location.state]);

  useEffect(() => {
    if (isEdit) return;
    setForm((f) => (f.categoryId ? f : { ...f, categoryId: categories[0]?.id ? String(categories[0].id) : '' }));
  }, [categories, isEdit]);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    if (!form.name.trim() || !form.amount || !form.categoryId || !form.paymentDate) {
      setStatus({ ok: false, message: 'Fill in every field before saving.' });
      return;
    }

    const payload = {
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      categoryId: Number(form.categoryId),
      paymentDate: form.paymentDate,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateExpense(id, payload);
        navigate('/expenses');
      } else {
        await createExpense(payload);
        setStatus({ ok: true, message: 'Expense saved.' });
        setForm({ ...emptyForm, categoryId: form.categoryId, paymentDate: today() });
      }
    } catch (err) {
      setStatus({ ok: false, message: `Couldn't save that: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  }

  if (isEdit && loadingExisting) {
    return <p className="load-state">Loading entry…</p>;
  }

  if (isEdit && notFound) {
    return <p className="empty-state">Couldn't find that expense.</p>;
  }

  return (
    <form className="sheet entry-form" onSubmit={handleSubmit}>
      {isEdit && <p className="form-mode">Editing entry</p>}

      <div className="field">
        <label htmlFor="name">What was it for</label>
        <input
          id="name"
          type="text"
          placeholder="Groceries, petrol, rent…"
          value={form.name}
          onChange={update('name')}
        />
      </div>

      <div className="field-row">
        <div className="field amount-field">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={form.amount}
            onChange={update('amount')}
          />
        </div>
        <div className="field">
          <label htmlFor="date">Date paid</label>
          <input id="date" type="date" value={form.paymentDate} onChange={update('paymentDate')} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="category">Category</label>
        {categoriesError ? (
          <p className="status-msg err">Couldn't load categories: {categoriesError}</p>
        ) : (
          <select id="category" value={form.categoryId} onChange={update('categoryId')}>
            {categories.length === 0 && <option value="">Loading…</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="submit-row">
        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Save expense'}
        </button>
        {isEdit && (
          <button
            type="button"
            className="clear-link"
            onClick={() => navigate('/expenses')}
          >
            Cancel
          </button>
        )}
        {status && (
          <span className={`status-msg ${status.ok ? 'ok' : 'err'}`}>{status.message}</span>
        )}
      </div>
    </form>
  );
}
