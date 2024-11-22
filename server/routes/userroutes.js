const express = require('express');
const { protect, admin } = require('../middleware/authmiddleware');
const {
  registerUser,
  loginUser,
  getUserProfile,
  adminFunctionality,
} = require('../controllers/usercontroller');

const router = express.Router();

// User routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile); // Protected: Authenticated users only
router.get('/admin', protect, admin, adminFunctionality); // Protected: Admin users only

// Logout route
router.get('/logout', (req, res) => {
  res.redirect('/'); // Redirect to the homepage
});
module.exports = router;
