const express = require('express');
const router = express.Router();
const { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .post(protect, applyLeave)
  .get(protect, admin, getAllLeaves);

router.get('/me', protect, getMyLeaves);

router.route('/:id/status')
  .put(protect, admin, updateLeaveStatus);

module.exports = router;
