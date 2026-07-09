const User = require('../models/User');
const Attendance = require('../models/Attendance');
const AuditLog = require('../models/AuditLog');

// @desc    Get all employees
// @route   GET /api/admin/employees
// @access  Private/Admin
const getEmployees = async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
};

// @desc    Get attendance of a specific employee
// @route   GET /api/admin/attendance/:employeeId
// @access  Private/Admin
const getEmployeeAttendance = async (req, res) => {
  const records = await Attendance.find({ employeeId: req.params.employeeId }).sort({ date: -1 });
  res.json(records);
};

// @desc    Remove an employee
// @route   DELETE /api/admin/employees/:id
// @access  Private/Admin
const removeEmployee = async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (user) {
    if (user.role === 'Admin') {
      return res.status(400).json({ message: 'Cannot remove another Admin' });
    }
    
    await user.deleteOne();
    res.json({ message: 'Employee removed successfully' });
  } else {
    res.status(404).json({ message: 'Employee not found' });
  }
};

// @desc    Add manual attendance
// @route   POST /api/admin/attendance/manual
// @access  Private/Admin
const addManualAttendance = async (req, res) => {
  const { employeeId, date, punchInTime, punchOutTime, reason, status } = req.body;
  
  const normDate = new Date(date);
  normDate.setHours(0, 0, 0, 0);

  let attendance = await Attendance.findOne({ employeeId, date: normDate });
  if (!attendance) {
    attendance = new Attendance({ employeeId, date: normDate });
  }

  if (punchInTime) attendance.punchIn = { time: punchInTime };
  if (punchOutTime) attendance.punchOut = { time: punchOutTime };
  
  attendance.isManualEntry = true;
  attendance.manualEntryReason = reason || 'Manual Update';
  attendance.manualEnteredBy = req.user._id;
  attendance.status = status || 'Present';

  await attendance.save();

  // Log action
  await AuditLog.create({
    adminId: req.user._id,
    action: 'MANUAL_ATTENDANCE',
    targetId: employeeId,
    details: { date: normDate, reason }
  });

  res.json(attendance);
};

// @desc    Convert overtime to days
// @route   POST /api/admin/attendance/convert-overtime
// @access  Private/Admin
const convertOvertime = async (req, res) => {
  const { employeeId, overtimeMinutesToConvert } = req.body;
  
  // Implementation logic goes here. 
  // Typically updates a balance in the User model or creates a "Leave Balance" transaction
  await AuditLog.create({
    adminId: req.user._id,
    action: 'OVERTIME_CONVERTED',
    targetId: employeeId,
    details: { convertedMinutes: overtimeMinutesToConvert }
  });

  res.json({ message: 'Overtime converted successfully' });
};

// @desc    Mark employee as on leave for a specific day
// @route   POST /api/admin/attendance/mark-leave
// @access  Private/Admin
const markAsLeave = async (req, res) => {
  const { employeeId, date, reason } = req.body;
  
  const normDate = new Date(date);
  normDate.setHours(0, 0, 0, 0);

  let attendance = await Attendance.findOne({ employeeId, date: normDate });
  if (!attendance) {
    attendance = new Attendance({ employeeId, date: normDate });
  }
  
  attendance.status = 'Leave';
  attendance.isManualEntry = true;
  attendance.manualEntryReason = reason;
  attendance.manualEnteredBy = req.user._id;

  await attendance.save();

  await AuditLog.create({
    adminId: req.user._id,
    action: 'MARKED_AS_LEAVE',
    targetId: employeeId,
    details: { date: normDate, reason }
  });

  res.json(attendance);
};

// @desc    Remove a specific holiday for all employees
// @route   POST /api/admin/attendance/remove-holiday
// @access  Private/Admin
const removeHoliday = async (req, res) => {
  const { date } = req.body;
  
  const normDate = new Date(date);
  normDate.setHours(0, 0, 0, 0);

  const result = await Attendance.deleteMany({ date: normDate, status: 'Holiday' });

  await AuditLog.create({
    adminId: req.user._id,
    action: 'REMOVED_HOLIDAY_FOR_ALL',
    targetId: req.user._id,
    details: { date: normDate, count: result.deletedCount }
  });

  res.json({ message: `Holiday removed successfully. ${result.deletedCount} attendance records deleted.` });
};

// @desc    Mark a specific day as a Holiday for all active employees
// @route   POST /api/admin/attendance/mark-holiday
// @access  Private/Admin
const markHoliday = async (req, res) => {
  const { date, reason } = req.body;
  
  const normDate = new Date(date);
  normDate.setHours(0, 0, 0, 0);

  const activeEmployees = await User.find({ isActive: true });
  const holidayRecords = [];

  for (const employee of activeEmployees) {
    let attendance = await Attendance.findOne({ employeeId: employee._id, date: normDate });
    if (!attendance) {
      attendance = new Attendance({ employeeId: employee._id, date: normDate });
    }
    
    attendance.status = 'Holiday';
    attendance.isManualEntry = true;
    attendance.manualEntryReason = reason || 'Public Holiday';
    attendance.manualEnteredBy = req.user._id;

    await attendance.save();
    holidayRecords.push(attendance);
  }

  await AuditLog.create({
    adminId: req.user._id,
    action: 'MARKED_HOLIDAY_FOR_ALL',
    targetId: req.user._id, // generic target
    details: { date: normDate, reason, count: holidayRecords.length }
  });

  res.json({ message: `Holiday marked successfully for ${holidayRecords.length} employees`, count: holidayRecords.length });
};

module.exports = { getEmployees, getEmployeeAttendance, removeEmployee, addManualAttendance, convertOvertime, markAsLeave, markHoliday, removeHoliday };
