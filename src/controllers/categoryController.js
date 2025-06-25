// src/controllers/categoryController.js
const User = require('../models/User');

const getAll = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('categories');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
};

const create = async (req, res) => {
  try {
    const { category } = req.body;
    if (!category || typeof category !== 'string') {
      return res.status(400).json({ message: 'Category must be a non-empty string' });
    }

    const user = await User.findById(req.user.id);
    if (user.categories.includes(category)) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    user.categories.push(category);
    await user.save();
    res.status(201).json(user.categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating category' });
  }
};

const update = async (req, res) => {
  try {
    const oldCategory = req.params.id;
    const { newCategory } = req.body;

    if (!newCategory || typeof newCategory !== 'string') {
      return res.status(400).json({ message: 'New category must be a non-empty string' });
    }

    const user = await User.findById(req.user.id);
    const categoryIndex = user.categories.indexOf(oldCategory);

    if (categoryIndex === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }

    user.categories[categoryIndex] = newCategory;
    await user.save();
    res.json(user.categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating category' });
  }
};

const remove = async (req, res) => {
  try {
    const categoryToRemove = req.params.id;
    const user = await User.findById(req.user.id);
    
    const initialLength = user.categories.length;
    user.categories = user.categories.filter(cat => cat !== categoryToRemove);

    if (user.categories.length === initialLength) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await user.save();
    res.json(user.categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting category' });
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove,
};