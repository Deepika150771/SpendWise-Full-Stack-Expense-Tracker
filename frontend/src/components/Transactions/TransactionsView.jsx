import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../../services/api';
import TransactionModal from './TransactionModal';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Download,
  ArrowUpDown,
  Utensils,
  Car,
  GraduationCap,
  ShoppingBag,
  FileText,
  Film,
  Briefcase,
  Gift,
  PiggyBank,
  TrendingUp,
  CircleDollarSign,
  Calendar,
} from 'lucide-react';

const CATEGORY_ICONS = {
  Food: Utensils,
  Travel: Car,
  Education: GraduationCap,
  Shopping: ShoppingBag,
  Bills: FileText,
  Entertainment: Film,
  Salary: Briefcase,
  Freelance: TrendingUp,
  Allowance: Gift,
  Savings: PiggyBank,
  Investment: CircleDollarSign,
  Other: CircleDollarSign,
};

const CATEGORY_COLORS = {
  Food: '#ff6b6b',
  Travel: '#4ecdc4',
  Education: '#45b7d1',
  Shopping: '#f7b731',
  Bills: '#a78bfa',
  Entertainment: '#ff7675',
  Salary: '#2ecc71',
  Freelance: '#3498db',
  Allowance: '#9b59b6',
  Savings: '#f1c40f',
  Investment: '#e67e22',
  Other: '#95a5a6',
};

const TransactionsView = ({ currency = '$', onDataChange }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        category: category !== 'All' ? category : undefined,
        type: type !== 'All' ? type.toLowerCase() : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
      };

      const res = await transactionAPI.getAll(params);
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error('[TransactionsView] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, category, type, startDate, endDate, sortBy, sortOrder]);

  const handleSaveTransaction = async (data) => {
    if (editingTransaction) {
      await transactionAPI.update(editingTransaction._id, data);
    } else {
      await transactionAPI.create(data);
    }
    fetchTransactions();
    if (onDataChange) onDataChange();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      try {
        await transactionAPI.delete(id);
        fetchTransactions();
        if (onDataChange) onDataChange();
      } catch (err) {
        alert('Failed to delete transaction.');
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  // Export filtered transactions to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['Date', 'Type', 'Title', 'Category', 'Amount', 'Payment Method', 'Description'];
    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.type.toUpperCase(),
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      t.amount,
      t.paymentMethod || 'Card',
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SpendWise_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="content-card">
      <div className="dashboard-header" style={{ marginBottom: 20 }}>
        <div>
          <h2>Transaction History</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage and analyze your income & expense records
          </p>
        </div>

        <div className="quick-actions">
          <button className="btn btn-secondary" onClick={handleExportCSV} title="Export CSV">
            <Download size={18} />
            <span>Export CSV</span>
          </button>

          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="toolbar">
        {/* Search */}
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by title or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="filter-group">
          {/* Category Filter */}
          <select
            className="select-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Education">Education</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Salary">Salary</option>
            <option value="Freelance">Freelance</option>
            <option value="Allowance">Allowance</option>
            <option value="Savings">Savings</option>
            <option value="Other">Other</option>
          </select>

          {/* Type Filter */}
          <select
            className="select-field"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          {/* Sort Selector */}
          <select
            className="select-field"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              setSortBy(sb);
              setSortOrder(so);
            }}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Transactions List Table */}
      {loading ? (
        <div className="empty-state">
          <p>Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💸</div>
          <h3>No transactions found</h3>
          <p style={{ marginTop: 4 }}>Try adjusting your search criteria or add a new record.</p>
        </div>
      ) : (
        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Category</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const IconComponent = CATEGORY_ICONS[tx.category] || CircleDollarSign;
                const catColor = CATEGORY_COLORS[tx.category] || '#94a3b8';
                const isIncome = tx.type === 'income';

                return (
                  <tr key={tx._id} className="transaction-row">
                    <td>
                      <div className="tx-icon-title">
                        <div
                          className="tx-category-icon"
                          style={{
                            backgroundColor: `${catColor}20`,
                            color: catColor,
                          }}
                        >
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <div className="tx-title">{tx.title}</div>
                          {tx.description && <div className="tx-description">{tx.description}</div>}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: `${catColor}15`,
                          color: catColor,
                        }}
                      >
                        {tx.category}
                      </span>
                    </td>

                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {formatDate(tx.date)}
                    </td>

                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-input)' }}>
                        {tx.paymentMethod || 'Card'}
                      </span>
                    </td>

                    <td>
                      <span className={`tx-amount ${isIncome ? 'income' : 'expense'}`}>
                        {isIncome ? '+' : '-'}{currency}
                        {tx.amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="icon-action-btn"
                          onClick={() => handleOpenEditModal(tx)}
                          title="Edit Transaction"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          className="icon-action-btn delete"
                          onClick={() => handleDelete(tx._id)}
                          title="Delete Transaction"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />
    </div>
  );
};

export default TransactionsView;
