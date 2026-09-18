const mongoose = require('mongoose');

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

const ALL_CATEGORIES = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]));

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: ['income', 'expense'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a transaction title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ALL_CATEGORIES,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [250, 'Description cannot exceed 250 characters'],
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Card', 'Cash', 'UPI', 'Bank Transfer', 'Other'],
      default: 'Card',
    },
  },
  {
    timestamps: true,
  }
);

// Statics for helper categories
transactionSchema.statics.getExpenseCategories = () => EXPENSE_CATEGORIES;
transactionSchema.statics.getIncomeCategories = () => INCOME_CATEGORIES;

module.exports = mongoose.model('Transaction', transactionSchema);
