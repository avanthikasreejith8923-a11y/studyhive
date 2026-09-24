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

// Get message history between two friends
export const getChatHistory = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { friendId } = req.params;

    // Security check: Must be accepted friends
    const isFriend = await areAcceptedFriends(currentUserId, friendId);
    if (!isFriend) {
      return res.status(403).json({
        message: 'Chat is only allowed between accepted friends.',
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: friendId },
        { sender: friendId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(150);

    res.json({ messages });
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
