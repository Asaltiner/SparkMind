const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const mailService = require('../services/mailService');

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, categories } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      categories: categories || []
    });

    // Save user (password will be hashed by pre-save hook)
    await user.save();

    // Send confirmation email
    const htmlBody = `<h1>Welcome, ${user.email}</h1><p>Your registration was successful.</p>`;
    try {
      await mailService.sendMail(user.email, 'Kayıt Onayı', htmlBody);
    } catch (mailErr) {
      console.error('Onay maili gönderilemedi:', mailErr);
    }

    // Sign JWT with payload { id: user._id, email: user.email }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (excluding password) and token
    const userResponse = {
      _id: user._id,
      email: user.email,
      categories: user.categories,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password using bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Sign JWT with payload { id: user._id, email: user.email }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (excluding password) and token
    const userResponse = {
      _id: user._id,
      email: user.email,
      categories: user.categories,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = {
  register,
  login
}; 