import { Friendship } from '../models/Friendship.js';
import { User } from '../models/User.js';
import { getUserPresence } from '../sockets/socketHandler.js';

// Search users by username
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.json({ users: [] });
    }

    const currentUserId = req.user._id;
    const searchRegex = new RegExp(q.trim(), 'i');

    const users = await User.find({
      username: searchRegex,
      _id: { $ne: currentUserId },
      isBanned: false,
    })
      .select('username equippedItems avatarConfig level streak')
      .limit(15);

    // Retrieve friendship status with each found user
    const userIds = users.map((u) => u._id);
    const friendships = await Friendship.find({
      $or: [
        { requester: currentUserId, recipient: { $in: userIds } },
        { recipient: currentUserId, requester: { $in: userIds } },
      ],
    });

    const userResults = users.map((u) => {
      const uObj = u.toObject();
      const existing = friendships.find(
        (f) =>
          (f.requester.toString() === currentUserId.toString() &&
            f.recipient.toString() === u._id.toString()) ||
          (f.recipient.toString() === currentUserId.toString() &&
            f.requester.toString() === u._id.toString())
      );

      let friendshipStatus = 'none';
      let friendshipId = null;

      if (existing) {
        friendshipId = existing._id;
        if (existing.status === 'accepted') {
          friendshipStatus = 'accepted';
        } else if (existing.status === 'pending') {
          if (existing.requester.toString() === currentUserId.toString()) {
            friendshipStatus = 'pending_outgoing';
          } else {
            friendshipStatus = 'pending_incoming';
          }
        }
      }

      const presence = getUserPresence ? getUserPresence(u._id.toString()) : { status: 'offline' };

      return {
        ...uObj,
        friendshipStatus,
        friendshipId,
        presence,
      };
    });

    res.json({ users: userResults });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Failed to search users', error: error.message });
  }
};

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { recipientId, username } = req.body;

    let targetUser = null;
    if (recipientId) {
      targetUser = await User.findById(recipientId);
    } else if (username) {
      targetUser = await User.findOne({ username: username.trim() });
    }

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (targetUser._id.toString() === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot send a friend request to yourself.' });
    }

    // Check existing friendship
    const existing = await Friendship.findOne({
      $or: [
        { requester: currentUserId, recipient: targetUser._id },
        { recipient: currentUserId, requester: targetUser._id },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ message: 'You are already friends with this scholar!' });
      }

      if (existing.status === 'pending') {
        if (existing.requester.toString() === currentUserId.toString()) {
          return res.status(400).json({ message: 'Friend request already sent.' });
        } else {
          // If the other person already sent a request, auto-accept it!
          existing.status = 'accepted';
          await existing.save();
          return res.json({
            message: `You and ${targetUser.username} are now friends! 🐝`,
            friendship: existing,
          });
        }
      }

      // If rejected earlier, renew request
      existing.requester = currentUserId;
      existing.recipient = targetUser._id;
      existing.status = 'pending';
      await existing.save();

      return res.json({
        message: `Friend request sent to ${targetUser.username}! 💌`,
        friendship: existing,
      });
    }

    const friendship = new Friendship({
      requester: currentUserId,
      recipient: targetUser._id,
      status: 'pending',
    });

    await friendship.save();

    res.status(201).json({
      message: `Friend request sent to ${targetUser.username}! 💌`,
      friendship,
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Failed to send friend request', error: error.message });
  }
};

// Get accepted friends list with online/offline/in_hive presence
export const getFriends = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const friendships = await Friendship.find({
      status: 'accepted',
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
    })
      .populate('requester', 'username equippedItems avatarConfig level streak')
      .populate('recipient', 'username equippedItems avatarConfig level streak')
      .sort({ updatedAt: -1 });

    const friends = friendships.map((f) => {
      const isRequester = f.requester._id.toString() === currentUserId.toString();
      const friendUser = isRequester ? f.recipient : f.requester;
      const presence = getUserPresence
        ? getUserPresence(friendUser._id.toString())
        : { status: 'offline' };

      return {
        friendshipId: f._id,
        user: friendUser,
        presence,
        friendsSince: f.updatedAt,
      };
    });

    res.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Failed to load friends list', error: error.message });
  }
};

// Get pending incoming and outgoing friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const incoming = await Friendship.find({
      recipient: currentUserId,
      status: 'pending',
    })
      .populate('requester', 'username equippedItems avatarConfig level streak')
      .sort({ createdAt: -1 });

    const outgoing = await Friendship.find({
      requester: currentUserId,
      status: 'pending',
    })
      .populate('recipient', 'username equippedItems avatarConfig level streak')
      .sort({ createdAt: -1 });

    res.json({ incoming, outgoing });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ message: 'Failed to load friend requests', error: error.message });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id.toString();

    const friendship = await Friendship.findById(id).populate(
      'requester recipient',
      'username equippedItems avatarConfig'
    );

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found.' });
    }

    if (friendship.recipient._id.toString() !== currentUserId) {
      return res.status(403).json({ message: 'You cannot accept a request not addressed to you.' });
    }

    friendship.status = 'accepted';
    await friendship.save();

    res.json({
      message: `Accepted friend request! You and ${friendship.requester.username} are now friends. 🐝`,
      friendship,
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Failed to accept friend request', error: error.message });
  }
};

// Reject a friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id.toString();

    const friendship = await Friendship.findById(id);

    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found.' });
    }

    if (friendship.recipient.toString() !== currentUserId) {
      return res.status(403).json({ message: 'You cannot reject a request not addressed to you.' });
    }

    friendship.status = 'rejected';
    await friendship.save();

    res.json({ message: 'Friend request declined.', friendshipId: id });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: 'Failed to reject friend request', error: error.message });
  }
};

// Cancel an outgoing request or remove an existing friend
export const cancelOrRemoveFriend = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id.toString();

    const friendship = await Friendship.findById(id);

    if (!friendship) {
      return res.status(404).json({ message: 'Friendship record not found.' });
    }

    if (
      friendship.requester.toString() !== currentUserId &&
      friendship.recipient.toString() !== currentUserId
    ) {
      return res.status(403).json({ message: 'Unauthorized action.' });
    }

    await Friendship.findByIdAndDelete(id);

    res.json({ message: 'Friendship removed.', friendshipId: id });
  } catch (error) {
    console.error('Error cancelling or removing friend:', error);
    res.status(500).json({ message: 'Failed to remove friendship', error: error.message });
  }
};
