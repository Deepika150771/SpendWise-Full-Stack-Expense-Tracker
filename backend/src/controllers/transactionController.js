const Transaction = require('../models/Transaction');
const { getMemoryDbActive, MemoryTransaction } = require('../config/memoryDb');

const getTransactionModel = () => (getMemoryDbActive() ? MemoryTransaction : Transaction);

// @desc    Get all transactions with search, filter & pagination
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      search,
      category,
      type,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 100,
    } = req.query;

    const TransactionModel = getTransactionModel();
    const query = { user: req.user.id };

    if (type && ['income', 'expense'].includes(type.toLowerCase())) {
      query.type = type.toLowerCase();
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
      ];
    }

    const sortField = ['date', 'amount', 'title'].includes(sortBy) ? sortBy : 'date';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortDirection };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await TransactionModel.countDocuments(query);
    const transactions = await TransactionModel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: transactions.length,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const TransactionModel = getTransactionModel();
    const transaction = await TransactionModel.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this transaction',
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { type, title, amount, category, description, date, paymentMethod } = req.body;
    const TransactionModel = getTransactionModel();

    if (!type || !title || amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        error: 'Please provide type, title, amount, and category',
      });
    }

    if (!['income', 'expense'].includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either income or expense',
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number',
      });
    }

    const transaction = await TransactionModel.create({
      user: req.user.id,
      type: type.toLowerCase(),
      title,
      amount: numAmount,
      category,
      description: description || '',
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'Card',
    });

    res.status(201).json({
      success: true,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const TransactionModel = getTransactionModel();
    let transaction = await TransactionModel.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this transaction',
      });
    }

    const { type, title, amount, category, description, date, paymentMethod } = req.body;

    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be a positive number',
        });
      }
      req.body.amount = numAmount;
    }

    if (date) {
      req.body.date = new Date(date);
    }

    transaction = await TransactionModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const TransactionModel = getTransactionModel();
    const transaction = await TransactionModel.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this transaction',
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category lists
// @route   GET /api/transactions/categories
// @access  Private
const getCategories = async (req, res) => {
  const TransactionModel = getTransactionModel();
  res.status(200).json({
    success: true,
    expenseCategories: TransactionModel.getExpenseCategories(),
    incomeCategories: TransactionModel.getIncomeCategories(),
  });
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
};
