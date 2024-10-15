const db = require('../config/database');

class User {
  static async create(userData) {
    const { username, email, password } = userData;
    const query = 'INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING *';
    const values = [username, email, password];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }
}

module.exports = User;