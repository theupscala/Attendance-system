const express = require('express');
const router = express.Router();
const { getEmployees, getEmployeeAttendance, removeEmployee, addManualAttendance, convertOvertime, markAsLeave, markHoliday, removeHoliday } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.route('/employees').get(protect, admin, getEmployees);
router.route('/employees/:id').delete(protect, admin, removeEmployee);
router.route('/attendance/manual').post(protect, admin, addManualAttendance);
router.route('/attendance/mark-leave').post(protect, admin, markAsLeave);
router.route('/attendance/mark-holiday').post(protect, admin, markHoliday);
router.route('/attendance/remove-holiday').post(protect, admin, removeHoliday);
router.route('/attendance/convert-overtime').post(protect, admin, convertOvertime);
router.route('/attendance/:employeeId').get(protect, admin, getEmployeeAttendance);

module.exports = router;
