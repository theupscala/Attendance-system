const express = require('express');
const router = express.Router();
const { loginUser, getUserProfile, registerAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', loginUser);
router.post('/register-admin', registerAdmin);
router.get('/profile', protect, getUserProfile);

module.exports = router;
