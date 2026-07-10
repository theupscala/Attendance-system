const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'fallback_secret',
    {
      expiresIn: '30d',
    }
  );
};

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { name, employeeId, password } = req.body;

    const userExists = await User.findOne({ employeeId });

    if (userExists) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    const user = await User.create({
      name,
      employeeId,
      password,
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
        token: generateToken(user._id),
      });
    }

    return res.status(400).json({
      message: 'Invalid user data',
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Auth user & get token
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    console.log('================================');
    console.log('LOGIN ATTEMPT');
    console.log('Employee ID:', employeeId);

    const user = await User.findOne({ employeeId });

    console.log('User Found:', !!user);

    let isMatch = false;

    if (user) {
      console.log('isActive:', user.isActive);

      if (typeof user.matchPassword !== 'function') {
        console.log('matchPassword method not found');
      }

      if (user.isActive) {
        isMatch = await user.matchPassword(password);
        console.log('Password Match:', isMatch);
      }
    }

    if (user && user.isActive && isMatch) {
      return res.json({
        _id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
        token: generateToken(user._id),
      });
    }

    return res.status(401).json({
      message: 'Invalid employee ID or password',
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      return res.json({
        _id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
        shift: user.shift,
        photo: user.photo,
        isFieldWorker: user.isFieldWorker,
      });
    }

    return res.status(404).json({
      message: 'User not found',
    });
  } catch (error) {
    console.error('PROFILE ERROR:', error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  loginUser,
  getUserProfile,
  registerUser,
};
