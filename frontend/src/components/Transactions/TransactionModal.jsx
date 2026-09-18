import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Education',
  'Shopping',
  'Bills',
  'Entertainment',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Allowance',
  'Savings',
  'Investment',
  'Other',
];

const TransactionModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'expense');
      setTitle(initialData.title || '');
      setAmount(initialData.amount ? initialData.amount.toString() : '');
      setCategory(initialData.category || EXPENSE_CATEGORIES[0]);
      setDate(
        initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setPaymentMethod(initialData.paymentMethod || 'Card');
      setDescription(initialData.description || '');
    } else {
      resetForm('expense');
    }
  }, [initialData, isOpen]);

  const resetForm = (newType = 'expense') => {
    setType(newType);
    setTitle('');
    setAmount('');
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('Card');
    setDescription('');
    setError('');
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a transaction title');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        type,
        title: title.trim(),
        amount: numAmount,
        category,
        date,
        paymentMethod,
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {initialData ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button className="icon-action-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-error">{error}</div>}

            {/* Income / Expense Toggle */}
            <div className="type-toggle-group">
              <button
                type="button"
                className={`type-toggle-btn ${type === 'expense' ? 'active expense' : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                Expense
              </button>
              <button
                type="button"
                className={`type-toggle-btn ${type === 'income' ? 'active income' : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                Income
              </button>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Grocery Shopping, Monthly Rent, Salary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            {/* Amount & Date Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Category & Payment Method */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {currentCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Card">Card</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / Digital Wallet</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-input"
                rows="2"
                placeholder="Add optional notes or location info..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${type === 'income' ? 'btn-income' : 'btn-expense'}`}
              disabled={submitting}
            >
              <Check size={18} />
              <span>{submitting ? 'Saving...' : initialData ? 'Update Record' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
