const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Admin = require('../models/admin');

// Login for students (by email or mobile)
router.post('/login', async (req, res) => {
  const { id, password } = req.body; // id = email or mobile
  const user = await User.findOne({ $or: [{ email: id }, { mobile: id } ] });
  if (!user) return res.status(401).json({ error: 'User not found' });
  if (user.password !== password) return res.status(401).json({ error: 'Invalid password' });
  res.json({ user });
});

// Admin login
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin || admin.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ admin });
});

module.exports = router;
