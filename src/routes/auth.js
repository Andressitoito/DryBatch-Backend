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

// Delete user by name and lastname
router.delete('/delete-user', async (req, res) => {
  const { name, lastname, token } = req.body;

  // Validate the token
  if (token !== process.env.AUTH_TOKEN) {
    return res.status(400).json({
      error: 'Token inválido',
    });
  }

  if (!name || !lastname) {
    return res.status(400).json({
      error: 'Nombre y apellido son requeridos.',
    });
  }

  // Capitalize the name and lastname to match the database
  const capitalizedName = capitalize(name);
  const capitalizedLastname = capitalize(lastname);

  try {
    // Find the user by name and lastname
    const user = await User.findOne({
      where: { name: capitalizedName, lastname: capitalizedLastname },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Delete the user
    await user.destroy();

    res.status(200).json({
      message: 'Usuario eliminado exitosamente.',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error al eliminar usuario.' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  let { name, lastname, password, token } = req.body;

  if (token !== process.env.AUTH_TOKEN) {
    return res.status(400).json({
      error: 'Token invalido',
    });
  }

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

    await User.create({
      name,
      lastname,
      password: hashedPassword,
    });


    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
});

router.get('/test-cookie', (req, res) => {
  res.cookie('testCookie', 'testValue', {
    httpOnly: true,
    secure: false, // For development
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    domain: 'localhost',
  });
  res.send('Test cookie sent');
});

// GET /session - Validate and fetch the current session
router.get('/session', async (req, res) => {

  try {

    console.log("this route hit ")
    if (req.session.user) {
      // Fetch user details from the database to ensure session data is up-to-date
      const { id } = req.session.user;
      const user = await User.findOne({
        where: { id },
        attributes: ['id', 'name', 'lastname'], // Fetch required user fields
      });


      console.log("user found ", user)
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Update the session in case user details changed
      req.session.user = {
        id: user.id,
        name: capitalize(user.name),
        lastname: capitalize(user.lastname),
      };

      return res.json({ user: req.session.user });
    } else {
      return res.status(401).json({ error: "No active session" });
    }
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/login', async (req, res) => {
  let { name, lastname, password } = req.body;

  name = capitalize(name);
  lastname = capitalize(lastname);

  try {
    const user = await User.findOne({
      where: { name, lastname },
      attributes: ['id', 'name', 'lastname', 'password'],
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    req.session.user = { id: user.id, name: user.name, lastname: user.lastname };

    // Save the session explicitly and check for errors
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        return res.status(500).json({ error: "Failed to save session." });
      }

      console.log("Set-Cookie sent with session ID");
      res.json({
        message: 'Inicio de sesión exitoso.',
        user: req.session.user,
      });
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});


// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      // If an error occurs, send a 500 status code
      return res.status(500).json({ error: 'Error al cerrar sesión.' });
    }

    // Clear the session cookie to ensure the browser deletes it
    res.clearCookie("connect.sid", {
      path: "/", // Match the path used in the session middleware
      httpOnly: true,
      sameSite: "None",
      secure: false, // Use true in production with HTTPS
    });

    // Send a success response
    res.json({ message: 'Cierre de sesión exitoso.' });
  });
});


// Route to destroy a session by user ID
router.post('/admin/logout-user', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    // Query the session store to find the session(s) for the user
    const sessions = await Session.findAll({ where: { data: { [Op.like]: `%${userId}%` } } });

    if (!sessions || sessions.length === 0) {
      return res.status(404).json({ error: 'No sessions found for the user.' });
    }

    // Destroy all sessions for the user
    for (const session of sessions) {
      await req.sessionStore.destroy(session.sid, (err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
    }

    res.json({ message: `All sessions for user ${userId} have been destroyed.` });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while destroying sessions.' });
  }
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
