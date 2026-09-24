import React, { useState, useEffect } from 'react';
import { friendsAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { PixelAvatar } from '../avatar/PixelAvatar';
import {
  Users,
  Search,
  UserPlus,
  Check,
  X,
  MessageCircle,
  Clock,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const FriendsModal = ({
  isOpen,
  onClose,
  onOpenChat,
  onJoinHiveDirectly,
  onPendingCountChange,
}) => {
  const { socket, presenceMap } = useSocket();
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' | 'requests' | 'search'

  // Data
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Loading & feedback states
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const loadFriendsAndRequests = async () => {
    setLoading(true);
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        friendsAPI.getFriends(),
        friendsAPI.getRequests(),
      ]);

      setFriends(friendsRes.friends || []);
      setIncomingRequests(requestsRes.incoming || []);
      setOutgoingRequests(requestsRes.outgoing || []);

      if (onPendingCountChange) {
        onPendingCountChange(requestsRes.incoming?.length || 0);
      }
    } catch (err) {
      console.error('Failed to load friends/requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFriendsAndRequests();
      setMsg('');
      setError('');
    }
  }, [isOpen]);

  // Listen to presence or friend socket updates
  useEffect(() => {
    if (!socket) return;

    const handleFriendUpdate = () => {
      loadFriendsAndRequests();
    };

    socket.on('friend:request_received', handleFriendUpdate);
    socket.on('friend:accepted', handleFriendUpdate);

    return () => {
      socket.off('friend:request_received', handleFriendUpdate);
      socket.off('friend:accepted', handleFriendUpdate);
    };
  }, [socket]);

  // Search users
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    try {
      const data = await friendsAPI.search(searchQuery.trim());
      setSearchResults(data.users || []);
    } catch (err) {
      setError(err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (targetUser) => {
    setActionLoadingId(targetUser._id);
    setError('');
    try {
      await friendsAPI.sendRequest({ recipientId: targetUser._id });
      setMsg(`Friend request sent to ${targetUser.username}! 💌`);
      // Update local search results state
      setSearchResults((prev) =>
        prev.map((u) =>
          u._id === targetUser._id ? { ...u, friendshipStatus: 'pending_outgoing' } : u
        )
      );
      loadFriendsAndRequests();
    } catch (err) {
      setError(err.message || 'Failed to send request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAccept = async (requestId) => {
    setActionLoadingId(requestId);
    setError('');
    try {
      await friendsAPI.acceptRequest(requestId);
      setMsg('Accepted friend request! 🐝');
      loadFriendsAndRequests();
    } catch (err) {
      setError(err.message || 'Failed to accept request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoadingId(requestId);
    setError('');
    try {
      await friendsAPI.rejectRequest(requestId);
      setMsg('Request declined.');
      loadFriendsAndRequests();
    } catch (err) {
      setError(err.message || 'Failed to reject request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelOrRemove = async (friendshipId, username) => {
    setActionLoadingId(friendshipId);
    setError('');
    try {
      await friendsAPI.cancelOrRemove(friendshipId);
      setMsg(`Removed friendship with ${username || 'scholar'}.`);
      loadFriendsAndRequests();
    } catch (err) {
      setError(err.message || 'Failed to update friendship.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-oak-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-xl pixel-panel bg-cream-100 p-0 overflow-hidden shadow-pixel-lg">
        {/* Title Bar */}
        <div className="pixel-panel-header">
          <div className="flex items-center gap-2">
            <span className="text-base">🐝</span>
            <span className="font-pixel text-[11px] text-oak-900 tracking-wider">
              STUDY FRIENDS & SCHOLARS
            </span>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-honey-500 p-0.5 border border-pixel-border text-oak-900"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-pixel-border bg-cream-200">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 text-xs font-pixel flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'friends'
                ? 'bg-cream-100 border-b-2 border-honey-600 text-oak-900 font-bold'
                : 'text-oak-600 hover:bg-cream-50'
            }`}
          >
            <Users size={13} />
            <span>MY FRIENDS ({friends.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 text-xs font-pixel flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'requests'
                ? 'bg-cream-100 border-b-2 border-honey-600 text-oak-900 font-bold'
                : 'text-oak-600 hover:bg-cream-50'
            }`}
          >
            <Clock size={13} />
            <span>REQUESTS</span>
            {incomingRequests.length > 0 && (
              <span className="bg-red-500 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 text-xs font-pixel flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'search'
                ? 'bg-cream-100 border-b-2 border-honey-600 text-oak-900 font-bold'
                : 'text-oak-600 hover:bg-cream-50'
            }`}
          >
            <Search size={13} />
            <span>FIND SCHOLARS</span>
          </button>
        </div>

        {/* Status Toast Messages */}
        {msg && (
          <div className="bg-emerald-100 border-b border-emerald-300 px-4 py-1.5 text-xs font-sans text-emerald-900 flex items-center justify-between">
            <span>✨ {msg}</span>
            <button onClick={() => setMsg('')} className="text-emerald-700 hover:text-emerald-900">
              <X size={12} />
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-b border-red-300 px-4 py-1.5 text-xs font-sans text-red-900 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              <X size={12} />
            </button>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-4 sm:p-5 max-h-[460px] overflow-y-auto space-y-3">
          {/* TAB 1: FRIENDS LIST */}
          {activeTab === 'friends' && (
            <div>
              {loading && friends.length === 0 ? (
                <div className="text-center py-8 font-sans text-xs text-oak-600">
                  Loading study friends...
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-10 bg-cream-50 border-2 border-dashed border-pixel-border/40 p-4">
                  <div className="text-3xl mb-2">📜</div>
                  <h4 className="font-pixel text-xs text-oak-900 mb-1">NO STUDY FRIENDS YET</h4>
                  <p className="font-sans text-xs text-oak-600 mb-3 max-w-xs mx-auto">
                    Search for classmates in the "Find Scholars" tab to exchange study tips and chat!
                  </p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="pixel-btn-primary text-xs px-3 py-1.5"
                  >
                    SEARCH SCHOLARS
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {friends.map(({ friendshipId, user: friendUser, presence: initialPresence }) => {
                    // Check live socket presence overrides
                    const livePresence = presenceMap[friendUser._id] || initialPresence;
                    const isOnline = livePresence?.status === 'online' || livePresence?.status === 'in_hive';
                    const isInHive = livePresence?.status === 'in_hive';

                    return (
                      <div
                        key={friendshipId}
                        className="pixel-panel bg-cream-50 p-3 shadow-pixel-sm flex items-center justify-between gap-3 flex-wrap"
                      >
                        {/* Avatar & User Info */}
                        <div className="flex items-center gap-3 truncate">
                          <div className="relative">
                            <PixelAvatar
                              size={34}
                              equipped={friendUser.equippedItems}
                              animated={false}
                            />
                            {/* Status Dot */}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-pixel-border ${
                                isInHive
                                  ? 'bg-amber-500 animate-pulse'
                                  : isOnline
                                  ? 'bg-emerald-500'
                                  : 'bg-oak-400'
                              }`}
                              title={
                                isInHive
                                  ? `In Hive: ${livePresence?.hiveName || 'Study Room'}`
                                  : isOnline
                                  ? 'Online at library'
                                  : 'Offline'
                              }
                            />
                          </div>

                          <div className="truncate">
                            <div className="font-pixel text-xs text-oak-900 truncate">
                              {friendUser.username}
                            </div>
                            <div className="font-sans text-[11px] text-oak-600 flex items-center gap-1.5 mt-0.5">
                              {isInHive ? (
                                <span className="text-amber-800 font-semibold flex items-center gap-1">
                                  <span>🐝</span>
                                  <span>In Hive: {livePresence.hiveName || 'Study Room'}</span>
                                </span>
                              ) : isOnline ? (
                                <span className="text-emerald-700 font-semibold">🟢 Online</span>
                              ) : (
                                <span className="text-oak-500">⚪ Offline</span>
                              )}
                              <span>• LVL {friendUser.level || 1}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions: Chat & Join Hive */}
                        <div className="flex items-center gap-2">
                          {isInHive && livePresence?.hiveId && onJoinHiveDirectly && (
                            <button
                              type="button"
                              onClick={() => {
                                onJoinHiveDirectly(livePresence.hiveId);
                                onClose();
                              }}
                              className="pixel-btn bg-honey-400 hover:bg-honey-500 text-oak-900 text-[10px] py-1 px-2 flex items-center gap-1"
                              title="Join this friend's study hive"
                            >
                              <span>JOIN HIVE</span>
                              <ArrowRight size={11} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenChat) onOpenChat(friendUser);
                              onClose();
                            }}
                            className="pixel-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                          >
                            <MessageCircle size={13} />
                            <span>CHAT</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCancelOrRemove(friendshipId, friendUser.username)}
                            className="text-oak-400 hover:text-red-600 p-1"
                            title="Unfriend"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REQUESTS (INCOMING & OUTGOING) */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {/* Incoming Requests */}
              <div>
                <h4 className="font-pixel text-[10px] text-oak-800 mb-2 flex items-center gap-1.5">
                  <span>INCOMING FRIEND REQUESTS ({incomingRequests.length})</span>
                </h4>

                {incomingRequests.length === 0 ? (
                  <p className="font-sans text-xs text-oak-500 bg-cream-50 p-3 border border-pixel-border/30">
                    No pending friend requests waiting for your approval.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {incomingRequests.map((req) => (
                      <div
                        key={req._id}
                        className="pixel-panel bg-honey-50 p-2.5 shadow-pixel-sm flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <PixelAvatar
                            size={28}
                            equipped={req.requester?.equippedItems}
                            animated={false}
                          />
                          <div className="truncate">
                            <span className="font-pixel text-xs text-oak-900">
                              {req.requester?.username}
                            </span>
                            <div className="text-[10px] font-sans text-oak-600">
                              Wants to be study friends!
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={actionLoadingId === req._id}
                            onClick={() => handleAccept(req._id)}
                            className="pixel-btn bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] py-1 px-2.5 flex items-center gap-1"
                          >
                            <Check size={12} />
                            <span>ACCEPT</span>
                          </button>
                          <button
                            type="button"
                            disabled={actionLoadingId === req._id}
                            onClick={() => handleReject(req._id)}
                            className="pixel-btn bg-cream-200 hover:bg-red-100 hover:text-red-700 text-[10px] py-1 px-2"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Requests */}
              <div>
                <h4 className="font-pixel text-[10px] text-oak-800 mb-2 flex items-center gap-1.5">
                  <span>SENT REQUESTS PENDING ({outgoingRequests.length})</span>
                </h4>

                {outgoingRequests.length === 0 ? (
                  <p className="font-sans text-xs text-oak-500 bg-cream-50 p-3 border border-pixel-border/30">
                    No outgoing friend requests pending.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {outgoingRequests.map((req) => (
                      <div
                        key={req._id}
                        className="pixel-panel bg-cream-50 p-2.5 shadow-pixel-sm flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <PixelAvatar
                            size={26}
                            equipped={req.recipient?.equippedItems}
                            animated={false}
                          />
                          <span className="font-pixel text-xs text-oak-900 truncate">
                            {req.recipient?.username}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCancelOrRemove(req._id, req.recipient?.username)}
                          className="pixel-btn text-[10px] py-1 px-2.5 text-oak-600 hover:text-red-700"
                        >
                          CANCEL REQUEST
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SEARCH SCHOLARS */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-oak-500 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by username (e.g. Maya, Sam)..."
                    className="w-full pixel-input text-xs pl-8 py-2 font-sans"
                    maxLength={20}
                  />
                </div>
                <button type="submit" className="pixel-btn-primary text-xs px-4 py-2">
                  SEARCH
                </button>
              </form>

              {/* Search Results */}
              <div>
                {searchResults.length === 0 && searchQuery && !loading ? (
                  <div className="text-center py-6 font-sans text-xs text-oak-600 bg-cream-50 border border-pixel-border/30">
                    No scholars found matching "{searchQuery}".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((scholar) => {
                      const isFriend = scholar.friendshipStatus === 'accepted';
                      const isPendingOutgoing = scholar.friendshipStatus === 'pending_outgoing';
                      const isPendingIncoming = scholar.friendshipStatus === 'pending_incoming';

                      return (
                        <div
                          key={scholar._id}
                          className="pixel-panel bg-cream-50 p-2.5 shadow-pixel-sm flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <PixelAvatar
                              size={30}
                              equipped={scholar.equippedItems}
                              animated={false}
                            />
                            <div className="truncate">
                              <div className="font-pixel text-xs text-oak-900 truncate">
                                {scholar.username}
                              </div>
                              <div className="text-[10px] font-sans text-oak-600">
                                Level {scholar.level || 1} • {scholar.streak || 1}d Streak
                              </div>
                            </div>
                          </div>

                          <div>
                            {isFriend ? (
                              <span className="font-pixel text-[9px] text-emerald-800 bg-emerald-100 border border-pixel-border px-2 py-1">
                                FRIENDS ✓
                              </span>
                            ) : isPendingOutgoing ? (
                              <span className="font-pixel text-[9px] text-oak-600 bg-cream-200 border border-pixel-border px-2 py-1">
                                REQUEST SENT
                              </span>
                            ) : isPendingIncoming ? (
                              <button
                                type="button"
                                onClick={() => handleAccept(scholar.friendshipId)}
                                className="pixel-btn bg-emerald-500 text-white text-[10px] py-1 px-2.5"
                              >
                                ACCEPT
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={actionLoadingId === scholar._id}
                                onClick={() => handleSendRequest(scholar)}
                                className="pixel-btn-primary text-[10px] py-1 px-2.5 flex items-center gap-1"
                              >
                                <UserPlus size={12} />
                                <span>ADD FRIEND</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
