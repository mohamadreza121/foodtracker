const express = require('express');
const { protect } = require('../middleware/authmiddleware');
const Food = require('../model/food');

const router = express.Router();

// Route to render the food tracker page with required data
router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    let foods = [];
    let totalCalories = 0;
    let remainingCalories = 0;

    // If the user is logged in, fetch their data
    if (req.user) {
      foods = await Food.find({ userId: req.user._id, date: today });
      totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
      const dailyGoal = req.user.dailyCalorieGoal || 2000;
      remainingCalories = Math.max(0, dailyGoal - totalCalories);
    }

    res.render('food', {
      foods,
      totalCalories,
      remainingCalories,
      user: req.user || null, // Pass user for additional context
    });
  } catch (error) {
    console.error('Error fetching food data:', error.message);
    res.status(500).render('error', { message: 'Failed to load food data.', error });
  }
});

// API Route: Add a new food entry (requires login)
router.post('/add', protect, async (req, res) => {
  try {
    const { name, calories } = req.body;

    if (!name || !calories) {
      return res.status(400).json({ message: 'Name and calories are required.' });
    }

    const sanitizedName = name.trim().toLowerCase();
    const today = new Date().toISOString().split('T')[0];

    await Food.create({
      name: sanitizedName,
      calories: Number(calories),
      date: today,
      userId: req.user._id,
      image: `${sanitizedName.replace(/\s+/g, '_')}.jpg`,
    });

    res.status(201).json({ message: 'Food added successfully!' });
  } catch (error) {
    console.error('Error adding food:', error.message);
    res.status(500).json({ message: 'Failed to add food.', error: error.message });
  }
});

// API Route: Delete a food entry (requires login)
router.get('/delete/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    await Food.findByIdAndDelete(id);

    res.redirect('/foodroutes'); // Redirect back to the dashboard
  } catch (error) {
    console.error('Error deleting food:', error.message);
    res.status(500).render('error', { message: 'Failed to delete food.', error });
  }
});

// Search route
router.get('/search', async (req, res) => {
  const { q } = req.query; // Capture the search query from the query string
  if (!q) {
    return res.status(400).json({ message: 'Query is required.' });
  }

  try {
    const foods = await Food.find({
      name: { $regex: q, $options: 'i' }, // Case-insensitive partial match
    });

    res.json(foods); // Return the matching foods
  } catch (err) {
    console.error('Error fetching foods:', err.message);
    res.status(500).json({ message: 'Error fetching foods.', error: err.message });
  }
});

module.exports = router;
