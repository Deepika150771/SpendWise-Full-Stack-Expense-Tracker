import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, transactionAPI } from '../../services/api';
import StatCard from './StatCard';
import { CategorySpendingChart, MonthlyTrendChart } from './SpendingChart';
import TransactionModal from '../Transactions/TransactionModal';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Plus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Utensils,
  Car,
  GraduationCap,
  ShoppingBag,
  FileText,
  Film,
  CircleDollarSign,
  Briefcase,
  Gift,
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

const DashboardView = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState('expense');

  const currency = user?.currency || '$';

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getStats();
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('[DashboardView] Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleOpenModal = (type = 'expense') => {
    setModalInitialType(type);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (data) => {
    await transactionAPI.create(data);
    fetchDashboardStats();
  };

  return (
    <div>
      {/* Dashboard Top Header */}
      <div className="dashboard-header">
        <div className="header-title-group">
          <h1>Welcome back, {user?.name || 'User'} 👋</h1>
          <p>Here is your financial overview & spending analysis</p>
        </div>

        <div className="quick-actions">
          <button
            className="btn btn-expense"
            onClick={() => handleOpenModal('expense')}
          >
            <Plus size={18} />
            <span>Add Expense</span>
          </button>

          <button
            className="btn btn-income"
            onClick={() => handleOpenModal('income')}
          >
            <Plus size={18} />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Income"
          amount={stats?.totalIncome || 0}
          currency={currency}
          subtext="Cumulative income recorded"
          icon={TrendingUp}
          color="#10b981"
          accent="linear-gradient(90deg, #10b981, #059669)"
        />

        <StatCard
          title="Total Expenses"
          amount={stats?.totalExpenses || 0}
          currency={currency}
          subtext={`Monthly: ${currency}${(stats?.monthlyExpenses || 0).toLocaleString()}`}
          icon={TrendingDown}
          color="#f43f5e"
          accent="linear-gradient(90deg, #ef4444, #dc2626)"
        />

        <StatCard
          title="Net Balance"
          amount={stats?.currentBalance || 0}
          currency={currency}
          subtext={
            (stats?.currentBalance || 0) >= 0
              ? 'Positive cash flow'
              : 'Deficit spending detected'
          }
          icon={Wallet}
          color="#6366f1"
          accent="linear-gradient(90deg, #6366f1, #a855f7)"
        />

        <StatCard
          title="Savings Rate"
          amount={stats?.savingsRate || 0}
          currency="%"
          subtext={`Target: 20%+ for financial stability`}
          icon={PiggyBank}
          color="#f7b731"
          accent="linear-gradient(90deg, #f7b731, #e67e22)"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Category Breakdown */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Category Spending</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Expense Distribution
            </span>
          </div>
          {loading ? (
            <p className="empty-state">Loading charts...</p>
          ) : (
            <CategorySpendingChart
              categoryData={stats?.categoryWiseSpending || []}
              currency={currency}
            />
          )}
        </div>

        {/* 6 Months Trend */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-title">Monthly Trends</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Income vs Expenses
            </span>
          </div>
          {loading ? (
            <p className="empty-state">Loading charts...</p>
          ) : (
            <MonthlyTrendChart
              trendData={stats?.monthlyTrends || []}
              currency={currency}
            />
          )}
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions + Insights */}
      <div className="charts-grid" style={{ marginBottom: 0 }}>
        {/* Recent Activity */}
        <div className="content-card">
          <div className="chart-card-header">
            <h3>Recent Activity</h3>
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              onClick={() => setActiveTab('transactions')}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <p className="empty-state">Loading activity...</p>
          ) : !stats?.recentTransactions || stats.recentTransactions.length === 0 ? (
            <div className="empty-state">
              <p>No recent transactions recorded yet.</p>
            </div>
          ) : (
            <div className="transactions-table-container">
              <table className="transactions-table">
                <tbody>
                  {stats.recentTransactions.map((tx) => {
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
                              <IconComponent size={18} />
                            </div>
                            <div>
                              <div className="tx-title">{tx.title}</div>
                              <div className="tx-description">
                                {new Date(tx.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <span className={`tx-amount ${isIncome ? 'income' : 'expense'}`}>
                            {isIncome ? '+' : '-'}{currency}
                            {tx.amount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Smart Financial Tips & Health */}
        <div className="content-card" style={{ background: 'var(--bg-card)' }}>
          <div className="chart-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} color="#a855f7" />
              Smart SpendWise Insights
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', color: '#10b981', marginBottom: 4 }}>
                Savings Health Check
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                You currently save approximately <strong>{stats?.savingsRate || 0}%</strong> of your incoming funds.
                Financial experts recommend reserving 20% for emergency funds and investments.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              <h4 style={{ fontSize: '0.95rem', color: '#6366f1', marginBottom: 4 }}>
                Budgeting Tip for Young Pros
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Track subscriptions under <strong>Bills</strong> &amp; <strong>Entertainment</strong>. Small recurring fees
                often account for over 15% of annual discretionary spend!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Quick Add */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        initialData={{ type: modalInitialType }}
      />
    </div>
  );
};

export default DashboardView;
