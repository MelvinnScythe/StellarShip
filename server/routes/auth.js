const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST api/auth/signup
// @desc    Register a new user
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ name, email, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT
    const payload = { user: { id: user.id, name: user.name } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, xpEarned: user.xpEarned, level: user.level, selectedClass: user.selectedClass, streak: user.streak } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id, name: user.name } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, xpEarned: user.xpEarned, level: user.level, selectedClass: user.selectedClass, streak: user.streak } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/google
// @desc    Authenticate with Google
router.post('/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { name, email } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, password: 'google-oauth-placeholder' });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();
    }

    const payload = { user: { id: user.id, name: user.name } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
      if (err) throw err;
      res.json({ token: jwtToken, user: { id: user.id, name: user.name, email: user.email, xpEarned: user.xpEarned, level: user.level, selectedClass: user.selectedClass, streak: user.streak } });
    });
  } catch (err) {
    console.error("Google auth error:", err.message);
    res.status(500).json({ msg: 'Google authentication failed' });
  }
});

module.exports = router;
