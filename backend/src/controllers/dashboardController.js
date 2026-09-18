const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { getMemoryDbActive, MemoryTransaction } = require('../config/memoryDb');

const getTransactionModel = () => (getMemoryDbActive() ? MemoryTransaction : Transaction);

// Colors for category chart visualization
const CATEGORY_COLORS = {
  Food: '#FF6B6B',
  Travel: '#4ECDC4',
  Education: '#45B7D1',
  Shopping: '#96CEB4',
  Bills: '#FFEEAD',
  Entertainment: '#D4A5A5',
  Salary: '#2ECC71',
  Freelance: '#3498DB',
  Allowance: '#9B59B6',
  Savings: '#F1C40F',
  Investment: '#E67E22',
  Other: '#95A5A6',
};

// @desc    Get complete dashboard stats & analytics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const TransactionModel = getTransactionModel();
    const userId = getMemoryDbActive()
      ? req.user.id
      : new mongoose.Types.ObjectId(req.user.id);

    // 1. Calculate overall Total Income and Total Expenses
    const overallTotals = await TransactionModel.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;

    overallTotals.forEach((item) => {
      if (item._id === 'income') totalIncome = item.totalAmount;
      if (item._id === 'expense') totalExpenses = item.totalAmount;
    });

    const currentBalance = totalIncome - totalExpenses;

    // 2. Calculate Current Month Totals
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyTotals = await TransactionModel.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    let monthlyIncome = 0;
    let monthlyExpenses = 0;

    monthlyTotals.forEach((item) => {
      if (item._id === 'income') monthlyIncome = item.totalAmount;
      if (item._id === 'expense') monthlyExpenses = item.totalAmount;
    });

    // 3. Category-wise Spending (Expenses only)
    const categoryBreakdown = await TransactionModel.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
        },
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const categoryWiseSpending = categoryBreakdown.map((item) => {
      const percentage = totalExpenses > 0 ? (item.totalAmount / totalExpenses) * 100 : 0;
      return {
        category: item._id,
        amount: Math.round(item.totalAmount * 100) / 100,
        percentage: Math.round(percentage * 10) / 10,
        count: item.count,
        color: CATEGORY_COLORS[item._id] || '#A0AEC0',
      };
    });

    // 4. Monthly Spending & Income Trends (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrendAggregation = await TransactionModel.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear() % 100}`;
      trendMap[key] = { month: label, income: 0, expense: 0 };
    }

    monthlyTrendAggregation.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      if (trendMap[key]) {
        if (item._id.type === 'income') {
          trendMap[key].income = Math.round(item.total * 100) / 100;
        } else if (item._id.type === 'expense') {
          trendMap[key].expense = Math.round(item.total * 100) / 100;
        }
      }
    });

    const monthlyTrends = Object.values(trendMap);

    // 5. Recent 5 Transactions
    const recentTransactions = await TransactionModel.find({ user: userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    // 6. Savings Rate calculation
    const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        currentBalance: Math.round(currentBalance * 100) / 100,
        monthlyIncome: Math.round(monthlyIncome * 100) / 100,
        monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
        savingsRate: Math.round(savingsRate * 10) / 10,
        categoryWiseSpending,
        monthlyTrends,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
