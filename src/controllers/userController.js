
// const User = require('../models/userModel');

// const userController = {
//   async register(req, res) {
//     try {
//       const newUser = await User.createUser(req.body);
//       res.status(201).json(newUser);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   async login(req, res) {
//     try {
//       const { email, password } = req.body;
//       const user = await User.getUserByEmail(email);
//       if (user && user.password === password) {
//         res.json({ message: 'Login successful' });
//       } else {
//         res.status(401).json({ message: 'Invalid credentials' });
//       }
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },
// };         Versión anterior


// module.exports = userController;

const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
  // Registro de un nuevo usuario consumidor
  async registerConsumer(req, res) {
    const { first_name, email, password, confirmPassword } = req.body;

    // Verificación de contraseñas coincidentes
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    try {
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear el usuario como consumidor (tipo 1)
      const newUser = await User.createUser({
        first_name,
        email,
        password: hashedPassword,
        user_type_id: 1, // Tipo 1 para usuarios consumidores
      });

      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Registro de admins del bar y staff por parte del super admin
  async registerBarStaff(req, res) {
    //  const { first_name, middle_name, last_name, email, password, confirmPassword, user_type_id } = req.body;
    const { first_name, email, password, confirmPassword } = req.body;
    // Verificación de contraseñas coincidentes
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    // Verificación de tipo de usuario
    if (![2, 3, 4].includes(user_type_id)) {
      return res.status(400).json({ message: 'Tipo de usuario inválido' });
    }

    try {
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.createUser({
        first_name,
        email,
        password: hashedPassword,
        user_type_id , //  Tipo 2: Staff/Bar, Tipo 3: Cocina, Tipo 4: Bar Admin
      });

      // Descomentar en sigueinte actualización
      // Crear el usuario
      // const newUser = await User.createUser({
      //   first_name,
      //   middle_name,
      //   last_name,
      //   email,
      //   password: hashedPassword,
      //   user_type_id, // Tipo 2: Staff/Bar, Tipo 3: Cocina, Tipo 4: Bar Admin
      // });

      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Inicio de sesión
  async login(req, res) {
    const { email, password } = req.body;
    try {
      const user = await User.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET || 'secreto', { expiresIn: '1h' });

      res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = userController;
