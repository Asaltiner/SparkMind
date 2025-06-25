const express = require('express');
const auth = require('../middlewares/auth');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

// POST /api/v1/feedback
router.post('/', auth, feedbackController.createFeedback);

// GET /api/v1/feedback
router.get('/', auth, feedbackController.getUserFeedbacks);

module.exports = router; 