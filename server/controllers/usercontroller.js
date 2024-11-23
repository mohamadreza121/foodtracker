const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, dailyCalorieGoal } = req.body;

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Create a new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      dailyCalorieGoal,
    });

    if (user) {
      // Generate token
      const token = generateToken(user._id);

      // Redirect to profile after registration
      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        dailyCalorieGoal: user.dailyCalorieGoal || 2000,
        token,
        redirectTo: '/userroutes/profile', // Redirect to profile
      });
    } else {
      res.status(400).json({ message: 'Failed to create user. Please try again.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error registering user.', error: err.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);

      // Set the token as a cookie
      res
        .cookie('token', token, {
          httpOnly: true, // Makes the cookie inaccessible to JavaScript
          secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
          maxAge: 30 * 24 * 60 * 60 * 1000, // Token expiration (30 days)
        })
        .redirect('/userroutes/profile'); // Redirect to the profile page after login
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error logging in user.', error: err.message });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = req.user; // User is already added to req by `protect` middleware
    res.render('profile', { user }); // Render profile.ejs with user data
  } catch (err) {
    res.status(500).render('error', { message: 'Failed to fetch profile data.', error: err.message });
  }
};

// Admin-Only Functionality
const adminFunctionality = async (req, res) => {
  try {
    // Example functionality: List all users
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to perform admin action.', error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  adminFunctionality,
};
