const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userController = {
  // Registro de un nuevo usuario consumidor
  async registerConsumer(req, res) {
    const { first_name, email, password, confirmPassword } = req.body;

    // Mostrar los datos recibidos
    console.log('Datos recibidos para registro:', { first_name, email, password, confirmPassword });

    // Verificación de contraseñas coincidentes
    if (password !== confirmPassword) {
      console.log('Las contraseñas no coinciden');
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    try {
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Contraseña encriptada:', hashedPassword);

      // Crear el usuario
      const newUser = await User.createUser({
        first_name,
        email,
        password: hashedPassword,
        user_type_id: 1, // Tipo 1 para consumidores
      });

      console.log('Usuario creado en la base de datos:', newUser);

      res.status(201).json(newUser);
    } catch (error) {
      console.log('Error al registrar el usuario:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Registro de staff o admin del bar
  async registerStaff(req, res) {
    const { first_name, email, password, confirmPassword, user_type_id } = req.body;

    // Mostrar los datos recibidos
    console.log('Datos recibidos para registro de staff o admin:', { first_name, email, password, confirmPassword, user_type_id });

    if (password !== confirmPassword) {
      console.log('Las contraseñas no coinciden');
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    if (![2, 3, 4].includes(user_type_id)) {
      console.log('Tipo de usuario inválido:', user_type_id);
      return res.status(400).json({ message: 'Tipo de usuario inválido' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Contraseña encriptada:', hashedPassword);

      const newUser = await User.createUser({
        first_name,
        email,
        password: hashedPassword,
        user_type_id,
      });

      console.log('Usuario staff o admin creado en la base de datos:', newUser);

      res.status(201).json(newUser);
    } catch (error) {
      console.log('Error al registrar el usuario staff o admin:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Inicio de sesión
  async login(req, res) {
    const { email, password } = req.body;

    // Mostrar los datos recibidos para login
    console.log('Datos recibidos para login:', { email, password });

    try {
      const user = await User.getUserByEmail(email);
      if (!user) {
        console.log('Usuario no encontrado:', email);
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      console.log('Usuario encontrado en la base de datos:', user);

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log('Contraseña inválida para el usuario:', email);
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      console.log('Contraseña válida, generando token...');

      const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET || 'secreto', { expiresIn: '1h' });

      console.log('Token generado:', token);

      res.json({
        message: 'Inicio de sesión exitoso',
        token,
        user_id: user.user_id,        // Incluir el user_id
        user_type_id: user.user_type_id // Incluir el user_type_id
      });
    } catch (error) {
      console.log('Error en el proceso de login:', error.message);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = userController;
