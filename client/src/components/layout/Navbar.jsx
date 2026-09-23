import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PixelBee } from '../common/PixelBee';
import { PixelAvatar } from '../avatar/PixelAvatar';
import { LogOut, ShieldCheck, Flame, BookOpen, Users, Sparkles, Store } from 'lucide-react';

export const Navbar = ({ onOpenAuth, activeTab, setActiveTab }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-cream-100 border-b-4 border-pixel-border shadow-pixel px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveTab && setActiveTab('library')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="bg-honey-200 border-2 border-pixel-border p-1 shadow-pixel-sm group-hover:scale-105 transition-transform">
            <PixelBee size={36} animated={true} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-pixel text-base text-honey-800 tracking-wider">
                STUDYBEE
              </span>
              <span className="bg-honey-500 text-oak-900 border border-pixel-border text-[9px] font-pixel px-1 py-0.2 shadow-pixel-sm">
                BETA
              </span>
            </div>
            <p className="font-retro text-xs text-oak-700">Cozy Pixel Co-Working Library</p>
          </div>
        </div>

        {/* Navigation Tabs (if logged in) */}
        {isAuthenticated && (
          <nav className="flex items-center gap-1.5 bg-cream-200 p-1 border-2 border-pixel-border shadow-pixel-sm">
            <button
              onClick={() => setActiveTab('library')}
              className={`pixel-btn text-[10px] py-1 px-2.5 ${
                activeTab === 'library' ? 'bg-honey-500 text-oak-900 font-bold' : 'bg-cream-100'
              }`}
            >
              <BookOpen size={12} className="inline mr-1" />
              My Desk
            </button>
            <button
              onClick={() => setActiveTab('hives')}
              className={`pixel-btn text-[10px] py-1 px-2.5 ${
                activeTab === 'hives' ? 'bg-honey-500 text-oak-900 font-bold' : 'bg-cream-100'
              }`}
            >
              <Users size={12} className="inline mr-1" />
              Hives
            </button>
            <button
              onClick={() => setActiveTab('avatar')}
              className={`pixel-btn text-[10px] py-1 px-2.5 ${
                activeTab === 'avatar' ? 'bg-honey-500 text-oak-900 font-bold' : 'bg-cream-100'
              }`}
            >
              <Sparkles size={12} className="inline mr-1" />
              Avatar & Shop
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`pixel-btn text-[10px] py-1 px-2.5 ${
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
                  onClick={() => setActiveTab && setActiveTab('avatar')}
                  className="w-8 h-8 bg-honey-200 border-2 border-pixel-border flex items-center justify-center p-0.5 shadow-pixel-sm cursor-pointer hover:scale-105 transition-transform"
                  title="Customize avatar & shop"
                >
                  <PixelAvatar size={26} equipped={user.equippedItems} animated={false} />
                </div>

                <div className="text-right">
                  <div className="font-pixel text-[11px] text-oak-900 max-w-[100px] truncate">
                    {user.username}
                  </div>
                  <div className="text-[10px] font-sans font-semibold text-oak-600 uppercase">
                    {user.role === 'admin' ? 'Head Librarian 👑' : 'Study Bee 🐝'}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="pixel-btn bg-cream-200 hover:bg-red-100 hover:text-red-700 p-1.5"
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
