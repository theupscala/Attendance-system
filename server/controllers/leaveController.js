const Leave = require('../models/Leave');

// @desc    Apply for a leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;
  
  const leave = new Leave({
    employeeId: req.user._id,
    type,
    startDate,
    endDate,
    reason
  });

  const createdLeave = await leave.save();
  res.status(201).json(createdLeave);
};

// @desc    Get all leaves for logged-in user
// @route   GET /api/leaves/me
// @access  Private
const getMyLeaves = async (req, res) => {
  const leaves = await Leave.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
  res.json(leaves);
};

// @desc    Get all leaves
// @route   GET /api/leaves
// @access  Private/Admin
const getAllLeaves = async (req, res) => {
  const leaves = await Leave.find({}).populate('employeeId', 'name employeeId').sort({ createdAt: -1 });
  res.json(leaves);
};

// @desc    Update leave status
// @route   PUT /api/leaves/:id/status
// @access  Private/Admin
const updateLeaveStatus = async (req, res) => {
  const { status, adminComment } = req.body;
  const leave = await Leave.findById(req.params.id);

  if (leave) {
    leave.status = status;
    leave.adminComment = adminComment;
    leave.approvedBy = req.user._id;

    const updatedLeave = await leave.save();
    res.json(updatedLeave);
  } else {
    res.status(404).json({ message: 'Leave request not found' });
  }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus };
