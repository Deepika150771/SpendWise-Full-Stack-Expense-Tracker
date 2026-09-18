const bcrypt = require('bcryptjs');

// In-Memory Data Repositories
const users = [];
const transactions = [];

let isMemoryDbActive = false;

const setMemoryDbActive = (active) => {
  isMemoryDbActive = active;
};

const getMemoryDbActive = () => isMemoryDbActive;

// Helper ID Generator
const generateId = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

// Categories
const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Education', 'Shopping', 'Bills', 'Entertainment', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Allowance', 'Savings', 'Investment', 'Other'];

// Memory User Service
const MemoryUser = {
  findOne: async (filter) => {
    if (filter.email) {
      const user = users.find((u) => u.email.toLowerCase() === filter.email.toLowerCase());
      if (!user) return null;
      return {
        ...user,
        matchPassword: async (pwd) => await bcrypt.compare(pwd, user.password),
      };
    }
    return null;
  },

  findById: async (id) => {
    const user = users.find((u) => u._id === id || u.id === id);
    if (!user) return null;
    return {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
      select: function () { return this; },
    };
  },

  create: async (data) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const newUser = {
      _id: generateId(),
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      currency: data.currency || '$',
      createdAt: new Date(),
    };
    users.push(newUser);
    return {
      ...newUser,
      matchPassword: async (pwd) => await bcrypt.compare(pwd, newUser.password),
    };
  },
};

// Memory Transaction Service
const MemoryTransaction = {
  getExpenseCategories: () => EXPENSE_CATEGORIES,
  getIncomeCategories: () => INCOME_CATEGORIES,

  find: (query = {}) => {
    let result = [...transactions];

    if (query.user) {
      result = result.filter((t) => t.user.toString() === query.user.toString());
    }

    if (query.type) {
      result = result.filter((t) => t.type === query.type);
    }

    if (query.category && query.category !== 'All') {
      result = result.filter((t) => t.category === query.category);
    }

    if (query.date) {
      if (query.date.$gte) {
        result = result.filter((t) => new Date(t.date) >= new Date(query.date.$gte));
      }
      if (query.date.$lte) {
        result = result.filter((t) => new Date(t.date) <= new Date(query.date.$lte));
      }
    }

    if (query.$or && Array.isArray(query.$or)) {
      result = result.filter((t) => {
        return query.$or.some((condition) => {
          if (condition.title) return condition.title.test(t.title);
          if (condition.description) return condition.description.test(t.description || '');
          return false;
        });
      });
    }

    // Helper chainable methods
    const chainable = {
      sort: function (sortOpt = { date: -1 }) {
        const key = Object.keys(sortOpt)[0] || 'date';
        const dir = sortOpt[key] === 1 ? 1 : -1;
        result.sort((a, b) => {
          if (key === 'date') return (new Date(a.date) - new Date(b.date)) * dir;
          if (key === 'amount') return (a.amount - b.amount) * dir;
          if (key === 'title') return a.title.localeCompare(b.title) * dir;
          return 0;
        });
        return this;
      },
      skip: function (n = 0) {
        result = result.slice(n);
        return this;
      },
      limit: function (n = 100) {
        result = result.slice(0, n);
        return this;
      },
      then: function (resolve) {
        resolve(result);
      },
      exec: async function () {
        return result;
      },
    };

    return chainable;
  },

  countDocuments: async (query = {}) => {
    let result = [...transactions];
    if (query.user) result = result.filter((t) => t.user.toString() === query.user.toString());
    if (query.type) result = result.filter((t) => t.type === query.type);
    if (query.category && query.category !== 'All') result = result.filter((t) => t.category === query.category);
    if (query.$or && Array.isArray(query.$or)) {
      result = result.filter((t) => {
        return query.$or.some((c) => (c.title && c.title.test(t.title)) || (c.description && c.description.test(t.description || '')));
      });
    }
    return result.length;
  },

  findById: async (id) => {
    const tx = transactions.find((t) => t._id === id);
    if (!tx) return null;
    return {
      ...tx,
      deleteOne: async function () {
        const idx = transactions.findIndex((t) => t._id === id);
        if (idx !== -1) transactions.splice(idx, 1);
      },
    };
  },

  create: async (data) => {
    const newTx = {
      _id: generateId(),
      user: data.user,
      type: data.type,
      title: data.title,
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.description || '',
      date: data.date ? new Date(data.date) : new Date(),
      paymentMethod: data.paymentMethod || 'Card',
      createdAt: new Date(),
    };
    transactions.push(newTx);
    return newTx;
  },

  findByIdAndUpdate: async (id, updateData, options) => {
    const idx = transactions.findIndex((t) => t._id === id);
    if (idx === -1) return null;
    const updated = {
      ...transactions[idx],
      ...updateData.$set,
      updatedAt: new Date(),
    };
    transactions[idx] = updated;
    return updated;
  },

  insertMany: async (items) => {
    const inserted = items.map((item) => ({
      _id: generateId(),
      ...item,
      amount: parseFloat(item.amount),
      date: item.date ? new Date(item.date) : new Date(),
      createdAt: new Date(),
    }));
    transactions.push(...inserted);
    return inserted;
  },

  aggregate: async (pipeline) => {
    // Custom aggregations for stats calculation
    let current = [...transactions];

    for (const stage of pipeline) {
      if (stage.$match) {
        const match = stage.$match;
        current = current.filter((t) => {
          if (match.user && t.user.toString() !== match.user.toString()) return false;
          if (match.type && t.type !== match.type) return false;
          if (match.date) {
            if (match.date.$gte && new Date(t.date) < new Date(match.date.$gte)) return false;
            if (match.date.$lte && new Date(t.date) > new Date(match.date.$lte)) return false;
          }
          return true;
        });
      }

      if (stage.$group) {
        const group = stage.$group;
        const groups = {};

        current.forEach((item) => {
          let groupId;
          if (group._id === '$type') {
            groupId = item.type;
          } else if (group._id === '$category') {
            groupId = item.category;
          } else if (typeof group._id === 'object') {
            const d = new Date(item.date);
            groupId = `${d.getFullYear()}-${d.getMonth() + 1}-${item.type}`;
          }

          if (!groups[groupId]) {
            groups[groupId] = { _id: groupId, totalAmount: 0, count: 0, total: 0 };
            if (typeof group._id === 'object') {
              const d = new Date(item.date);
              groups[groupId]._id = {
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                type: item.type,
              };
            }
          }

          groups[groupId].totalAmount += item.amount;
          groups[groupId].total += item.amount;
          groups[groupId].count += 1;
        });

        current = Object.values(groups);
      }

      if (stage.$sort) {
        const sortKey = Object.keys(stage.$sort)[0];
        const dir = stage.$sort[sortKey];
        current.sort((a, b) => (a[sortKey] - b[sortKey]) * dir);
      }
    }

    return current;
  },
};

module.exports = {
  setMemoryDbActive,
  getMemoryDbActive,
  MemoryUser,
  MemoryTransaction,
};
