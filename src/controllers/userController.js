// const User = require('../models/User');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// exports.register = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({ username, email, password: hashedPassword });
//     res.status(201).json({ message: 'User registered successfully', userId: user.id });
//   } catch (error) {
//     res.status(500).json({ message: 'Error registering user', error: error.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findByEmail(email);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: 'Invalid password' });
//     }
//     const token = --Buscar en stackoverflow


const User = require('../models/userModel');

const userController = {
  async register(req, res) {
    try {
      const newUser = await User.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.getUserByEmail(email);
      if (user && user.password === password) {
        res.json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = userController;