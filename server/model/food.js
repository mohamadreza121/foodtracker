const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    minlength: [2, 'Food name must be at least 2 characters'],
    maxlength: [50, 'Food name must be at most 50 characters'],
  },
  calories: {
    type: Number,
    required: [true, 'Calories are required'],
    min: [1, 'Calories must be at least 1'],
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    validate: {
      validator: function (value) {
        // Check if date is in YYYY-MM-DD format
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
      },
      message: 'Date must be in YYYY-MM-DD format',
    },
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    type: String, // Image filename (e.g., "apple.jpg")
    required: [true, 'Image is required'],
  },
});

module.exports = mongoose.model('Food', foodSchema);
