import React, { useState } from 'react';
import { useMusic } from '../../context/MusicContext';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Disc3,
  ListMusic,
  Sparkles,
} from 'lucide-react';

export const MusicPlayer = () => {
  const {
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    volume,
    isMuted,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    selectTrack,
  } = useMusic();

  const [showPlaylist, setShowPlaylist] = useState(false);

  return (
    <div className="pixel-panel bg-cream-100 p-3.5 shadow-pixel space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b-2 border-pixel-border">
        <div className="flex items-center gap-1.5 font-pixel text-[10px] text-oak-900">
          <Disc3
            size={13}
            className={`text-honey-700 ${isPlaying ? 'animate-spin' : ''}`}
            style={{ animationDuration: '4s' }}
          />
          <span>LO-FI RADIO</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`border px-1.5 py-0.2 font-pixel text-[8px] shadow-pixel-xs ${
              isPlaying
                ? 'bg-emerald-100 border-emerald-600 text-emerald-900 animate-pulse'
                : 'bg-cream-200 border-pixel-border text-oak-600'
            }`}
          >
            {isPlaying ? 'PLAYING ♫' : 'PAUSED'}
          </span>

          <button
            type="button"
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`p-1 border border-pixel-border text-[9px] hover:bg-honey-200 transition-colors ${
              showPlaylist ? 'bg-honey-300' : 'bg-cream-50'
            }`}
            title="Toggle playlist tracklist"
          >
            <ListMusic size={11} className="text-oak-800" />
          </button>
        </div>
      </div>

      {/* Cassette Tape / Audio Body */}
      <div className="bg-[#451A03] border-2 border-pixel-border p-2.5 text-cream-100 flex flex-col gap-2 shadow-pixel-inner">
        <div className="flex items-center justify-between gap-3">
          {/* Animated Tape Reels */}
          <div className="flex items-center gap-1.5 bg-[#2A0F02] px-2 py-1 border border-[#78350F] shrink-0">
            <div
              className={`w-4 h-4 rounded-full border border-honey-400 flex items-center justify-center text-[7px] ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '2s' }}
            >
              ⚙️
            </div>
            <div className="w-3 h-0.5 bg-honey-600" />
            <div
              className={`w-4 h-4 rounded-full border border-honey-400 flex items-center justify-center text-[7px] ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '2s' }}
            >
              ⚙️
            </div>
          </div>

          {/* Current Track Details */}
          <div className="flex-1 truncate">
            <div className="font-pixel text-[9px] text-honey-300 truncate">
              {isPlaying ? `♪ ${currentTrack.title}` : currentTrack.title}
            </div>
            <div className="font-sans text-[10px] text-cream-300/80 truncate">
              {currentTrack.artist} • {currentTrack.genre}
            </div>
          </div>

          {/* Main Playback Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={prevTrack}
              className="pixel-btn bg-honey-300 hover:bg-honey-200 text-oak-900 p-1"
              title="Previous Track"
            >
              <SkipBack size={10} />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="pixel-btn bg-honey-500 hover:bg-honey-400 text-oak-900 p-1.5"
              title={isPlaying ? 'Pause Music' : 'Play Music'}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} className="fill-current" />}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              className="pixel-btn bg-honey-300 hover:bg-honey-200 text-oak-900 p-1"
              title="Next Track"
            >
              <SkipForward size={10} />
            </button>
          </div>
        </div>

        {/* Volume Controls & Track Indicator */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#78350F]/70 text-[9px] font-sans text-cream-300/90">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              className="text-honey-400 hover:text-honey-200 p-0.5"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-amber-500 h-1.5 cursor-pointer bg-[#2A0F02] border border-[#78350F]"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
            <span className="font-mono text-[9px] w-6">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          <div className="font-pixel text-[8px] text-honey-400/90">
            TRACK {currentTrackIndex + 1}/{tracks.length}
          </div>
        </div>
      </div>

      {/* Expandable Playlist Selector */}
      {showPlaylist && (
        <div className="bg-cream-50 border-2 border-pixel-border p-2 space-y-1 text-xs font-sans max-h-36 overflow-y-auto">
          <div className="font-pixel text-[8px] text-oak-700 mb-1 px-1">SELECT TRACK:</div>
          {tracks.map((t, idx) => (
            <div
              key={t.id}
              onClick={() => selectTrack(idx)}
              className={`flex items-center justify-between p-1.5 cursor-pointer transition-colors border ${
                currentTrackIndex === idx
                  ? 'bg-honey-200 border-honey-600 font-semibold text-oak-900 shadow-pixel-xs'
                  : 'bg-white border-pixel-border/30 hover:bg-cream-100 text-oak-800'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-mono text-[9px] text-oak-500 w-3">{idx + 1}.</span>
                <span className="truncate">{t.title}</span>
              </div>
              <span className="font-mono text-[9px] text-oak-500 shrink-0 ml-1">{t.duration}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
