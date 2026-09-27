import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { PixelAvatar } from '../avatar/PixelAvatar';
import { X, Send, Check, CheckCheck, Clock, MessageSquare } from 'lucide-react';

export const ChatDrawer = ({ friend, onClose, currentUser }) => {
  const { socket, sendChatMessage, markChatRead, presenceMap } = useSocket();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load message history from MongoDB
  useEffect(() => {
    if (!friend?._id) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await chatAPI.getHistory(friend._id);
        setMessages(data.messages || []);
        // Mark as read in DB and via socket
        chatAPI.markRead(friend._id).catch(() => {});
        markChatRead(friend._id);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [friend?._id]);

  // Scroll to bottom on initial load and message updates
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time socket message and read receipt listeners
  useEffect(() => {
    if (!socket || !friend?._id) return;

    const handleIncomingMessage = (newMsg) => {
      const senderId = (newMsg.sender?._id || newMsg.sender)?.toString();
      const recipientId = (newMsg.recipient?._id || newMsg.recipient)?.toString();
      const friendIdStr = friend._id.toString();
      const currentUserIdStr = currentUser?._id?.toString();

      // Only handle if message belongs to this conversation
      const isThisConversation =
        (senderId === friendIdStr && recipientId === currentUserIdStr) ||
        (senderId === currentUserIdStr && recipientId === friendIdStr);

      if (isThisConversation) {
        setMessages((prev) => {
          // Avoid duplicate entries
          const exists = prev.some((m) => m._id === newMsg._id);
          if (exists) return prev;
          return [...prev, newMsg];
        });

        // If from friend, mark read immediately
        if (senderId === friendIdStr) {
          markChatRead(friend._id);
          chatAPI.markRead(friend._id).catch(() => {});
        }
      }
    };

    const handleReadReceipt = ({ readerId }) => {
      if (readerId === friend._id.toString()) {
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            read: true,
          }))
        );
      }
    };

    socket.on('chat:message', handleIncomingMessage);
    socket.on('chat:read_receipt', handleReadReceipt);

    return () => {
      socket.off('chat:message', handleIncomingMessage);
      socket.off('chat:read_receipt', handleReadReceipt);
    };
  }, [socket, friend?._id, currentUser?._id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending || !friend?._id) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      sendChatMessage(friend._id, textToSend);
    } catch (err) {
      console.error('Failed to emit message:', err);
    } finally {
      setSending(false);
    }
  };

  const friendPresence = presenceMap[friend._id] || friend.presence || { status: 'offline' };
  const isOnline =
    friendPresence.status === 'online' || friendPresence.status === 'in_hive';

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-full max-w-sm sm:max-w-md pixel-panel bg-cream-100 p-0 shadow-pixel-lg overflow-hidden flex flex-col h-[480px] max-h-[85vh]">
      {/* Chat Header */}
      <div className="pixel-panel-header flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <div className="relative">
            <PixelAvatar size={24} equipped={friend.equippedItems} animated={false} />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-pixel-border ${
                isOnline ? 'bg-emerald-500' : 'bg-oak-400'
              }`}
            />
          </div>
          <div className="truncate">
            <div className="font-pixel text-[11px] text-oak-900 truncate">
              {friend.username}
            </div>
            <div className="text-[9px] font-sans font-semibold text-oak-600 truncate">
              {friendPresence.status === 'in_hive'
                ? `🐝 In Hive: ${friendPresence.hiveName || 'Study Room'}`
                : isOnline
                ? '🟢 Active in Library'
                : '⚪ Offline'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={`Close chat with ${friend.username}`}
          className="hover:bg-honey-500 p-0.5 border border-pixel-border text-oak-900 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          title="Close Chat"
        >
          <X size={14} />
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-[#FAF6EE] border-b-2 border-pixel-border">
        {loading ? (
          <div className="text-center py-10 font-sans text-xs text-oak-500">
            Loading chat messages with {friend.username}...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="text-2xl mb-1">💬</div>
            <p className="font-pixel text-[10px] text-oak-800 mb-1">NO MESSAGES YET</p>
            <p className="font-sans text-xs text-oak-600">
              Say hello to {friend.username}! Ask what they're studying or invite them to a hive.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe =
              (msg.sender?._id || msg.sender)?.toString() === currentUser?._id?.toString();
            const timeStr = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <div
                key={msg._id || Math.random()}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2.5 border-2 text-xs font-sans break-words ${
                    isMe
                      ? 'bg-honey-200 border-honey-600 text-oak-900 shadow-pixel-xs'
                      : 'bg-white border-pixel-border text-oak-900 shadow-pixel-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Timestamp & Read Indicator */}
                <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px] font-sans text-oak-500">
                  <span>{timeStr}</span>
                  {isMe && (
                    <span>
                      {msg.read ? (
                        <CheckCheck size={11} className="text-emerald-700" title="Seen" />
                      ) : (
                        <Check size={11} className="text-oak-400" title="Delivered" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSendMessage} className="p-2.5 bg-cream-100 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${friend.username}...`}
          maxLength={1000}
          aria-label={`Type a direct message to ${friend.username}`}
          className="flex-1 pixel-input text-xs font-sans py-2 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          aria-label="Send direct message"
          className="pixel-btn-primary px-3 py-2 text-xs flex items-center gap-1 shadow-pixel-sm focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none disabled:opacity-50"
        >
          <Send size={13} />
          <span className="hidden sm:inline">SEND</span>
        </button>
      </form>
    </div>
  );
};
