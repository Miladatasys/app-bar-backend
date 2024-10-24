const db = require('../config/db');

class User {
  // Crear usuario
  static async createUser(userData) {
    const { first_name, email, password, confirmPassword, user_type_id } = userData; // Usamos solo los campos actuales
    const values = [first_name, email, password, user_type_id];
    const query = 'INSERT INTO "AppUser"(first_name, email, password, user_type_id) VALUES($1, $2, $3, $4) RETURNING *';
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async getUserByEmail(email) {
    const query = 'SELECT * FROM "AppUser" WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }

  // Método para obtener tipo de usuario por id
  static async getUserTypeById(id) {
    const query = `
      SELECT UserType.description AS user_type
      FROM UserType
      JOIN "AppUser" ON UserType.id = "AppUser".user_type_id
      WHERE "AppUser".user_id = $1
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

  // Futuras mejoras: Agregar otros campos cuando se necesiten
  /*
  - middle_name: Podría añadirse en el futuro para almacenar el segundo nombre del usuario.
  - last_name: Este campo podría utilizarse cuando se decida implementar apellidos en los usuarios.
  */
}

module.exports = User;
