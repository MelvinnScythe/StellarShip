const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  dailyXP: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: String, // Store as YYYY-MM-DD
    default: new Date().toISOString().split('T')[0]
  },
  level: {
    type: Number,
    default: 1
  },
  selectedClass: {
    type: Number,
    default: 1
  },
  streak: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('User', UserSchema);
