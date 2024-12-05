const { capitalize } = require('../utils/capitalize');
const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Fetch all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'lastname', 'createdAt'], // Exclude sensitive data like passwords
      order: [['createdAt', 'DESC']], // Sort users by creation date, newest first
    });

    console.log('All Users:', users); // Log users to the server console
    res.status(200).json(users); // Send users as JSON response
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  let { name, lastname, password } = req.body;

  console.log('Incoming registration request:', { name, lastname, password });

  if (!name || !lastname || !password) {
    return res.status(400).json({
      error: 'Nombre, apellido y contraseña son requeridos.',
    });
  }

  name = capitalize(name);
  lastname = capitalize(lastname);

  try {
    // Check if a user with the same name and lastname already exists
    const existingUser = await User.findOne({ where: { name, lastname } });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      lastname,
      password: hashedPassword,
    });

    console.log('New User Created:', newUser);

    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { name, lastname, password } = req.body;

  try {
    const user = await User.findOne({ where: { name, lastname } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Store user information in the session
    req.session.user = { id: user.id, name: user.name, lastname: user.lastname };

    res.json({
      message: 'Inicio de sesión exitoso.',
      user: req.session.user, // Send user details back to the client
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión.' });
    }
    res.json({ message: 'Cierre de sesión exitoso.' });
  });
});

// Get current user route
router.get('/current', (req, res) => {
  if (req.session.user) {
    return res.status(200).json(req.session.user);
  } else {
    return res.status(401).json({ error: 'Usuario no autenticado.' });
  }
});

module.exports = router;
