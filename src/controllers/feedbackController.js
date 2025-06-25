const Feedback = require('../models/Feedback');

// POST /feedback - create new feedback
const createFeedback = async (req, res) => {
  try {
    const category = req.body.category;
    const message = req.body.message;
    const userId = req.user.id;
    if (!category || !message) {
      return res.status(400).json({ message: 'category and message are required.' });
    }
    const feedback = new Feedback({
      user: userId,
      category,
      message
    });
    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Feedback creation failed', error });
  }
};

// GET /feedback - get all feedbacks for the authenticated user
const getUserFeedbacks = async (req, res) => {
  try {
    const userId = req.user.id;
    const fbs = await Feedback.find({ user: userId });
    return res.json(fbs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feedbacks', error });
  }
};

module.exports = {
  createFeedback,
  getUserFeedbacks
}; 