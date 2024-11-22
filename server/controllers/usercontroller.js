const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, role, dailyCalorieGoal } = req.body;

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      dailyCalorieGoal,
    });

    if (user) {
      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dailyCalorieGoal: user.dailyCalorieGoal || 2000, // Default to 2000 if not set
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dailyCalorieGoal: user.dailyCalorieGoal || 2000,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error logging in user', error: err.message });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = req.user; // User is already added to req by `protect` middleware
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      dailyCalorieGoal: user.dailyCalorieGoal || 2000, // Default value if not set
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile data', error: err.message });
  }
};

// Admin-Only Functionality
const adminFunctionality = async (req, res) => {
  try {
    // Example functionality: List all users
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to perform admin action', error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  adminFunctionality,
};
