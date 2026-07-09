const express = require('express');
const router = express.Router();
const { punchIn, punchOut, getMyAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.route('/punch-in').post(protect, punchIn);
router.route('/punch-out').post(protect, punchOut);
router.route('/me').get(protect, getMyAttendance);

module.exports = router;
