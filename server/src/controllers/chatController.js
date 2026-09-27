import { Message } from '../models/Message.js';
import { Friendship } from '../models/Friendship.js';

// Verify that two users are accepted friends
export const areAcceptedFriends = async (userId1, userId2) => {
  const friendship = await Friendship.findOne({
    status: 'accepted',
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 },
    ],
  });
  return !!friendship;
};

// Get message history between two friends (with pagination)
export const getChatHistory = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { friendId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));

    // Security check: Must be accepted friends
    const isFriend = await areAcceptedFriends(currentUserId, friendId);
    if (!isFriend) {
      return res.status(403).json({
        message: 'Chat is only allowed between accepted friends.',
      });
    }

    const query = {
      $or: [
        { sender: currentUserId, recipient: friendId },
        { sender: friendId, recipient: currentUserId },
      ],
    };

    const totalCount = await Message.countDocuments(query);
    const skip = (page - 1) * limit;

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      messages,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit) || 1,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Failed to fetch chat messages', error: error.message });
  }
};

// Mark messages from friend as read
export const markChatRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { friendId } = req.params;

    await Message.updateMany(
      {
        sender: friendId,
        recipient: currentUserId,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Failed to mark messages as read', error: error.message });
  }
};
