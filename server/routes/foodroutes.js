const express = require('express');
const { protect } = require('../middleware/authmiddleware');
const Food = require('../model/food');

const router = express.Router();

// Route to render the food tracker page with required data
router.get('/', protect, async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Fetch all foods for the logged-in user for today
    const foods = await Food.find({ userId: req.user._id, date: today });

    // Calculate total and remaining calories
    const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
    const dailyGoal = req.user.dailyCalorieGoal || 2000; // Default to 2000 kcal
    const remainingCalories = Math.max(0, dailyGoal - totalCalories);

    // Render the `food.ejs` template with data
    res.render('food', {
      foods,
      totalCalories,
      remainingCalories,
      user: req.user, // Pass user for additional context if needed
    });
  } catch (error) {
    console.error('Error fetching food data:', error.message);
    res.status(500).render('error', { message: 'Failed to load food data.', error });
  }
});

// Updated API Route: Add a new food entry
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
      calories: Number(calories), // Ensure calories are stored as numbers
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

// API Route: Delete a food entry
router.get('/delete/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the specified food entry
    await Food.findByIdAndDelete(id);

    res.redirect('/foodroutes'); // Redirect back to the dashboard
  } catch (error) {
    console.error('Error deleting food:', error.message);
    res.status(500).render('error', { message: 'Failed to delete food.', error });
  }
});

// Search route
router.get('/search', protect, async (req, res) => {
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
