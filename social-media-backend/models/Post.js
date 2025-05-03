const db = require('../config/database');

class Post {
  static async create({ user_id, caption, location, photo_url = null, video_url = null }) {
    const [result] = await db.execute(
      'INSERT INTO posts (user_id, caption, location, photo_url, video_url) VALUES (?, ?, ?, ?, ?)',
      [user_id, caption, location, photo_url, video_url]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(`
      SELECT p.*, u.username, u.profile_photo_url 
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.post_id = ?
    `, [id]);
    return rows[0];
  }

  static async getAll(limit = 20, offset = 0) {
    const [rows] = await db.execute(`
      SELECT p.*, u.username, u.profile_photo_url 
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
    return rows;
  }

  static async getByUser(userId, limit = 20, offset = 0) {
    const [rows] = await db.execute(`
      SELECT p.*, u.username, u.profile_photo_url 
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);
    return rows;
  }
  
  static async addHashtags(postId, hashtags) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      for (const tag of hashtags) {
        // Insert or get hashtag
        await connection.execute(
          'INSERT IGNORE INTO hashtags (hashtag_name) VALUES (?)',
          [tag]
        );
        
        // Get hashtag_id
        const [hashtagRows] = await connection.execute(
          'SELECT hashtag_id FROM hashtags WHERE hashtag_name = ?',
          [tag]
        );
        
        // Link to post
        await connection.execute(
          'INSERT INTO post_hashtags (post_id, hashtag_id) VALUES (?, ?)',
          [postId, hashtagRows[0].hashtag_id]
        );
      }
      
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Post;