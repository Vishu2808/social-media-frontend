const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  static async create({ username, email, password, bio = '', profile_photo_url = 'https://picsum.photos/100' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, bio, profile_photo_url) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, bio, profile_photo_url]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE user_id = ?', [id]);
    return rows[0];
  }

  static generateToken(user) {
    return jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
  
  static async getSuggested(userId, limit = 5) {
    const [rows] = await db.execute(`
      SELECT u.user_id, u.username, u.profile_photo_url, u.bio 
      FROM users u
      WHERE u.user_id != ? 
      AND u.user_id NOT IN (
        SELECT following_id FROM follows WHERE follower_id = ?
      )
      LIMIT ?
    `, [userId, userId, limit]);
    return rows;
  }
}

module.exports = User;