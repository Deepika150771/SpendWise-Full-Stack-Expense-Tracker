const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  demoLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/demo', demoLogin);
router.get('/me', protect, getMe);

module.exports = router;
