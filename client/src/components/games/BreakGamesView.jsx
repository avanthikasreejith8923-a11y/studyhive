import React, { useState, useEffect, useRef } from 'react';
import { MemoryMatchGame } from './MemoryMatchGame';
import { Game2048 } from './Game2048';
import {
  Gamepad2,
  Lock,
  Sparkles,
  Coffee,
  Clock,
  ArrowRight,
  BookOpen,
  Pause,
  AlertCircle,
} from 'lucide-react';

export const BreakGamesView = ({
  activeTimerMode = 'focus',
  isBreakActive = false,
  timerSource = 'solo',
  onReturnToDesk,
}) => {
  const [selectedGame, setSelectedGame] = useState('memory'); // 'memory' | '2048'
  const [gracefulPauseModalOpen, setGracefulPauseModalOpen] = useState(false);
  const prevBreakActiveRef = useRef(isBreakActive);

  // Detect when break ends mid-play to trigger graceful pause
  useEffect(() => {
    if (prevBreakActiveRef.current && !isBreakActive) {
      setGracefulPauseModalOpen(true);
    }
    prevBreakActiveRef.current = isBreakActive;
  }, [isBreakActive]);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div
        className={`pixel-panel p-5 border-4 border-pixel-border flex flex-col md:flex-row items-center justify-between gap-4 shadow-pixel transition-colors ${
          isBreakActive ? 'bg-amber-100' : 'bg-cream-100'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 border-3 border-pixel-border flex items-center justify-center text-2xl shadow-pixel-sm shrink-0 ${
              isBreakActive ? 'bg-emerald-100 animate-bounce-gentle' : 'bg-cream-200'
            }`}
          >
            {isBreakActive ? '☕' : '🔒'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-pixel text-sm sm:text-base text-oak-900 tracking-wider">
                POMODORO BREAK MINI-GAMES
              </h2>
              {isBreakActive ? (
                <span className="bg-emerald-500 text-white font-pixel text-[9px] px-2 py-0.5 border border-pixel-border shadow-pixel-xs animate-pulse">
                  UNLOCKED NOW ☕
                </span>
              ) : (
                <span className="bg-cream-300 text-oak-600 font-pixel text-[9px] px-2 py-0.5 border border-pixel-border shadow-pixel-xs flex items-center gap-1">
                  <Lock size={10} />
                  LOCKED IN FOCUS
                </span>
              )}
            </div>

            <p className="font-sans text-xs text-oak-700 mt-0.5">
              {isBreakActive
                ? `Break mode is active (${
                    timerSource === 'hive' ? 'Shared Hive Timer' : 'Solo Desk Timer'
                  }). Stretch your hands and refresh your mind!`
                : 'Games unlock automatically when your Pomodoro timer enters Break mode (Short or Long break).'}
            </p>
          </div>
        </div>

        {/* Return to Desk Button */}
        {onReturnToDesk && (
          <button
            type="button"
            onClick={onReturnToDesk}
            className="pixel-btn-secondary text-xs px-4 py-2 flex items-center gap-1.5 shrink-0"
          >
            <BookOpen size={13} />
            <span>RETURN TO DESK</span>
          </button>
        )}
      </div>

      {/* Game Selector Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-pixel-border bg-cream-200 p-1.5 shadow-pixel-sm">
        <button
          type="button"
          onClick={() => setSelectedGame('memory')}
          className={`pixel-btn text-xs py-2 px-4 flex items-center gap-2 font-pixel transition-colors ${
            selectedGame === 'memory'
              ? 'bg-honey-500 text-oak-900 font-bold shadow-pixel-xs'
              : 'bg-cream-100 text-oak-700 hover:bg-cream-50'
          }`}
        >
          <span>🃏</span>
          <span>MEMORY MATCH</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedGame('2048')}
          className={`pixel-btn text-xs py-2 px-4 flex items-center gap-2 font-pixel transition-colors ${
            selectedGame === '2048'
              ? 'bg-honey-500 text-oak-900 font-bold shadow-pixel-xs'
              : 'bg-cream-100 text-oak-700 hover:bg-cream-50'
          }`}
        >
          <span>🔢</span>
          <span>2048 HONEY TILES</span>
        </button>
      </div>

      {/* Main Game Container */}
      <div className="pixel-panel p-5 bg-cream-100 shadow-pixel relative min-h-[460px]">
        {/* If Locked During Focus Mode: Show Locked Overlay with Hint */}
        {!isBreakActive && (
          <div className="p-8 text-center bg-cream-50 border-3 border-dashed border-pixel-border/50 max-w-lg mx-auto my-6 shadow-pixel-sm space-y-4">
            <div className="w-16 h-16 bg-cream-200 border-3 border-pixel-border flex items-center justify-center text-3xl mx-auto shadow-pixel-sm">
              🔒
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-cream-300 text-oak-800 font-pixel text-[10px] px-2.5 py-1 border border-pixel-border mb-2 shadow-pixel-xs">
                <Lock size={12} className="text-oak-700" />
                <span>LOCKED DURING FOCUS</span>
              </div>
              <h3 className="font-pixel text-sm text-oak-900 mb-1">
                {selectedGame === 'memory' ? 'MEMORY MATCH LOCKED' : '2048 TILES LOCKED'}
              </h3>
              <p className="font-sans text-xs text-oak-600 max-w-sm mx-auto leading-relaxed">
                Stay fully focused on your current study session! This mini-game will unlock
                automatically when your Pomodoro countdown finishes and break time begins.
              </p>
            </div>

            <div className="p-2.5 bg-honey-100 border border-pixel-border text-[11px] font-sans text-oak-800">
              💡 <span className="font-semibold">Break hint:</span> Complete a 25-minute Pomodoro focus block to earn a 5-minute break with games unlocked!
            </div>

            {onReturnToDesk && (
              <button
                type="button"
                onClick={onReturnToDesk}
                className="pixel-btn-primary text-xs px-5 py-2.5 flex items-center justify-center gap-1.5 mx-auto"
              >
                <span>BACK TO FOCUS DESK</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}

        {/* If Unlocked: Render the Active Game */}
        {isBreakActive && (
          <div>
            {selectedGame === 'memory' ? (
              <MemoryMatchGame isPaused={!isBreakActive} />
            ) : (
              <Game2048 isPaused={!isBreakActive} />
            )}
          </div>
        )}
      </div>

      {/* Graceful Pause Modal when Break Ends Mid-Play */}
      {gracefulPauseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-oak-900/75 backdrop-blur-xs">
          <div className="relative w-full max-w-sm pixel-panel bg-cream-100 p-0 overflow-hidden shadow-pixel-lg animate-fade-in text-center">
            <div className="pixel-panel-header">
              <span className="font-pixel text-[10px]">⏰ BREAK COMPLETED</span>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="text-3xl bg-honey-100 border-2 border-pixel-border inline-block p-2 shadow-pixel-sm">
                🐝✨
              </div>

              <div>
                <h3 className="font-pixel text-sm text-oak-900 mb-1">FOCUS TIME RESUMED!</h3>
                <p className="font-sans text-xs text-oak-700 leading-relaxed">
                  Your break interval has concluded. Your game is <span className="font-bold text-honey-900">paused</span> and your board progress is safely preserved for your next break!
                </p>
              </div>

              <div className="flex gap-2 justify-center pt-2 border-t-2 border-dashed border-pixel-border/30">
                <button
                  type="button"
                  onClick={() => setGracefulPauseModalOpen(false)}
                  className="pixel-btn-secondary text-xs px-3 py-2"
                >
                  Close Notice
                </button>
                {onReturnToDesk && (
                  <button
                    type="button"
                    onClick={() => {
                      setGracefulPauseModalOpen(false);
                      onReturnToDesk();
                    }}
                    className="pixel-btn-primary text-xs px-4 py-2 flex items-center gap-1"
                  >
                    <span>RETURN TO DESK</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
