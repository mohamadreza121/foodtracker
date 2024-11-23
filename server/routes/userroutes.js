const express = require('express');
const { protect } = require('../middleware/authmiddleware');
const {
  registerUser,
  loginUser,
} = require('../controllers/usercontroller');

const router = express.Router();

// GET /register - Render the registration form
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

// GET /login - Render the login form
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// GET /profile - Render profile page with user data
router.get('/profile', protect, (req, res) => {
  res.render('profile', { user: req.user }); // Pass `req.user` to the template
});

// User routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('token'); // Clear the JWT token from cookies
  res.redirect('/'); // Redirect to the homepage
});

module.exports = router;
