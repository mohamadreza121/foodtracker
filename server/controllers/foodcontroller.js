const Food = require('../model/food');

// Add a new food entry
const addFood = async (req, res) => {
  try {
    const { name, calories } = req.body;
    const date = new Date().toISOString().split('T')[0]; // Use today's date

    // Create a new food entry
    const food = await Food.create({
      name,
      calories,
      date,
      userId: req.user._id,
    });

    res.redirect('/foodroutes'); // Redirect to the food list after successful creation
  } catch (err) {
    res.status(400).render('error', { message: 'Failed to add food. ' + err.message });
  }
};

// Get all food entries for the logged-in user
const getFoods = async (req, res) => {
  try {
    const date = new Date().toISOString().split('T')[0]; // Get today's date
    const foods = await Food.find({ userId: req.user._id, date });

    const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
    const dailyGoal = req.user.dailyCalorieGoal || 2000;

    res.render('food', {
      foods,
      totalCalories,
      remainingCalories: Math.max(0, dailyGoal - totalCalories),
    });
  } catch (err) {
    res.status(500).render('error', { message: 'Failed to retrieve foods. ' + err.message });
  }
};

// Delete a food entry
const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;

    await Food.findByIdAndDelete(id);

    res.redirect('/foodroutes'); // Redirect back to the food list after deletion
  } catch (err) {
    res.status(500).render('error', { message: 'Failed to delete food. ' + err.message });
  }
};

module.exports = { addFood, getFoods, deleteFood };
