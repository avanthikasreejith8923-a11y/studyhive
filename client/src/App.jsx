import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { PixelBee } from './components/common/PixelBee';
import { Sparkles, Clock, Users, Gamepad2, Headphones, Bot, Trophy, CheckCircle2 } from 'lucide-react';

const MainContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [activeTab, setActiveTab] = useState('library');

  const openAuth = (mode = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col parchment-bg text-oak-900 selection:bg-honey-300">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => openAuth('login')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {!isAuthenticated ? (
          /* Unauthenticated Landing / Hero View */
          <div className="py-8 md:py-14 flex flex-col items-center text-center">
            {/* Mascot Banner */}
            <div className="relative mb-6">
              <div className="bg-honey-200 border-4 border-pixel-border p-4 shadow-pixel-lg inline-block animate-float">
                <PixelBee size={96} animated={true} />
              </div>
              <div className="absolute -top-3 -right-6 bg-honey-500 border-2 border-pixel-border px-2 py-0.5 font-pixel text-[10px] text-oak-900 shadow-pixel-sm rotate-6">
                BUZZ & FOCUS!
              </div>
            </div>

            <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl text-oak-900 mb-4 max-w-2xl leading-tight">
              A Cozy Pixel Library for Focused Minds
            </h1>

            <p className="font-retro text-lg sm:text-xl text-oak-700 max-w-xl mb-8 leading-relaxed">
              Step into a warm 16-bit library nook. Pick a desk, start your Pomodoro timer,
              earn sweet honey drops, customize your retro avatar, and study together in real-time hives.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <button
                onClick={() => openAuth('register')}
                className="pixel-btn-primary text-sm sm:text-base px-6 py-3 shadow-pixel-lg hover:scale-102"
              >
                <span>GET YOUR LIBRARY CARD</span>
                <span className="ml-2">🍯</span>
              </button>

              <button
                onClick={() => openAuth('login')}
                className="pixel-btn-secondary text-sm sm:text-base px-6 py-3"
              >
                <span>RETURNING SCHOLAR</span>
                <span className="ml-2">📖</span>
              </button>
            </div>

            {/* Feature Highlights Grid */}
            <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
              <div className="pixel-panel p-4 bg-cream-50 hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-honey-800">
                  <Clock size={16} className="text-honey-600" />
                  <span>Pomodoro Desk</span>
                </div>
                <p className="font-retro text-sm text-oak-700">
                  Pick your favorite library spot, set focus intervals, and track checklist tasks.
                </p>
              </div>

              <div className="pixel-panel p-4 bg-cream-50 hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-honey-800">
                  <Trophy size={16} className="text-amber-600" />
                  <span>Honey & XP Rewards</span>
                </div>
                <p className="font-retro text-sm text-oak-700">
                  Earn sweet honey drops and level up as you complete study sessions without quitting early.
                </p>
              </div>

              <div className="pixel-panel p-4 bg-cream-50 hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-honey-800">
                  <Sparkles size={16} className="text-yellow-600" />
                  <span>Pixel Avatar Maker</span>
                </div>
                <p className="font-retro text-sm text-oak-700">
                  Snapchat-Bitmoji style pixel customizer: mix hair, outfits, honey antennae, and desk decor.
                </p>
              </div>

              <div className="pixel-panel p-4 bg-cream-50 hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-honey-800">
                  <Users size={16} className="text-emerald-700" />
                  <span>Real-Time Hives</span>
                </div>
                <p className="font-retro text-sm text-oak-700">
                  Join study rooms with classmates, see who is working at adjacent desks, and chat with friends.
                </p>
              </div>

              <div className="pixel-panel p-4 bg-cream-50 hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-honey-800">
                  <Gamepad2 size={16} className="text-purple-700" />
                  <span>Break Mini-Games</span>
                </div>
                <p className="font-retro text-sm text-oak-700">
                  Play Memory Match & 2048 unlocked strictly during break intervals to refresh your mind.
                </p>
              </div>

              <div className="pixel-panel p-4 bg-cream-50 hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-honey-800">
                  <Headphones size={16} className="text-blue-700" />
                  <span>Lo-Fi Audio Player</span>
                </div>
                <p className="font-retro text-sm text-oak-700">
                  Curated calming ambient library sounds and relaxing lo-fi beats playing right at your desk.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard / Phase 1 Confirmation View */
          <div className="space-y-6">
            {/* Welcome Banner Card */}
            <div className="pixel-panel p-6 bg-honey-100 border-4 border-pixel-border flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="bg-cream-100 border-3 border-pixel-border p-3 shadow-pixel">
                  <PixelBee size={64} animated={true} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-pixel text-lg sm:text-xl text-oak-900">
                      Welcome back, {user.username}!
                    </span>
                    <span className="bg-honey-400 text-oak-900 border border-pixel-border text-[10px] font-pixel px-2 py-0.5 shadow-pixel-sm">
                      LVL {user.level}
                    </span>
                  </div>
                  <p className="font-retro text-base text-oak-700">
                    Your library card is validated. You have <span className="font-bold text-honey-800">{user.honey} Honey drops</span> in your jar.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-cream-50 border-2 border-pixel-border p-3 shadow-pixel-sm text-center min-w-[90px]">
                  <div className="font-pixel text-xs text-oak-600 mb-1">HONEY</div>
                  <div className="font-pixel text-base text-honey-700">🍯 {user.honey}</div>
                </div>
                <div className="bg-cream-50 border-2 border-pixel-border p-3 shadow-pixel-sm text-center min-w-[90px]">
                  <div className="font-pixel text-xs text-oak-600 mb-1">XP</div>
                  <div className="font-pixel text-base text-oak-800">⭐ {user.xp}</div>
                </div>
                <div className="bg-cream-50 border-2 border-pixel-border p-3 shadow-pixel-sm text-center min-w-[90px]">
                  <div className="font-pixel text-xs text-oak-600 mb-1">STREAK</div>
                  <div className="font-pixel text-base text-orange-600">🔥 {user.streak || 1}d</div>
                </div>
              </div>
            </div>

            {/* Phase 1 Verification Status Box */}
            <div className="pixel-panel p-6 bg-cream-50">
              <div className="flex items-center gap-2 border-b-2 border-pixel-border pb-3 mb-4">
                <CheckCircle2 size={20} className="text-emerald-700" />
                <h2 className="font-pixel text-sm text-oak-900">
                  PHASE 1 COMPLETE: MONOREPO & AUTHENTICATION READY
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="bg-cream-200 p-3 border-2 border-pixel-border">
                  <div className="font-pixel text-[11px] text-honey-800 mb-2">AUTH PROFILE DATA</div>
                  <ul className="space-y-1 text-oak-800">
                    <li><span className="text-oak-600">User ID:</span> {user._id}</li>
                    <li><span className="text-oak-600">Username:</span> {user.username}</li>
                    <li><span className="text-oak-600">Email:</span> {user.email}</li>
                    <li><span className="text-oak-600">Role:</span> <span className="font-bold text-amber-700">{user.role}</span></li>
                    <li><span className="text-oak-600">Starting Honey:</span> {user.honey} drops</li>
                  </ul>
                </div>

                <div className="bg-cream-200 p-3 border-2 border-pixel-border">
                  <div className="font-pixel text-[11px] text-honey-800 mb-2">NEXT: PHASE 2 PREVIEW</div>
                  <p className="text-oak-800 mb-2">
                    In Phase 2, we build the interactive pixel library room:
                  </p>
                  <ul className="space-y-1 text-oak-700 list-disc list-inside">
                    <li>Selectable desks (Window, Oak Table, Fireplace Nook)</li>
                    <li>Subject picker with presets and custom input</li>
                    <li>Pomodoro focus timer (Work/Break) with audio chimes</li>
                    <li>Task list checklist with honey rewards</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-4 border-pixel-border bg-cream-100 py-4 px-4 text-center">
        <p className="font-retro text-sm text-oak-600">
          StudyBee 🐝 • Crafted with cozy retro pixel art, warm honey vibes, and focused quiet.
        </p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
