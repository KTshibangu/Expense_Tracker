import { useEffect, useState } from 'react';
import { getCategories, createExpense } from '../api';

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  name: '',
  amount: '',
  categoryId: '',
  paymentDate: today(),
};

export default function NewExpense() {
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); 

  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data);
        setForm((f) => (f.categoryId ? f : { ...f, categoryId: data[0]?.id ?? '' }));
      })
      .catch((err) => setCategoriesError(err.message));
  }, []);

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

    setSubmitting(true);
    try {
      await createExpense({
        name: form.name.trim(),
        amount: parseFloat(form.amount),
        categoryId: Number(form.categoryId),
        paymentDate: form.paymentDate,
      });
      setStatus({ ok: true, message: 'Expense saved.' });
      setForm({ ...emptyForm, categoryId: form.categoryId, paymentDate: today() });
    } catch (err) {
      setStatus({ ok: false, message: `Couldn't save that: ${err.message}` });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="sheet entry-form" onSubmit={handleSubmit}>
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
          {submitting ? 'Saving…' : 'Save expense'}
        </button>
        {status && (
          <span className={`status-msg ${status.ok ? 'ok' : 'err'}`}>{status.message}</span>
        )}
      </div>
    </form>
  );
}
