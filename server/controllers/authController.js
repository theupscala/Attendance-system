const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, employeeId, password } = req.body;

  const userExists = await User.findOne({ employeeId });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    employeeId,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      employeeId: user.employeeId,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { employeeId, password } = req.body;

  const user = await User.findOne({ employeeId });
  
  let isMatch = false;
  if (user && user.isActive) {
    isMatch = await user.matchPassword(password);
  } else {
    // Perform dummy hash comparison to prevent timing attacks
    // This ensures the server takes roughly the same time even if the user doesn't exist
    const dummyHash = '$2a$10$vI8aWBnX3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa';
    await bcrypt.compare(password || '', dummyHash);
  }

  if (user && user.isActive && isMatch) {
    res.json({
      _id: user._id,
      name: user.name,
      employeeId: user.employeeId,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid employee ID or password' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      employeeId: user.employeeId,
      role: user.role,
      department: user.department,
      shift: user.shift,
      photo: user.photo,
      isFieldWorker: user.isFieldWorker
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = { loginUser, getUserProfile, registerUser };
