const jwt = require('jsonwebtoken');
const User = require('../model/user');

const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.redirect('/userroutes/login'); // Redirect to login if token is missing
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    console.error('Error verifying token:', err.message);
    res.redirect('/userroutes/login'); // Redirect to login if token is invalid
  }
};

const setUser = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      console.error('Error setting user:', err.message);
    }
  }

  next();
};

module.exports = { protect, setUser };
