const Post = require('../models/Post');
const Hashtag = require('../models/Hashtag');

exports.createPost = async (req, res) => {
  try {
    const { caption, location, hashtags } = req.body;
    const userId = req.user.id;
    
    let photoUrl = null;
    let videoUrl = null;
    
    // Handle media upload
    if (req.file) {
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      if (req.file.mimetype.startsWith('image')) {
        photoUrl = fileUrl;
      } else if (req.file.mimetype.startsWith('video')) {
        videoUrl = fileUrl;
      }
    }
    
    // Create post
    const postId = await Post.create({
      user_id: userId,
      caption,
      location,
      photo_url: photoUrl,
      video_url: videoUrl
    });
    
    // Handle hashtags
    if (hashtags) {
      const tagList = hashtags.split(' ')
        .filter(tag => tag.startsWith('#'))
        .map(tag => tag.substring(1)); // Remove # prefix
      
      if (tagList.length > 0) {
        await Post.addHashtags(postId, tagList);
      }
    }
    
    const post = await Post.findById(postId);
    
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    
    const posts = await Post.getAll(limit, offset);
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserPosts = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    
    const posts = await Post.getByUser(userId, limit, offset);
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};