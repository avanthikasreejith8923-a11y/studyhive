import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { MusicProvider, useMusic } from './context/MusicContext';
import { Navbar } from './components/layout/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { PixelBee } from './components/common/PixelBee';
import { LibraryRoom } from './components/library/LibraryRoom';
import { FocusPanel } from './components/library/FocusPanel';
import { SeatSubjectModal } from './components/library/SeatSubjectModal';
import { SessionSummaryModal } from './components/library/SessionSummaryModal';
import { ShopView } from './components/shop/ShopView';
import { HiveLobby } from './components/hives/HiveLobby';
import { HiveRoom } from './components/hives/HiveRoom';
import { BreakGamesView } from './components/games/BreakGamesView';
import { FriendsModal } from './components/friends/FriendsModal';
import { ChatDrawer } from './components/friends/ChatDrawer';
import { sessionsAPI, hivesAPI, friendsAPI } from './services/api';
import {
  Sparkles,
  Clock,
  Users,
  Gamepad2,
  Headphones,
  Trophy,
} from 'lucide-react';

const MainContent = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { pause: pauseMusic } = useMusic();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('login');
  const [activeTab, setActiveTab] = useState('library');

  // Timer & Break States (Solo vs Hive)
  const [soloTimerMode, setSoloTimerMode] = useState('focus');
  const [hiveTimerMode, setHiveTimerMode] = useState('focus');

  // Hives State
  const [currentHive, setCurrentHive] = useState(null);

  // Active Break calculation (tied to active context: hive if in hive, else solo desk)
  const isBreakActive = currentHive
    ? hiveTimerMode === 'shortBreak' || hiveTimerMode === 'longBreak'
    : soloTimerMode === 'shortBreak' || soloTimerMode === 'longBreak';

  // Friends & Chat State
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [activeChatFriend, setActiveChatFriend] = useState(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Study Session State
  const [activeSession, setActiveSession] = useState(null);
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [sessionTasks, setSessionTasks] = useState([]);
  const [lastFinishedSession, setLastFinishedSession] = useState(null);
  const [lastFinishedRewards, setLastFinishedRewards] = useState(null);
  const [focusedMinutesElapsed, setFocusedMinutesElapsed] = useState(0);

  // Fetch pending friend requests count on login
  useEffect(() => {
    if (isAuthenticated) {
      friendsAPI
        .getRequests()
        .then((res) => {
          setPendingRequestsCount(res.incoming?.length || 0);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleJoinHiveDirectly = async (hiveId) => {
    try {
      const data = await hivesAPI.join({ hiveId });
      setCurrentHive(data.hive);
      setActiveTab('hives');
    } catch (err) {
      console.error('Failed to join friend hive:', err);
    }
  };

  const openAuth = (mode = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  // Handler when user clicks an open desk
  const handleSelectDesk = (desk) => {
    setSelectedDesk(desk);
    setIsSeatModalOpen(true);
  };

  // Handler when user confirms subject & target duration in the modal
  const handleConfirmSeat = async ({ subject, targetMinutes }) => {
    if (!selectedDesk) return;

    try {
      const data = await sessionsAPI.create({
        subject,
        deskId: selectedDesk.id,
        deskName: selectedDesk.name,
        targetMinutes,
      });

      setActiveSession(data.session);
      setSessionTasks([]);
      setFocusedMinutesElapsed(0);
    } catch (err) {
      console.error('Failed to create session:', err);
      throw err;
    }
  };

  // Handler when Pomodoro timer completes its focus duration
  const handleFocusPeriodComplete = async (minutesFocused) => {
    setFocusedMinutesElapsed(minutesFocused);
    if (!activeSession) return;

    try {
      const data = await sessionsAPI.update(activeSession._id, {
        focusMinutes: minutesFocused,
        completed: true,
      });
      if (data.user) updateUser(data.user);
      if (data.rewards) setLastFinishedRewards(data.rewards);
      // Update local state copy
      setActiveSession((prev) => (prev ? { ...prev, completed: true, focusMinutes: minutesFocused } : null));
    } catch (err) {
      console.error('Failed to record focus completion:', err);
    }
  };

  // Handler when user clicks "Leave Desk"
  const handleLeaveDesk = async () => {
    if (!activeSession) return;

    // Pause music and reset solo timer mode
    pauseMusic();
    setSoloTimerMode('focus');

    const totalMin = focusedMinutesElapsed || activeSession.targetMinutes || 25;

    try {
      const data = await sessionsAPI.update(activeSession._id, {
        focusMinutes: totalMin,
        endTime: new Date(),
        completed: true,
      });

      if (data.user) updateUser(data.user);
      setLastFinishedRewards(data.rewards || null);
      setLastFinishedSession(data.session || activeSession);
      setIsSummaryModalOpen(true);
      setActiveSession(null);
      setSelectedDesk(null);
    } catch (err) {
      console.error('Failed to leave desk:', err);
      setLastFinishedSession(activeSession);
      setIsSummaryModalOpen(true);
      setActiveSession(null);
      setSelectedDesk(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col parchment-bg text-oak-900 selection:bg-honey-300 font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => openAuth('login')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFriends={() => setFriendsModalOpen(true)}
        pendingRequestsCount={pendingRequestsCount}
        isBreakActive={isBreakActive}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 md:p-6">
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

            <p className="font-sans text-base sm:text-lg text-oak-700 max-w-xl mb-8 leading-relaxed">
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
            <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left font-sans">
              <div className="pixel-panel p-4 bg-cream-50 hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-honey-800">
                  <Clock size={16} className="text-honey-600" />
                  <span>Pomodoro Desk</span>
                </div>
                <p className="text-xs text-oak-700">
                  Pick your favorite library spot, set focus intervals, and track checklist tasks.
                </p>
              </div>

              <div className="pixel-panel p-4 bg-cream-50 hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-honey-800">
                  <Trophy size={16} className="text-amber-600" />
                  <span>Honey & XP Rewards</span>
                </div>
                <p className="text-xs text-oak-700">
                  Earn sweet honey drops and level up as you complete study sessions without quitting early.
                </p>
              </div>

              <div className="pixel-panel p-4 bg-cream-50 hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-honey-800">
                  <Sparkles size={16} className="text-yellow-600" />
                  <span>Pixel Avatar Maker</span>
                </div>
                <p className="text-xs text-oak-700">
                  Snapchat-Bitmoji style pixel customizer: mix hair, outfits, honey antennae, and desk decor.
                </p>
              </div>

              <div className="pixel-panel p-4 bg-cream-50 hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-honey-800">
                  <Users size={16} className="text-emerald-700" />
                  <span>Real-Time Hives</span>
                </div>
                <p className="text-xs text-oak-700">
                  Join study rooms with classmates, see who is working at adjacent desks, and chat with friends.
                </p>
              </div>

              <div className="pixel-panel p-4 bg-cream-50 hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-honey-800">
                  <Gamepad2 size={16} className="text-purple-700" />
                  <span>Break Mini-Games</span>
                </div>
                <p className="text-xs text-oak-700">
                  Play Memory Match & 2048 unlocked strictly during break intervals to refresh your mind.
                </p>
              </div>

              <div className="pixel-panel p-4 bg-cream-50 hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-honey-800">
                  <Headphones size={16} className="text-blue-700" />
                  <span>Lo-Fi Audio Player</span>
                </div>
                <p className="text-xs text-oak-700">
                  Curated calming ambient library sounds and relaxing lo-fi beats playing right at your desk.
                </p>
              </div>
            </div>
          </div>
        ) : activeTab === 'avatar' ? (
          /* Avatar Customizer & Honey Shop */
          <ShopView />
        ) : activeTab === 'games' ? (
          /* Pomodoro Break Mini-Games */
          <BreakGamesView
            activeTimerMode={currentHive ? hiveTimerMode : soloTimerMode}
            isBreakActive={isBreakActive}
            timerSource={currentHive ? 'hive' : 'solo'}
            onReturnToDesk={() => setActiveTab(currentHive ? 'hives' : 'library')}
          />
        ) : activeTab === 'hives' ? (
          /* Group Study Hives: Room or Lobby */
          currentHive ? (
            <HiveRoom
              hive={currentHive}
              onLeaveHive={() => {
                setCurrentHive(null);
                setHiveTimerMode('focus');
              }}
              onTimerModeChange={(mode) => setHiveTimerMode(mode)}
            />
          ) : (
            <HiveLobby onEnterHive={(h) => setCurrentHive(h)} />
          )
        ) : (
          /* Authenticated Library Split Layout: Library Room on Left, Focus Panel on Right */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Pixel Library Room (7 cols on desktop) */}
            <div className="lg:col-span-7 xl:col-span-7">
              <LibraryRoom
                activeSession={activeSession}
                currentUser={user}
                onSelectDesk={handleSelectDesk}
              />
            </div>

            {/* Right Column: Focus Panel with Timer, Tasks, Music (5 cols on desktop) */}
            <div className="lg:col-span-5 xl:col-span-5">
              <FocusPanel
                activeSession={activeSession}
                onLeaveDesk={handleLeaveDesk}
                onFocusComplete={handleFocusPeriodComplete}
                onTasksChange={setSessionTasks}
                onTimerModeChange={(mode) => setSoloTimerMode(mode)}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-4 border-pixel-border bg-cream-100 py-3.5 px-4 text-center">
        <p className="font-sans text-xs text-oak-600">
          StudyHive 🐝 • Cozy 16-bit library co-working study space with warm honey vibes.
        </p>
      </footer>

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
      />

      <SeatSubjectModal
        isOpen={isSeatModalOpen}
        onClose={() => setIsSeatModalOpen(false)}
        desk={selectedDesk}
        onConfirmSeat={handleConfirmSeat}
      />

      <SessionSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        session={lastFinishedSession}
        tasks={sessionTasks}
        focusedMinutes={focusedMinutesElapsed}
        rewards={lastFinishedRewards}
      />

      <FriendsModal
        isOpen={friendsModalOpen}
        onClose={() => setFriendsModalOpen(false)}
        onOpenChat={(friendUser) => setActiveChatFriend(friendUser)}
        onJoinHiveDirectly={handleJoinHiveDirectly}
        onPendingCountChange={setPendingRequestsCount}
      />

      {activeChatFriend && (
        <ChatDrawer
          friend={activeChatFriend}
          currentUser={user}
          onClose={() => setActiveChatFriend(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MusicProvider>
          <MainContent />
        </MusicProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

