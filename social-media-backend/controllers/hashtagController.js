const db = require('../config/database');

/**
 * @desc    Get trending hashtags
 * @route   GET /api/hashtags/trending
 * @access  Public
 */
exports.getTrendingHashtags = async (req, res) => {
  try {
    // Get hashtags with the most posts in the last 7 days
    const [hashtags] = await db.execute(`
      SELECT h.hashtag_id, h.hashtag_name, COUNT(pt.post_id) as post_count
      FROM hashtags h
      JOIN post_tags pt ON h.hashtag_id = pt.hashtag_id
      JOIN post p ON pt.post_id = p.post_id
      WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY h.hashtag_id
      ORDER BY post_count DESC
      LIMIT 10
    `);

    res.json(hashtags);
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    res.status(500).json({ message: 'Server error while fetching trending hashtags' });
  }
};

/**
 * @desc    Get posts by hashtag
 * @route   GET /api/hashtags/:hashtag/posts
 * @access  Public
 */
exports.getPostsByHashtag = async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // First check if hashtag exists
    const [hashtagResult] = await db.execute(
      'SELECT hashtag_id FROM hashtags WHERE hashtag_name = ?',
      [`#${hashtag}`]
    );

    if (hashtagResult.length === 0) {
      return res.status(404).json({ message: 'Hashtag not found' });
    }

    const hashtagId = hashtagResult[0].hashtag_id;

    // Get posts with this hashtag
    const [posts] = await db.execute(`
      SELECT p.*, u.username, u.profile_photo_url
      FROM post p
      JOIN users u ON p.user_id = u.user_id
      JOIN post_tags pt ON p.post_id = pt.post_id
      WHERE pt.hashtag_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [hashtagId, parseInt(limit), parseInt(offset)]);

    // Get media and hashtags for each post
    for (const post of posts) {
      const [photos] = await db.execute(
        'SELECT * FROM photos WHERE post_id = ?',
        [post.post_id]
      );
      const [videos] = await db.execute(
        'SELECT * FROM videos WHERE post_id = ?',
        [post.post_id]
      );
      const [hashtags] = await db.execute(`
        SELECT h.hashtag_name 
        FROM hashtags h
        JOIN post_tags pt ON h.hashtag_id = pt.hashtag_id
        WHERE pt.post_id = ?
      `, [post.post_id]);
      
      post.photos = photos;
      post.videos = videos;
      post.hashtags = hashtags.map(h => h.hashtag_name);
    }

    // Get total count for pagination
    const [countResult] = await db.execute(
      'SELECT COUNT(*) as total FROM post_tags WHERE hashtag_id = ?',
      [hashtagId]
    );

    res.json({
      posts,
      total: countResult[0].total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(countResult[0].total / limit)
    });
  } catch (error) {
    console.error('Error fetching posts by hashtag:', error);
    res.status(500).json({ message: 'Server error while fetching posts by hashtag' });
  }
};

/**
 * @desc    Follow a hashtag
 * @route   POST /api/hashtags/:hashtag/follow
 * @access  Private
 */
exports.followHashtag = async (req, res) => {
  try {
    const { hashtag } = req.params;
    const userId = req.user.id;

    // Check if hashtag exists
    const [hashtagResult] = await db.execute(
      'SELECT hashtag_id FROM hashtags WHERE hashtag_name = ?',
      [`#${hashtag}`]
    );

    if (hashtagResult.length === 0) {
      return res.status(404).json({ message: 'Hashtag not found' });
    }

    const hashtagId = hashtagResult[0].hashtag_id;

    // Check if user already follows this hashtag
    const [existingFollow] = await db.execute(
      'SELECT * FROM hashtag_follow WHERE user_id = ? AND hashtag_id = ?',
      [userId, hashtagId]
    );

    if (existingFollow.length > 0) {
      return res.status(400).json({ message: 'You already follow this hashtag' });
    }

    // Follow the hashtag
    await db.execute(
      'INSERT INTO hashtag_follow (user_id, hashtag_id) VALUES (?, ?)',
      [userId, hashtagId]
    );

    res.json({ message: 'Successfully followed hashtag' });
  } catch (error) {
    console.error('Error following hashtag:', error);
    res.status(500).json({ message: 'Server error while following hashtag' });
  }
};

/**
 * @desc    Unfollow a hashtag
 * @route   DELETE /api/hashtags/:hashtag/follow
 * @access  Private
 */
exports.unfollowHashtag = async (req, res) => {
  try {
    const { hashtag } = req.params;
    const userId = req.user.id;

    // Check if hashtag exists
    const [hashtagResult] = await db.execute(
      'SELECT hashtag_id FROM hashtags WHERE hashtag_name = ?',
      [`#${hashtag}`]
    );

    if (hashtagResult.length === 0) {
      return res.status(404).json({ message: 'Hashtag not found' });
    }

    const hashtagId = hashtagResult[0].hashtag_id;

    // Delete the follow relationship
    const [result] = await db.execute(
      'DELETE FROM hashtag_follow WHERE user_id = ? AND hashtag_id = ?',
      [userId, hashtagId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'You were not following this hashtag' });
    }

    res.json({ message: 'Successfully unfollowed hashtag' });
  } catch (error) {
    console.error('Error unfollowing hashtag:', error);
    res.status(500).json({ message: 'Server error while unfollowing hashtag' });
  }
};

/**
 * @desc    Get hashtags followed by user
 * @route   GET /api/hashtags/following
 * @access  Private
 */
exports.getFollowedHashtags = async (req, res) => {
  try {
    const userId = req.user.id;

    const [hashtags] = await db.execute(`
      SELECT h.hashtag_id, h.hashtag_name, 
             (SELECT COUNT(*) FROM post_tags WHERE hashtag_id = h.hashtag_id) as post_count
      FROM hashtags h
      JOIN hashtag_follow hf ON h.hashtag_id = hf.hashtag_id
      WHERE hf.user_id = ?
      ORDER BY h.hashtag_name
    `, [userId]);

    res.json(hashtags);
  } catch (error) {
    console.error('Error fetching followed hashtags:', error);
    res.status(500).json({ message: 'Server error while fetching followed hashtags' });
  }
};

/**
 * @desc    Search hashtags
 * @route   GET /api/hashtags/search
 * @access  Public
 */
exports.searchHashtags = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const [hashtags] = await db.execute(`
      SELECT hashtag_id, hashtag_name, 
             (SELECT COUNT(*) FROM post_tags WHERE hashtag_id = hashtags.hashtag_id) as post_count
      FROM hashtags
      WHERE hashtag_name LIKE ?
      ORDER BY post_count DESC
      LIMIT 10
    `, [`%${q}%`]);

    res.json(hashtags);
  } catch (error) {
    console.error('Error searching hashtags:', error);
    res.status(500).json({ message: 'Server error while searching hashtags' });
  }
};