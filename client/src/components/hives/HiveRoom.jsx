import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { PixelAvatar } from '../avatar/PixelAvatar';
import { DeskDecorRenderer } from '../library/DeskDecorRenderer';
import { SharedHiveTimer } from './SharedHiveTimer';
import { HiveSeatModal } from './HiveSeatModal';
import { TaskList } from '../tasks/TaskList';
import {
  Users,
  Copy,
  Check,
  LogOut,
  Armchair,
  BookOpen,
  Sparkles,
  Crown,
  ChevronRight,
} from 'lucide-react';

export const HIVE_DESKS_CONFIG = [
  {
    id: 'desk_window',
    name: 'The Window Alcove',
    icon: '🌧️',
    description: 'Overlooking the rainy cobblestone garden with gentle ambient drizzle.',
  },
  {
    id: 'desk_oak',
    name: 'The Grand Oak Table',
    icon: '📚',
    description: 'Sturdy polished oak desk with an antique brass banker’s lamp.',
  },
  {
    id: 'desk_hearth',
    name: 'The Fireplace Hearth',
    icon: '🔥',
    description: 'Cozy wingback chair beside a crackling warm stone fireplace.',
  },
  {
    id: 'desk_nook',
    name: 'The Bookshelf Nook',
    icon: '📖',
    description: 'Tucked quietly between antique leather-bound encyclopedia rows.',
  },
  {
    id: 'desk_botanical',
    name: 'The Botanical Corner',
    icon: '🌿',
    description: 'Surrounded by blooming jasmine, hanging ivy, and a sweet honey jar.',
  },
  {
    id: 'desk_balcony',
    name: 'The Balcony View',
    icon: '☕',
    description: 'Fresh morning air with a panorama of the library terrace garden.',
  },
];

export const HiveRoom = ({ hive: initialHive, onLeaveHive }) => {
  const { user } = useAuth();
  const { socket, joinHive, leaveHive, claimDesk, vacateDesk } = useSocket();

  const [hive, setHive] = useState(initialHive);
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync when initialHive prop updates
  useEffect(() => {
    setHive(initialHive);
  }, [initialHive]);

  // Join hive room via socket on mount
  useEffect(() => {
    if (!hive?._id) return;
    joinHive(hive._id);

    if (!socket) return;

    const handleHiveState = ({ hive: updatedHive }) => {
      setHive(updatedHive);
    };

    const handleMemberJoined = ({ user: newUser }) => {
      setHive((prev) => {
        if (!prev) return prev;
        const exists = prev.members?.some((m) => m._id === newUser._id);
        if (exists) return prev;
        return {
          ...prev,
          members: [...(prev.members || []), newUser],
        };
      });
    };

    const handleMemberLeft = ({ userId }) => {
      setHive((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          members: prev.members?.filter((m) => m._id !== userId) || [],
          desks: prev.desks?.filter((d) => d.user?._id !== userId && d.user !== userId) || [],
        };
      });
    };

    const handleDeskClaimed = ({ deskId, user: seatedUser, subject }) => {
      setHive((prev) => {
        if (!prev) return prev;
        const filteredDesks =
          prev.desks?.filter(
            (d) =>
              d.deskId !== deskId &&
              d.user?._id !== seatedUser._id &&
              d.user !== seatedUser._id
          ) || [];
        return {
          ...prev,
          desks: [
            ...filteredDesks,
            {
              deskId,
              user: seatedUser,
              subject,
              seatedAt: new Date(),
            },
          ],
        };
      });
    };

    const handleDeskVacated = ({ deskId }) => {
      setHive((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          desks: prev.desks?.filter((d) => d.deskId !== deskId) || [],
        };
      });
    };

    socket.on('hive:state', handleHiveState);
    socket.on('hive:member_joined', handleMemberJoined);
    socket.on('hive:member_left', handleMemberLeft);
    socket.on('hive:desk_claimed', handleDeskClaimed);
    socket.on('hive:desk_vacated', handleDeskVacated);

    return () => {
      socket.off('hive:state', handleHiveState);
      socket.off('hive:member_joined', handleMemberJoined);
      socket.off('hive:member_left', handleMemberLeft);
      socket.off('hive:desk_claimed', handleDeskClaimed);
      socket.off('hive:desk_vacated', handleDeskVacated);
      leaveHive(hive._id);
    };
  }, [hive?._id, socket]);

  // Find if current user is seated at a desk
  const currentUserIdStr = user?._id?.toString();
  const myOccupiedDesk = hive?.desks?.find(
    (d) => (d.user?._id?.toString() || d.user?.toString()) === currentUserIdStr
  );

  const handleCopyCode = () => {
    if (!hive?.joinCode) return;
    navigator.clipboard.writeText(hive.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleClaimDeskConfirm = ({ deskId, subject }) => {
    claimDesk(hive._id, deskId, subject);
  };

  const handleVacateDesk = (deskId) => {
    vacateDesk(hive._id, deskId);
  };

  const handleLeaveRoom = () => {
    leaveHive(hive._id);
    if (onLeaveHive) onLeaveHive();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Plaque */}
      <div className="pixel-panel bg-cream-100 p-4 shadow-pixel flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🐝</span>
            <h2 className="font-pixel text-sm sm:text-base text-honey-900 tracking-wider">
              {hive.name}
            </h2>
            <span className="bg-honey-200 border border-pixel-border px-2 py-0.5 text-[10px] font-sans font-semibold text-oak-800">
              {hive.topic || 'Group Study'}
            </span>
          </div>
          <p className="font-sans text-xs text-oak-600 mt-1">
            Real-time multiplayer study hall • Connected scholars focus together
          </p>
        </div>

        {/* Shareable Join Code & Actions */}
        <div className="flex items-center gap-3">
          <div
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 bg-honey-200 hover:bg-honey-300 border-2 border-pixel-border px-3 py-1.5 shadow-pixel-sm cursor-pointer select-none transition-colors"
            title="Click to copy join code"
          >
            <span className="font-sans text-[10px] uppercase font-bold text-oak-700">CODE:</span>
            <span className="font-mono font-bold text-sm tracking-widest text-honey-950">
              {hive.joinCode}
            </span>
            {copiedCode ? (
              <span className="text-emerald-700 font-sans text-[10px] font-bold flex items-center gap-0.5 ml-1">
                <Check size={12} /> COPIED!
              </span>
            ) : (
              <Copy size={13} className="text-oak-700 ml-0.5" />
            )}
          </div>

          <button
            type="button"
            onClick={handleLeaveRoom}
            className="pixel-btn bg-cream-200 hover:bg-red-100 hover:text-red-700 text-xs py-2 px-3 flex items-center gap-1.5 shadow-pixel-sm"
          >
            <LogOut size={13} />
            <span>LEAVE HIVE</span>
          </button>
        </div>
      </div>

      {/* Active Hive Members Bar */}
      <div className="pixel-panel bg-cream-50 p-2.5 shadow-pixel-sm flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <Users size={14} className="text-honey-700" />
          <span className="font-pixel text-[10px] text-oak-900">
            HIVE MEMBERS ({hive.members?.length || 1}):
          </span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          {hive.members?.map((m) => {
            const isHost = (hive.host?._id || hive.host)?.toString() === m._id?.toString();
            const isMe = m._id?.toString() === currentUserIdStr;

            return (
              <div
                key={m._id}
                className={`flex items-center gap-1.5 px-2 py-1 border border-pixel-border text-xs font-sans shrink-0 ${
                  isMe
                    ? 'bg-honey-200 text-oak-900 font-bold shadow-pixel-xs'
                    : 'bg-cream-100 text-oak-800'
                }`}
              >
                <PixelAvatar size={18} equipped={m.equippedItems} animated={false} />
                <span>{m.username}</span>
                {isHost && (
                  <Crown size={12} className="text-amber-600 fill-amber-500" title="Hive Host" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Split Layout: Library Room on Left, Focus Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Pixel Library Room Multi-Desk Hall (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-7">
          <div className="pixel-panel bg-cream-100 overflow-hidden shadow-pixel-lg">
            {/* Header */}
            <div className="pixel-panel-header">
              <div className="flex items-center gap-2">
                <span className="text-sm">🏛️</span>
                <span className="font-pixel text-[11px] text-oak-900">
                  CO-WORKING ARCHIVES ({hive.desks?.length || 0}/6 DESKS OCCUPIED)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 border border-pixel-border px-2 py-0.5 font-pixel text-[9px]">
                  LIVE SYNCED ⚡
                </span>
              </div>
            </div>

            {/* Library Visual Backdrop */}
            <div className="p-4 sm:p-5 relative bg-[#EFE3C3] border-b-4 border-pixel-border">
              {/* Bookshelf Wall Background Pattern */}
              <div className="relative mb-5 bg-[#78350F] border-3 border-pixel-border p-3 shadow-pixel-sm overflow-hidden">
                <div className="h-2 bg-[#92400E] border-b-2 border-pixel-border -mx-3 -mt-3 mb-2 flex items-center justify-around">
                  <div className="w-8 h-1 bg-[#B45309]" />
                  <div className="w-8 h-1 bg-[#B45309]" />
                  <div className="w-8 h-1 bg-[#B45309]" />
                </div>

                <div className="flex items-end justify-between gap-1 overflow-x-auto py-1">
                  <div className="flex items-end gap-1">
                    <div className="w-3 h-10 bg-[#B91C1C] border border-pixel-border" />
                    <div className="w-2.5 h-12 bg-[#D97706] border border-pixel-border" />
                    <div className="w-4 h-9 bg-[#1E3A8A] border border-pixel-border" />
                    <div className="w-3 h-11 bg-[#14532D] border border-pixel-border" />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 bg-honey-400 border-2 border-pixel-border rounded-xs shadow-pixel-sm flex items-center justify-center text-[10px]">
                      🕰️
                    </div>
                    <div className="w-2 h-2 bg-[#451A03]" />
                  </div>
                  <div className="flex items-end gap-1">
                    <div className="w-4 h-11 bg-[#7C2D12] border border-pixel-border" />
                    <div className="w-3 h-8 bg-[#047857] border border-pixel-border" />
                    <div className="w-5 h-7 bg-amber-200 border border-pixel-border flex items-center justify-center text-[10px]">
                      🌿
                    </div>
                  </div>
                </div>

                <div className="absolute top-1 left-8 w-6 h-6 bg-yellow-300/30 rounded-full blur-xs pointer-events-none" />
                <div className="absolute top-1 right-8 w-6 h-6 bg-yellow-300/30 rounded-full blur-xs pointer-events-none" />
              </div>

              {/* Multi-Desk Floor Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {HIVE_DESKS_CONFIG.map((desk) => {
                  const occupant = hive.desks?.find((d) => d.deskId === desk.id);
                  const occupantUser = occupant?.user;
                  const isMe =
                    occupantUser &&
                    (occupantUser._id?.toString() || occupantUser.toString()) === currentUserIdStr;
                  const isOpen = !occupantUser;

                  return (
                    <div
                      key={desk.id}
                      onClick={() => {
                        if (isOpen) {
                          setSelectedDesk(desk);
                          setIsSeatModalOpen(true);
                        }
                      }}
                      className={`relative p-3.5 border-3 transition-all duration-100 select-none ${
                        isMe
                          ? 'bg-amber-100 border-honey-600 shadow-pixel ring-2 ring-honey-500'
                          : occupantUser
                          ? 'bg-cream-100 border-pixel-border shadow-pixel-sm'
                          : 'bg-cream-50 border-pixel-border shadow-pixel hover:-translate-y-0.5 hover:shadow-pixel-lg cursor-pointer hover:bg-white'
                      }`}
                    >
                      {/* Desk Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl" title={desk.name}>
                          {desk.icon}
                        </span>
                        {isMe ? (
                          <span className="bg-emerald-600 text-white font-pixel text-[8px] px-2 py-0.5 border border-pixel-border shadow-pixel-sm animate-pulse">
                            YOU'RE HERE 🐝
                          </span>
                        ) : occupantUser ? (
                          <span className="bg-oak-800 text-cream-100 font-pixel text-[8px] px-1.5 py-0.5 border border-pixel-border">
                            OCCUPIED
                          </span>
                        ) : (
                          <span className="bg-honey-400 text-oak-900 font-pixel text-[8px] px-1.5 py-0.5 border border-pixel-border shadow-pixel-sm">
                            OPEN SEAT
                          </span>
                        )}
                      </div>

                      <h4 className="font-pixel text-[10px] text-oak-900 mb-1 truncate">
                        {desk.name}
                      </h4>

                      {/* Desk Surface & Occupant Avatar */}
                      <div className="my-2 bg-[#D4C3A3] border-2 border-pixel-border p-2.5 flex items-center justify-center min-h-[95px] relative">
                        <div className="absolute inset-x-2 bottom-1.5 h-3 bg-[#92400E] border border-pixel-border shadow-inner" />

                        {occupantUser ? (
                          <div className="flex flex-col items-center z-10 relative">
                            <PixelAvatar
                              size={46}
                              equipped={occupantUser.equippedItems}
                              animated={true}
                            />
                            <div className="bg-honey-500 border border-pixel-border px-1.5 py-0.2 mt-1 shadow-pixel-sm">
                              <span className="font-pixel text-[8px] text-oak-900 truncate max-w-[90px] block">
                                {occupantUser.username || 'Scholar'}
                              </span>
                            </div>

                            {/* Desk Decor */}
                            <div className="absolute -bottom-1 -right-8 z-20">
                              <DeskDecorRenderer
                                decorId={occupantUser.equippedItems?.deskDecor || 'decor_mug'}
                                size={22}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center z-10 text-oak-600 group">
                            <div className="w-9 h-9 border-2 border-dashed border-oak-600/70 bg-cream-100/60 rounded flex items-center justify-center">
                              <Armchair size={18} className="text-oak-700" />
                            </div>
                            <span className="font-pixel text-[8px] text-honey-800 mt-1.5 group-hover:scale-105 transition-transform">
                              + CLAIM DESK
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Subject Tag or Vacate Option */}
                      <div className="text-[11px] font-sans truncate">
                        {occupantUser ? (
                          <div className="flex items-center justify-between gap-1">
                            <div className="text-emerald-950 font-semibold truncate flex items-center gap-1">
                              <span className="text-xs">📖</span>
                              <span className="truncate">{occupant.subject}</span>
                            </div>
                            {isMe && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVacateDesk(desk.id);
                                }}
                                className="text-[9px] font-pixel text-red-700 hover:text-red-900 underline shrink-0"
                              >
                                STAND UP
                              </button>
                            )}
                          </div>
                        ) : (
                          <p className="text-oak-600 text-[11px] truncate">{desk.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desk Room Hint Footer */}
            <div className="p-3 bg-cream-50 font-sans text-xs text-oak-700 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>
                  {myOccupiedDesk
                    ? `You are seated at ${
                        HIVE_DESKS_CONFIG.find((d) => d.id === myOccupiedDesk.deskId)?.name ||
                        'your desk'
                      }.`
                    : 'Click any open desk above to sit with your hive and focus.'}
                </span>
              </div>
              <div className="text-oak-600 text-[11px]">
                {6 - (hive.desks?.length || 0)} of 6 Desks Available
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Shared Hive Pomodoro & Personal Tasks List (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          {/* Shared Hive Pomodoro Timer */}
          <SharedHiveTimer
            hiveId={hive._id}
            initialTimerState={hive.timerState}
          />

          {/* Member's Private Tasks List (private to them) */}
          <div className="space-y-1">
            <div className="bg-honey-200 border-2 border-pixel-border px-3 py-1.5 font-pixel text-[10px] text-oak-900 flex items-center justify-between shadow-pixel-sm">
              <span>MY PERSONAL HIVE GOALS 🔒</span>
              <span className="font-sans text-[10px] font-semibold text-oak-700">
                (Visible only to you)
              </span>
            </div>
            <TaskList sessionId={`hive_${hive._id}_${currentUserIdStr}`} />
          </div>
        </div>
      </div>

      {/* Seat Subject Modal */}
      <HiveSeatModal
        isOpen={isSeatModalOpen}
        onClose={() => setIsSeatModalOpen(false)}
        desk={selectedDesk}
        onConfirmSeat={handleClaimDeskConfirm}
      />
    </div>
  );
};
