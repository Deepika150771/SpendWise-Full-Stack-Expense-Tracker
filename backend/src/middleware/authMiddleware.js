const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getMemoryDbActive, MemoryUser } = require('../config/memoryDb');

const getUserModel = () => (getMemoryDbActive() ? MemoryUser : User);

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'spendwise_super_secret_jwt_key_2026_production'
      );

      const UserModel = getUserModel();
      req.user = await UserModel.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User account no longer exists',
        });
      }

      // Ensure id property exists on req.user
      req.user.id = req.user._id || req.user.id;

      next();
    } catch (err) {
      console.error('[AuthMiddleware] Token verification error:', err.message);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token failed or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no authorization token provided',
    });
  }
};

module.exports = { protect };
