const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { getMemoryDbActive, MemoryUser, MemoryTransaction } = require('../config/memoryDb');

const getUserModel = () => (getMemoryDbActive() ? MemoryUser : User);
const getTransactionModel = () => (getMemoryDbActive() ? MemoryTransaction : Transaction);

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'spendwise_super_secret_jwt_key_2026_production',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, currency } = req.body;
    const UserModel = getUserModel();

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password',
      });
    }

    // Check if user exists
    const userExists = await UserModel.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists',
      });
    }

    // Create user
    const user = await UserModel.create({
      name,
      email: email.toLowerCase(),
      password,
      currency: currency || '$',
    });

    const token = generateToken(user._id || user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const UserModel = getUserModel();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id || user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const UserModel = getUserModel();
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or login Demo User with sample transactions
// @route   POST /api/auth/demo
// @access  Public
const demoLogin = async (req, res, next) => {
  try {
    const demoEmail = 'demo@spendwise.app';
    const UserModel = getUserModel();
    const TransactionModel = getTransactionModel();

    let user = await UserModel.findOne({ email: demoEmail });

    if (!user) {
      user = await UserModel.create({
        name: 'Alex Morgan',
        email: demoEmail,
        password: 'DemoUser123!',
        currency: '$',
      });

      const userId = user._id || user.id;
      const now = new Date();
      const createDate = (daysAgo) => {
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        return d;
      };

      const sampleTransactions = [
        { user: userId, type: 'income', title: 'Monthly Stipend / Salary', amount: 2800, category: 'Salary', description: 'Tech Internship Pay', date: createDate(25), paymentMethod: 'Bank Transfer' },
        { user: userId, type: 'income', title: 'Freelance Design Project', amount: 450, category: 'Freelance', description: 'UI Design for startup', date: createDate(12), paymentMethod: 'Bank Transfer' },
        { user: userId, type: 'income', title: 'Allowance Support', amount: 300, category: 'Allowance', description: 'Monthly allowance', date: createDate(2), paymentMethod: 'UPI' },
        { user: userId, type: 'expense', title: 'Grocery Shopping', amount: 145.80, category: 'Food', description: 'Organic produce', date: createDate(1), paymentMethod: 'Card' },
        { user: userId, type: 'expense', title: 'University Textbooks', amount: 89.50, category: 'Education', description: 'Algorithms textbook', date: createDate(3), paymentMethod: 'Card' },
        { user: userId, type: 'expense', title: 'Monthly Metro Pass', amount: 75.00, category: 'Travel', description: 'Transit pass', date: createDate(5), paymentMethod: 'Card' },
        { user: userId, type: 'expense', title: 'Netflix & Spotify Subscriptions', amount: 22.99, category: 'Entertainment', description: 'Streaming passes', date: createDate(7), paymentMethod: 'Card' },
        { user: userId, type: 'expense', title: 'Wi-Fi Fiber Bill', amount: 59.99, category: 'Bills', description: 'High speed internet', date: createDate(10), paymentMethod: 'Bank Transfer' },
        { user: userId, type: 'expense', title: 'Mechanical Keyboard', amount: 119.00, category: 'Shopping', description: 'Keychron wireless', date: createDate(14), paymentMethod: 'Card' },
        { user: userId, type: 'expense', title: 'Campus Coffee & Snacks', amount: 38.40, category: 'Food', description: 'Coffee shop', date: createDate(16), paymentMethod: 'Cash' },
        { user: userId, type: 'expense', title: 'Cinema IMAX Night', amount: 32.50, category: 'Entertainment', description: 'Movie tickets', date: createDate(20), paymentMethod: 'Card' },
      ];

      await TransactionModel.insertMany(sampleTransactions);
    }

    const userId = user._id || user.id;
    const token = generateToken(userId);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  demoLogin,
};
