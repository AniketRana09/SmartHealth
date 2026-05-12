const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getPredictionHistory } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route('/history')
    .get(protect, getPredictionHistory);

module.exports = router;
