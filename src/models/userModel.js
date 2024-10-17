const db = require('../config/db');

class User {
  static async createUser(userData) {
    const { username, email, password, user_type_id } = userData;
    const query = 'INSERT INTO User(username, email, password, user_type_id) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [username, email, password, user_type_id];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async getUserByEmail(email) {
    const query = 'SELECT * FROM User WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }


  // Método para obtener tipo de usuario por id
  static async getUserTypeById(id) {
    const query = `
    SELECT UserType.description AS user_type
    FROM UserType
    JOIN "User" ON UserType.id = "User".user_type_id
    WHERE "User".id = $1
  `;

    try {
      const { rows } = await db.query(query, [id]);
      if (rows.length === 0) {
        throw new Error('User not found');
      }
      return rows[0].user_type;
    } catch (error) {
      throw new Error('Error fetching user type: ' + error.message);
    }
  }
}

module.exports = User;