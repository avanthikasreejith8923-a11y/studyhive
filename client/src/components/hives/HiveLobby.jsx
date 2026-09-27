import React, { useState, useEffect } from 'react';
import { hivesAPI } from '../../services/api';
import { PixelAvatar } from '../avatar/PixelAvatar';
import {
  Users,
  Plus,
  KeyRound,
  Sparkles,
  ArrowRight,
  BookOpen,
  RefreshCw,
  X,
  Lock,
  Globe,
} from 'lucide-react';

export const HiveLobby = ({ onEnterHive }) => {
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joiningCode, setJoiningCode] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Create Hive Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchHives = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await hivesAPI.list();
      setHives(data.hives || []);
    } catch (err) {
      console.error('Failed to load hives:', err);
      setFetchError(err.message || 'Failed to connect to study hives. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHives();
  }, []);

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim() || joiningCode) return;

    setJoiningCode(true);
    setJoinError('');
    try {
      const data = await hivesAPI.join({ joinCode: joinCodeInput.trim().toUpperCase() });
      if (onEnterHive) {
        onEnterHive(data.hive);
      }
    } catch (err) {
      setJoinError(err.message || 'Could not join hive. Please check the code.');
    } finally {
      setJoiningCode(false);
    }
  };

  const handleCreateHive = async (e) => {
    e.preventDefault();
    if (!newName.trim() || creating) return;

    setCreating(true);
    setCreateError('');
    try {
      const data = await hivesAPI.create({
        name: newName.trim(),
        topic: newTopic.trim() || 'Cozy Library Study Session',
        isPublic,
      });
      setCreateModalOpen(false);
      setNewName('');
      setNewTopic('');
      if (onEnterHive) {
        onEnterHive(data.hive);
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to create hive.');
    } finally {
      setCreating(false);
    }
  };

  const handleDirectJoin = async (hive) => {
    try {
      setJoinError('');
      const data = await hivesAPI.join({ hiveId: hive._id });
      if (onEnterHive) {
        onEnterHive(data.hive);
      }
    } catch (err) {
      console.error('Failed to enter hive:', err);
      setJoinError(err.message || 'Could not enter hive room. It may have expired or is full.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Lobby Header */}
      <div className="pixel-panel bg-cream-100 p-5 shadow-pixel flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🐝</span>
            <h1 className="font-pixel text-base sm:text-lg text-honey-900 tracking-wider">
              GROUP STUDY HIVES
            </h1>
          </div>
          <p className="font-sans text-xs sm:text-sm text-oak-700 max-w-xl leading-relaxed">
            Co-work in multiplayer 16-bit library rooms! Claim adjacent desks, share a synced
            Pomodoro timer, and stay accountable with study friends.
          </p>
        </div>

        {/* Action Button: Create Hive */}
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="pixel-btn-primary px-4 py-2.5 text-xs flex items-center gap-2 shadow-pixel"
        >
          <Plus size={15} />
          <span>CREATE STUDY HIVE</span>
          <span>🍯</span>
        </button>
      </div>

      {/* Code Joiner Bar & Refresh */}
      <div className="pixel-panel bg-cream-50 p-4 shadow-pixel-sm flex items-center justify-between gap-4 flex-wrap">
        <form onSubmit={handleJoinByCode} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <KeyRound
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-oak-500 pointer-events-none"
            />
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="ENTER 6-CHAR JOIN CODE (e.g. BEE789)..."
              maxLength={8}
              className="w-full pixel-input text-xs font-mono uppercase pl-8 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={!joinCodeInput.trim() || joiningCode}
            className="pixel-btn bg-honey-400 hover:bg-honey-500 text-oak-900 text-xs px-4 py-2 flex items-center gap-1.5 shrink-0"
          >
            <span>{joiningCode ? 'JOINING...' : 'JOIN HIVE'}</span>
            <ArrowRight size={13} />
          </button>
        </form>

        <button
          type="button"
          onClick={fetchHives}
          className="pixel-btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 text-oak-700"
          title="Refresh public hives"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>REFRESH</span>
        </button>
      </div>

      {joinError && (
        <div className="p-2.5 bg-red-100 border-2 border-red-600 text-red-800 text-xs font-sans">
          ⚠️ {joinError}
        </div>
      )}

      {/* Public Hives Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b-2 border-pixel-border pb-1.5">
          <div className="flex items-center gap-1.5 font-pixel text-xs text-oak-900">
            <Globe size={14} className="text-honey-700" />
            <span>ACTIVE PUBLIC STUDY HIVES</span>
          </div>
          <span className="font-sans text-xs text-oak-600">
            {hives.length} {hives.length === 1 ? 'room' : 'rooms'} open right now
          </span>
        </div>

        {fetchError && (
          <div className="p-3 bg-red-100 border-2 border-red-500 text-red-900 text-xs font-sans flex items-center justify-between mb-4">
            <span>⚠️ {fetchError}</span>
            <button
              type="button"
              onClick={fetchHives}
              className="pixel-btn bg-red-200 hover:bg-red-300 text-[10px] py-1 px-2.5 text-red-900 font-bold"
            >
              RETRY
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="pixel-panel bg-cream-50 p-4 border-2 border-pixel-border/40 animate-pulse h-40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-28 h-4 bg-cream-300"></div>
                    <div className="w-12 h-4 bg-cream-300"></div>
                  </div>
                  <div className="w-40 h-3 bg-cream-300 mb-3"></div>
                  <div className="w-24 h-3 bg-cream-300"></div>
                </div>
                <div className="w-full h-8 bg-cream-300"></div>
              </div>
            ))}
          </div>
        ) : hives.length === 0 ? (
          <div className="pixel-panel p-10 text-center bg-cream-50 shadow-pixel border-2 border-dashed border-pixel-border/40">
            <div className="text-3xl mb-2">🍯</div>
            <h3 className="font-pixel text-xs text-oak-900 mb-1">NO PUBLIC HIVES ACTIVE YET</h3>
            <p className="font-sans text-xs text-oak-600 mb-4 max-w-sm mx-auto">
              Be the first scholar to open a cozy study room today! Create a hive and share the join
              code with classmates.
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="pixel-btn-primary text-xs px-4 py-2"
            >
              CREATE THE FIRST HIVE
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hives.map((hive) => {
              const memberCount = hive.members?.length || 0;
              const desksCount = hive.desks?.length || 0;

              return (
                <div
                  key={hive._id}
                  className="pixel-panel bg-cream-50 hover:bg-cream-100 p-4 shadow-pixel flex flex-col justify-between transition-transform hover:-translate-y-0.5"
                >
                  <div>
                    {/* Header: Name and Code */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="truncate">
                        <h3 className="font-pixel text-xs text-oak-900 truncate" title={hive.name}>
                          {hive.name}
                        </h3>
                        <p className="font-sans text-xs text-honey-900 font-semibold truncate mt-0.5">
                          {hive.topic || 'General Focus'}
                        </p>
                      </div>
                      <span className="bg-honey-200 border border-pixel-border px-1.5 py-0.5 font-mono text-[10px] font-bold text-oak-900 shrink-0">
                        {hive.joinCode}
                      </span>
                    </div>

                    {/* Host & Stats */}
                    <div className="my-3 py-2 bg-cream-200/60 border border-pixel-border/50 px-2.5 flex items-center justify-between text-xs font-sans text-oak-700">
                      <div className="flex items-center gap-1.5 truncate">
                        <PixelAvatar size={20} equipped={hive.host?.equippedItems} animated={false} />
                        <span className="truncate">Host: {hive.host?.username || 'Scholar'}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-oak-800 shrink-0">
                        {memberCount} 🐝 • {desksCount}/6 Desks
                      </div>
                    </div>
                  </div>

                  {/* Enter Button */}
                  <button
                    type="button"
                    onClick={() => handleDirectJoin(hive)}
                    className="w-full pixel-btn-primary text-xs py-2 flex items-center justify-center gap-1.5 mt-2"
                  >
                    <span>ENTER HIVE ROOM</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Hive Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-oak-900/70 backdrop-blur-xs">
          <div className="relative w-full max-w-md pixel-panel bg-cream-100 p-0 overflow-hidden shadow-pixel-lg">
            <div className="pixel-panel-header">
              <div className="flex items-center gap-2">
                <span className="text-sm">🐝</span>
                <span className="font-pixel text-[11px] text-oak-900">CREATE STUDY HIVE</span>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="hover:bg-honey-500 p-0.5 border border-pixel-border text-oak-900"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateHive} className="p-5 space-y-4">
              <div>
                <label className="block font-pixel text-[10px] text-oak-900 mb-1.5">
                  HIVE NAME *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Midnight Code & Coffee, Bio Finals Prep"
                  className="w-full pixel-input text-sm font-sans"
                  maxLength={40}
                  required
                />
              </div>

              <div>
                <label className="block font-pixel text-[10px] text-oak-900 mb-1.5">
                  SUBJECT / TOPIC (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Organic Chemistry, Algorithms, Writing"
                  className="w-full pixel-input text-sm font-sans"
                  maxLength={60}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="accent-amber-600 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isPublic" className="font-sans text-xs text-oak-800 cursor-pointer">
                  List this hive publicly so other scholars can join from the lobby
                </label>
              </div>

              {createError && (
                <div className="p-2 bg-red-100 border-2 border-red-600 text-red-800 text-xs font-sans">
                  ⚠️ {createError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-dashed border-pixel-border/30">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="pixel-btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="pixel-btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
                >
                  <span>{creating ? 'CREATING...' : 'OPEN HIVE ROOM'}</span>
                  <span>🐝</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
