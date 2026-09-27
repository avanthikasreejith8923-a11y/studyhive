import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PixelBee } from '../common/PixelBee';
import { PixelAvatar } from '../avatar/PixelAvatar';
import { LogOut, ShieldCheck, Flame, BookOpen, Users, Sparkles, Store, Gamepad2, ScrollText } from 'lucide-react';

export const Navbar = ({
  onOpenAuth,
  activeTab,
  setActiveTab,
  onOpenFriends,
  onOpenHistory,
  pendingRequestsCount = 0,
  isBreakActive = false,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-cream-100 border-b-4 border-pixel-border shadow-pixel px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Brand / Logo */}
        <div
          role="button"
          tabIndex={0}
          aria-label="StudyHive Home - My Desk"
          onClick={() => setActiveTab && setActiveTab('library')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab && setActiveTab('library');
            }
          }}
          className="flex items-center gap-3 cursor-pointer select-none group focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        >
          <div className="bg-honey-200 border-2 border-pixel-border p-1 shadow-pixel-sm group-hover:scale-105 transition-transform">
            <PixelBee size={36} animated={true} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-pixel text-base text-honey-800 tracking-wider">
                STUDYHIVE
              </span>
              <span className="bg-honey-500 text-oak-900 border border-pixel-border text-[9px] font-pixel px-1 py-0.2 shadow-pixel-sm">
                BETA
              </span>
            </div>
            <p className="font-retro text-xs text-oak-700">Cozy Pixel Co-Working Library</p>
          </div>
        </div>

        {/* Navigation Tabs (if logged in) - with responsive horizontal scroll for small screens */}
        {isAuthenticated && (
          <nav
            aria-label="Main Navigation"
            className="flex items-center gap-1.5 bg-cream-200 p-1 border-2 border-pixel-border shadow-pixel-sm max-w-full overflow-x-auto scrollbar-none"
          >
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              aria-label="Navigate to My Desk"
              className={`pixel-btn text-[10px] py-1 px-2.5 shrink-0 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                activeTab === 'library' ? 'bg-honey-500 text-oak-900 font-bold' : 'bg-cream-100'
              }`}
            >
              <BookOpen size={12} className="inline mr-1" />
              My Desk
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hives')}
              aria-label="Navigate to Hives"
              className={`pixel-btn text-[10px] py-1 px-2.5 shrink-0 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                activeTab === 'hives' ? 'bg-honey-500 text-oak-900 font-bold' : 'bg-cream-100'
              }`}
            >
              <Users size={12} className="inline mr-1" />
              Hives
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('games')}
              aria-label="Navigate to Break Games"
              className={`pixel-btn text-[10px] py-1 px-2.5 shrink-0 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                activeTab === 'games' ? 'bg-honey-500 text-oak-900 font-bold' : 'bg-cream-100'
              }`}
              title={isBreakActive ? 'Break active: Games unlocked!' : 'Break games unlock during Pomodoro breaks'}
            >
              <Gamepad2 size={12} />
              <span>Break Games</span>
              {isBreakActive ? (
                <span className="bg-emerald-600 text-white font-pixel text-[8px] px-1 py-0.2 rounded-xs shadow-xs animate-pulse">
                  OPEN
                </span>
              ) : (
                <span className="text-[9px] text-oak-500">🔒</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('avatar')}
              aria-label="Navigate to Avatar and Shop"
              className={`pixel-btn text-[10px] py-1 px-2.5 shrink-0 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                activeTab === 'avatar' ? 'bg-honey-500 text-oak-900 font-bold' : 'bg-cream-100'
              }`}
            >
              <Sparkles size={12} className="inline mr-1" />
              Avatar & Shop
            </button>
            <button
              type="button"
              onClick={onOpenHistory}
              aria-label="Open study history logbook"
              className="pixel-btn text-[10px] py-1 px-2.5 shrink-0 bg-cream-100 hover:bg-cream-200 text-oak-800 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              title="Scholar Study Logbook"
            >
              <ScrollText size={12} className="inline mr-1" />
              <span>Logbook</span>
            </button>
            <button
              type="button"
              onClick={onOpenFriends}
              aria-label="Open Friends and Chat"
              className="pixel-btn text-[10px] py-1 px-2.5 shrink-0 bg-honey-200 hover:bg-honey-300 text-oak-900 font-semibold relative focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              title="Open Friends & Chat"
            >
              <span>💌 Friends</span>
              {pendingRequestsCount > 0 && (
                <span className="ml-1.5 bg-red-600 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full font-bold shadow-xs">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                aria-label="Navigate to Admin Dashboard"
                className={`pixel-btn text-[10px] py-1 px-2.5 shrink-0 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                  activeTab === 'admin' ? 'bg-amber-600 text-white font-bold' : 'bg-amber-100 text-amber-900'
                }`}
              >
                <ShieldCheck size={12} className="inline mr-1" />
                Admin
              </button>
            )}
          </nav>
        )}

        {/* Right Section: Stats & User Profile */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Gamified Stat Badges */}
              <div className="flex items-center gap-2">
                {/* Honey Currency */}
                <div
                  className="flex items-center gap-1 bg-honey-200 border-2 border-pixel-border px-2.5 py-1 shadow-pixel-sm font-pixel text-[11px] text-honey-900"
                  title="Your Honey Balance (Earned by focused studying)"
                >
                  <span className="text-sm">🍯</span>
                  <span>{user.honey ?? 50}</span>
                </div>

                {/* Level / XP */}
                <div
                  className="hidden sm:flex items-center gap-1 bg-cream-300 border-2 border-pixel-border px-2.5 py-1 shadow-pixel-sm font-pixel text-[11px] text-oak-800"
                  title={`Level ${user.level || 1} • ${user.xp || 0} XP`}
                >
                  <span className="text-honey-600">⭐</span>
                  <span>LVL {user.level || 1}</span>
                </div>

                {/* Streak */}
                <div
                  className="hidden md:flex items-center gap-1 bg-orange-100 border-2 border-pixel-border px-2 py-1 shadow-pixel-sm font-pixel text-[11px] text-orange-900"
                  title={`${user.streak || 1} day study streak`}
                >
                  <Flame size={12} className="text-orange-500 fill-orange-500" />
                  <span>{user.streak || 1}d</span>
                </div>
              </div>

              {/* User Chip */}
              <div className="flex items-center gap-2 pl-1 border-l-2 border-pixel-border/30">
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Open wardrobe and shop avatar customization"
                  onClick={() => setActiveTab && setActiveTab('avatar')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveTab && setActiveTab('avatar');
                    }
                  }}
                  className="w-8 h-8 bg-honey-200 border-2 border-pixel-border flex items-center justify-center p-0.5 shadow-pixel-sm cursor-pointer hover:scale-105 transition-transform focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                  title="Customize avatar & shop"
                >
                  <PixelAvatar size={26} equipped={user.equippedItems} animated={false} />
                </div>

                <div className="text-right">
                  <div className="font-pixel text-[11px] text-oak-900 max-w-[100px] truncate">
                    {user.username}
                  </div>
                  <div className="text-[10px] font-sans font-semibold text-oak-600 uppercase">
                    {user.role === 'admin' ? 'Head Librarian 👑' : 'Hive Scholar 🐝'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  aria-label="Sign out of the library"
                  className="pixel-btn bg-cream-200 hover:bg-red-100 hover:text-red-700 p-1.5 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                  title="Sign out of the library"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="pixel-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 shadow-pixel"
            >
              <span>BUZZ IN / SIGN IN</span>
              <span>🐝</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
