const express = require('express');
const router = express.Router();

// Homepage
router.get('/', (req, res) => {
  res.render('index', { title: 'FoodTracker' });
});

module.exports = router;
