const express = require('express');
const { protect } = require('../middleware/authmiddleware');
const { addFood, getFoods, deleteFood } = require('../controllers/foodcontroller');

const router = express.Router();

// Route: View foods and progress
router.get('/', protect, getFoods);

// Route: Add a new food
router.post('/add', protect, addFood);

// Route: Delete a food entry
router.get('/delete/:id', protect, deleteFood);

module.exports = router;
