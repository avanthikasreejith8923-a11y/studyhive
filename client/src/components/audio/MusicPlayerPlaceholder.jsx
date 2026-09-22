import React, { useState } from 'react';
import { Play, Pause, Volume2, Disc3, Sparkles } from 'lucide-react';

export const MusicPlayerPlaceholder = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="pixel-panel bg-cream-100 p-3.5 shadow-pixel">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b-2 border-pixel-border">
        <div className="flex items-center gap-1.5 font-pixel text-[10px] text-oak-900">
          <Disc3 size={13} className="text-honey-700 animate-spin" style={{ animationDuration: '4s' }} />
          <span>LO-FI RADIO</span>
        </div>
        <span className="bg-honey-200 border border-pixel-border px-1.5 py-0.2 font-pixel text-[8px] text-honey-900 shadow-pixel-sm">
          PHASE 5 PREVIEW
        </span>
      </div>

      {/* Cassette / Audio Player Body */}
      <div className="bg-[#451A03] border-2 border-pixel-border p-2.5 text-cream-100 flex items-center justify-between gap-3 shadow-pixel-inner">
        {/* Animated Tape Reels */}
        <div className="flex items-center gap-1.5 bg-[#2A0F02] px-2 py-1 border border-[#78350F]">
          <div
            className={`w-4 h-4 rounded-full border border-honey-400 flex items-center justify-center text-[7px] ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '2s' }}
          >
            ⚙️
          </div>
          <div className="w-4 h-0.5 bg-honey-600" />
          <div
            className={`w-4 h-4 rounded-full border border-honey-400 flex items-center justify-center text-[7px] ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '2s' }}
          >
            ⚙️
          </div>
        </div>

        {/* Track Title */}
        <div className="flex-1 truncate">
          <div className="font-pixel text-[9px] text-honey-300 truncate">
            {isPlaying ? '♪ Cozy Rain & Chords' : 'Tape Loaded: Lo-Fi Chill'}
          </div>
          <div className="font-sans text-[10px] text-cream-300/80 truncate">
            Curated study beats (Wired in Phase 5)
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="pixel-btn bg-honey-500 hover:bg-honey-400 text-oak-900 p-1.5"
            title="Toggle playback preview"
          >
            {isPlaying ? <Pause size={11} /> : <Play size={11} className="fill-current" />}
          </button>
          <div className="text-honey-400 p-1" title="Volume slider placeholder">
            <Volume2 size={13} />
          </div>
        </div>
      </div>
    </div>
  );
};
