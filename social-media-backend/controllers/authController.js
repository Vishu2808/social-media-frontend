const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const userId = await User.create({ username, email, password });
    
    // Get the created user
    const user = await User.findById(userId);
    
    // Generate token
    const token = User.generateToken(user);
    
    res.status(201).json({ 
      token, 
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        profile_photo_url: user.profile_photo_url,
        bio: user.bio
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await User.verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = User.generateToken(user);
    
    res.json({ 
      token, 
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        profile_photo_url: user.profile_photo_url,
        bio: user.bio
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};