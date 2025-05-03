const db = require('../config/database');

class Hashtag {
  static async getTrending(limit = 5) {
    const [rows] = await db.execute(`
      SELECT h.hashtag_id, h.hashtag_name, COUNT(ph.post_id) as post_count
      FROM hashtags h
      JOIN post_hashtags ph ON h.hashtag_id = ph.hashtag_id
      GROUP BY h.hashtag_id
      ORDER BY post_count DESC
      LIMIT ?
    `, [limit]);
    return rows;
  }
  
  static async getPostsByHashtag(hashtagName, limit = 20, offset = 0) {
    const [rows] = await db.execute(`
      SELECT p.*, u.username, u.profile_photo_url 
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      JOIN post_hashtags ph ON p.post_id = ph.post_id
      JOIN hashtags h ON ph.hashtag_id = h.hashtag_id
      WHERE h.hashtag_name = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [hashtagName, limit, offset]);
    return rows;
  }
}

module.exports = Hashtag;