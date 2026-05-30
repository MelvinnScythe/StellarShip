const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Friendship = require('../models/Friendship');
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

const getOtherUserId = (friendship, currentUserId) => (
  friendship.requester._id.toString() === currentUserId
    ? friendship.recipient._id.toString()
    : friendship.requester._id.toString()
);

const getOtherUser = (friendship, currentUserId) => (
  friendship.requester._id.toString() === currentUserId
    ? friendship.recipient
    : friendship.requester
);

const friendshipWithUser = (friendship, currentUserId) => {
  const other = friendship.requester._id.toString() === currentUserId
    ? friendship.recipient
    : friendship.requester;

  return {
    id: friendship._id.toString(),
    status: friendship.status,
    createdAt: friendship.createdAt,
    updatedAt: friendship.updatedAt,
    isIncoming: friendship.recipient._id.toString() === currentUserId && friendship.status === 'pending',
    isOutgoing: friendship.requester._id.toString() === currentUserId && friendship.status === 'pending',
    user: publicUser(other)
  };
};

const findFriendshipBetween = (userA, userB) => Friendship.findOne({
  $or: [
    { requester: userA, recipient: userB },
    { requester: userB, recipient: userA }
  ]
});

const findUserByQuery = async (query, currentUserId) => {
  const trimmed = (query || '').trim();
  if (!trimmed) return null;

  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    return User.findOne({
      $and: [
        { _id: trimmed },
        { _id: { $ne: currentUserId } }
      ]
    }).select('name email nickname level selectedClass');
  }

  const exact = new RegExp(`^${escapeRegex(trimmed)}$`, 'i');
  return User.findOne({
    _id: { $ne: currentUserId },
    $or: [
      { email: exact },
      { nickname: exact },
      { name: exact }
    ]
  }).select('name email nickname level selectedClass');
};

// @route   GET api/friends
// @desc    List accepted friends
router.get('/', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const friendships = await Friendship.find({
      status: 'accepted',
      $or: [
        { requester: currentUserId },
        { recipient: currentUserId }
      ]
    })
      .populate('requester recipient', 'name email nickname level selectedClass')
      .sort({ updatedAt: -1 });

    const friends = friendships.map((friendship) => {
      const other = getOtherUser(friendship, currentUserId);
      return {
        ...publicUser(other),
        friendsSince: friendship.updatedAt
      };
    });

    res.json(friends);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/friends/requests
// @desc    Pending friend requests (incoming and outgoing)
router.get('/requests', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const pending = await Friendship.find({ status: 'pending' })
      .or([
        { recipient: currentUserId },
        { requester: currentUserId }
      ])
      .populate('requester recipient', 'name email nickname level selectedClass')
      .sort({ createdAt: -1 });

    const incoming = [];
    const outgoing = [];

    pending.forEach((friendship) => {
      const item = friendshipWithUser(friendship, currentUserId);
      if (item.isIncoming) incoming.push(item);
      if (item.isOutgoing) outgoing.push(item);
    });

    res.json({ incoming, outgoing, pendingCount: incoming.length });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/friends/search
// @desc    Search users to add as friends
router.get('/search', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const q = (req.query.q || '').trim();
    if (q.length < 2) {
      return res.json([]);
    }

    const pattern = new RegExp(escapeRegex(q), 'i');
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { name: pattern },
        { nickname: pattern },
        { email: pattern }
      ]
    })
      .select('name email nickname level selectedClass')
      .limit(20);

    const userIds = users.map((user) => user._id);
    const friendships = await Friendship.find({
      $or: [
        { requester: currentUserId, recipient: { $in: userIds } },
        { recipient: currentUserId, requester: { $in: userIds } }
      ]
    }).populate('requester recipient', '_id');

    const statusByUser = new Map();
    friendships.forEach((friendship) => {
      const requesterId = friendship.requester._id
        ? friendship.requester._id.toString()
        : friendship.requester.toString();
      const recipientId = friendship.recipient._id
        ? friendship.recipient._id.toString()
        : friendship.recipient.toString();
      const otherId = requesterId === currentUserId ? recipientId : requesterId;
      let relation = friendship.status;
      if (friendship.status === 'pending') {
        relation = recipientId === currentUserId ? 'pending_incoming' : 'pending_outgoing';
      }
      statusByUser.set(otherId, relation);
    });

    res.json(users.map((user) => ({
      ...publicUser(user),
      relation: statusByUser.get(user._id.toString()) || 'none'
    })));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/friends/request
// @desc    Send a friend request
router.post('/request', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    let targetUser = null;

    if (req.body.userId && mongoose.Types.ObjectId.isValid(req.body.userId)) {
      targetUser = await User.findOne({
        $and: [
          { _id: req.body.userId },
          { _id: { $ne: currentUserId } }
        ]
      }).select('name email nickname level selectedClass');
    } else {
      targetUser = await findUserByQuery(req.body.query, currentUserId);
    }

    if (!targetUser) {
      return res.status(404).json({ msg: 'User not found. Try nickname, name, or email.' });
    }

    const targetId = targetUser._id.toString();
    const existing = await findFriendshipBetween(currentUserId, targetId);

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ msg: 'You are already friends.' });
      }
      if (existing.status === 'pending') {
        if (existing.requester.toString() === currentUserId) {
          return res.status(400).json({ msg: 'Friend request already sent.' });
        }
        existing.status = 'accepted';
        existing.updatedAt = new Date();
        await existing.save();
        const populated = await Friendship.findById(existing._id)
          .populate('requester recipient', 'name email nickname level selectedClass');
        return res.json({
          msg: 'Friend request accepted.',
          friendship: friendshipWithUser(populated, currentUserId)
        });
      }
      existing.requester = currentUserId;
      existing.recipient = targetId;
      existing.status = 'pending';
      existing.updatedAt = new Date();
      await existing.save();
    } else {
      await Friendship.create({
        requester: currentUserId,
        recipient: targetId
      });
    }

    const friendship = await Friendship.findOne({
      requester: currentUserId,
      recipient: targetId
    }).populate('requester recipient', 'name email nickname level selectedClass');

    res.status(201).json({
      msg: 'Friend request sent.',
      friendship: friendshipWithUser(friendship, currentUserId)
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Friend request already exists.' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/friends/accept/:userId
// @desc    Accept a friend request from userId
router.post('/accept/:userId', auth, async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ msg: 'Invalid user id' });
  }

  try {
    const friendship = await Friendship.findOne({
      requester: userId,
      recipient: req.user.id,
      status: 'pending'
    });

    if (!friendship) {
      return res.status(404).json({ msg: 'No pending request from this user.' });
    }

    friendship.status = 'accepted';
    friendship.updatedAt = new Date();
    await friendship.save();

    const populated = await Friendship.findById(friendship._id)
      .populate('requester recipient', 'name email nickname level selectedClass');

    res.json({
      msg: 'Friend request accepted.',
      friendship: friendshipWithUser(populated, req.user.id)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/friends/decline/:userId
// @desc    Decline a friend request from userId
router.post('/decline/:userId', auth, async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ msg: 'Invalid user id' });
  }

  try {
    const friendship = await Friendship.findOne({
      requester: userId,
      recipient: req.user.id,
      status: 'pending'
    });

    if (!friendship) {
      return res.status(404).json({ msg: 'No pending request from this user.' });
    }

    friendship.status = 'declined';
    friendship.updatedAt = new Date();
    await friendship.save();

    res.json({ msg: 'Friend request declined.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/friends/:userId
// @desc    Remove friend or cancel outgoing request
router.delete('/:userId', auth, async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ msg: 'Invalid user id' });
  }

  try {
    const result = await Friendship.deleteOne({
      $or: [
        { requester: req.user.id, recipient: userId },
        { requester: userId, recipient: req.user.id }
      ]
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: 'Friendship not found.' });
    }

    res.json({ msg: 'Friend removed.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
