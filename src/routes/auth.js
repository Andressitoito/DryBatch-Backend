const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../../src/models/User');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = user;
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    res.status(500).send('Error during login');
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send('Logout failed');
    } else {
      res.status(200).send('Logout successful');
    }
  });
});

module.exports = router;