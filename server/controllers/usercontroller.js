const User = require('../model/user');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, dailyCalorieGoal } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).render('register', { message: 'Email is already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      dailyCalorieGoal,
    });

    if (user) {
      const token = generateToken(user._id);
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .redirect('/userroutes/profile');
    } else {
      res.status(400).render('register', { message: 'Failed to create user. Try again.' });
    }
  } catch (err) {
    res.status(500).render('register', { message: 'Error registering user. ' + err.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .redirect('/userroutes/profile');
    } else {
      res.status(401).render('login', { message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).render('login', { message: 'Error logging in user. ' + err.message });
  }
};

// Get User Profile
const getUserProfile = (req, res) => {
  res.render('profile', { user: req.user });
};

module.exports = { registerUser, loginUser, getUserProfile };
