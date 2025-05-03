const User = require('../models/User');
const Post = require('../models/Post');

exports.getProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    delete user.password;
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio } = req.body;
    
    let profilePhotoUrl = null;
    if (req.file) {
      profilePhotoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    
    // Update user in database
    const query = [];
    const params = [];
    
    if (bio) {
      query.push('bio = ?');
      params.push(bio);
    }
    
    if (profilePhotoUrl) {
      query.push('profile_photo_url = ?');
      params.push(profilePhotoUrl);
    }
    
    if (query.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    params.push(userId);
    
    await db.execute(
      `UPDATE users SET ${query.join(', ')} WHERE user_id = ?`,
      params
    );
    
    const updatedUser = await User.findById(userId);
    delete updatedUser.password;
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;
    
    const suggestedUsers = await User.getSuggested(userId, limit);
    
    res.json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};