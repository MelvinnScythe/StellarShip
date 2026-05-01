const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// @route   PUT api/users/progress
// @desc    Update user xp and level
router.put('/progress', auth, async (req, res) => {
  const { xpEarned, level, selectedClass, streak } = req.body;
  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (xpEarned !== undefined) user.xpEarned = xpEarned;
    if (level !== undefined) user.level = level;
    if (selectedClass !== undefined) user.selectedClass = selectedClass;
    if (streak !== undefined) user.streak = streak;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/leaderboard
// @desc    Get top users by XP
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ xpEarned: -1 }).limit(10).select('name level xpEarned');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
