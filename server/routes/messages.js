const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const SiteAlert = require('../models/SiteAlert');
const User = require('../models/User');

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildNickname = (user) => {
  if (user.nickname) return user.nickname;
  if (user.name) return user.name.trim().split(/\s+/)[0];
  return user.email.split('@')[0];
};

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  nickname: buildNickname(user),
  level: user.level || 1,
  selectedClass: user.selectedClass || 1
});

const publicMessage = (message, currentUserId) => ({
  id: message._id.toString(),
  body: message.body,
  createdAt: message.createdAt,
  readAt: message.readAt,
  senderId: message.sender._id.toString(),
  recipientId: message.recipient._id.toString(),
  isMine: message.sender._id.toString() === currentUserId,
  sender: publicUser(message.sender),
  recipient: publicUser(message.recipient)
});

const findRecipient = async ({ recipientId, recipientQuery, currentUserId }) => {
  if (recipientId && mongoose.Types.ObjectId.isValid(recipientId)) {
    return User.findOne({
      $and: [
        { _id: recipientId },
        { _id: { $ne: currentUserId } }
      ]
    });
  }

  const query = (recipientQuery || '').trim();
  if (!query) return null;

  const exact = new RegExp(`^${escapeRegex(query)}$`, 'i');
  return User.findOne({
    _id: { $ne: currentUserId },
    $or: [
      { email: exact },
      { nickname: exact },
      { name: exact }
    ]
  });
};

// @route   GET api/messages/users
// @desc    List signed-up users available for messaging
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('name email nickname level selectedClass')
      .sort({ name: 1 });

    res.json(users.map(publicUser));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/messages/conversations
// @desc    Get conversation summaries for the current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const messages = await Message.find({
      $or: [
        { sender: currentUserId },
        { recipient: currentUserId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(500)
      .populate('sender recipient', 'name email nickname level selectedClass');

    const conversations = new Map();

    messages.forEach((message) => {
      const otherUser = message.sender._id.toString() === currentUserId
        ? message.recipient
        : message.sender;
      const otherUserId = otherUser._id.toString();

      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          user: publicUser(otherUser),
          lastMessage: publicMessage(message, currentUserId),
          unreadCount: 0
        });
      }

      if (message.recipient._id.toString() === currentUserId && !message.readAt) {
        conversations.get(otherUserId).unreadCount += 1;
      }
    });

    res.json(Array.from(conversations.values()));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/messages/thread/:userId
// @desc    Get all messages between current user and another user
router.get('/thread/:userId', auth, async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ msg: 'Invalid user id' });
  }

  try {
    const currentUserId = req.user.id;
    const otherUser = await User.findOne({
      $and: [
        { _id: userId },
        { _id: { $ne: currentUserId } }
      ]
    })
      .select('name email nickname level selectedClass');

    if (!otherUser) return res.status(404).json({ msg: 'User not found' });

    await Message.updateMany(
      { sender: userId, recipient: currentUserId, readAt: null },
      { $set: { readAt: new Date() } }
    );

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender recipient', 'name email nickname level selectedClass');

    res.json({
      user: publicUser(otherUser),
      messages: messages.map((message) => publicMessage(message, currentUserId))
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/messages/alert
// @desc    Get the current site-wide alert banner
router.get('/alert', auth, async (req, res) => {
  try {
    const alert = await SiteAlert.findOne({ active: true })
      .sort({ createdAt: -1 })
      .populate('author', 'name email nickname');

    if (!alert) return res.json(null);

    res.json({
      id: alert._id.toString(),
      body: alert.body,
      createdAt: alert.createdAt,
      author: publicUser(alert.author)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/messages/alert
// @desc    Broadcast an alert visible to all signed-in users
router.post('/alert', auth, async (req, res) => {
  const body = (req.body.body || '').trim();
  if (!body) return res.status(400).json({ msg: 'Alert cannot be empty' });
  if (body.length > 280) return res.status(400).json({ msg: 'Alert is too long (max 280 characters)' });

  try {
    await SiteAlert.updateMany({ active: true }, { $set: { active: false } });

    const alert = await SiteAlert.create({
      body,
      author: req.user.id
    });

    const populated = await SiteAlert.findById(alert._id)
      .populate('author', 'name email nickname level selectedClass');

    res.status(201).json({
      id: populated._id.toString(),
      body: populated.body,
      createdAt: populated.createdAt,
      author: publicUser(populated.author)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/messages/alert
// @desc    Clear the active site-wide alert (author or any user)
router.delete('/alert', auth, async (req, res) => {
  try {
    await SiteAlert.updateMany({ active: true }, { $set: { active: false } });
    res.json({ msg: 'Alert cleared' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/messages
// @desc    Send a message by user id, nickname, name, or email
router.post('/', auth, async (req, res) => {
  const body = (req.body.body || '').trim();
  const recipientId = req.body.recipientId;
  const recipientQuery = req.body.recipientQuery;

  if (!body) return res.status(400).json({ msg: 'Message cannot be empty' });
  if (body.length > 5000) return res.status(400).json({ msg: 'Message is too long' });

  try {
    const recipient = await findRecipient({
      recipientId,
      recipientQuery,
      currentUserId: req.user.id
    });

    if (!recipient) {
      return res.status(404).json({ msg: 'Recipient not found. Try their nickname, name, or email.' });
    }

    const message = await Message.create({
      sender: req.user.id,
      recipient: recipient._id,
      body
    });

    const populated = await Message.findById(message._id)
      .populate('sender recipient', 'name email nickname level selectedClass');

    res.status(201).json(publicMessage(populated, req.user.id));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
