import React from 'react';
import { PixelBee } from '../common/PixelBee';
import { Trophy, Clock, CheckCircle2, BookOpen, ArrowRight, X, Sparkles, Flame } from 'lucide-react';

export const SessionSummaryModal = ({
  isOpen,
  onClose,
  session,
  tasks = [],
  focusedMinutes = 0,
  rewards = null,
}) => {
  if (!isOpen || !session) return null;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.done).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-oak-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md pixel-panel bg-cream-100 p-0 overflow-hidden shadow-pixel-lg animate-gentle-pulse">
        {/* Title Bar */}
        <div className="pixel-panel-header">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-emerald-500 border border-pixel-border"></span>
            <span className="font-pixel text-[11px] text-oak-900">
              STUDY SESSION SUMMARY
            </span>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-honey-500 p-0.5 border border-pixel-border text-oak-900"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center space-y-4">
          {/* Mascot Celebration Banner */}
          <div className="relative inline-block my-1">
            <div className="bg-honey-200 border-3 border-pixel-border p-3 shadow-pixel inline-block">
              <PixelBee size={64} animated={true} />
            </div>
            <div className="absolute -bottom-2 -right-3 bg-honey-500 border border-pixel-border px-1.5 py-0.2 font-pixel text-[8px] text-oak-900 shadow-pixel-sm">
              GREAT FOCUS! 🍯
            </div>
          </div>

          <div>
            <h3 className="font-pixel text-base text-oak-900 mb-1">
              Well Done, Scholar!
            </h3>
            <p className="font-sans text-xs text-oak-600">
              You wrapped up your study session at {session.deskName || 'your desk'}.
            </p>
          </div>

          {/* Level Up Banner (if leveled up) */}
          {rewards?.leveledUp && (
            <div className="p-3 bg-honey-400 border-2 border-pixel-border font-pixel text-xs text-oak-900 shadow-pixel flex items-center justify-center gap-2 animate-bounce">
              <Sparkles size={16} className="text-honey-900" />
              <span>LEVEL UP! NOW LEVEL {rewards.newLevel}! ⭐</span>
            </div>
          )}

          {/* Rewards Badges */}
          {rewards && (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-honey-200 border-2 border-pixel-border p-2.5 shadow-pixel-sm text-center">
                <div className="font-pixel text-[9px] text-honey-900 mb-0.5">HONEY EARNED</div>
                <div className="font-pixel text-base text-honey-800">
                  +{rewards.honeyEarned} 🍯
                </div>
              </div>
              <div className="bg-cream-200 border-2 border-pixel-border p-2.5 shadow-pixel-sm text-center">
                <div className="font-pixel text-[9px] text-oak-800 mb-0.5">XP GAINED</div>
                <div className="font-pixel text-base text-oak-900">
                  +{rewards.xpEarned} ⭐
                </div>
              </div>
            </div>
          )}

          {/* Early quit notification */}
          {rewards && !rewards.isFullSession && (
            <div className="text-[11px] font-sans text-amber-800 bg-amber-50 border border-amber-300 p-2 text-left">
              ℹ️ Left desk before full timer finished. Honey drops were partially awarded for {focusedMinutes || session.focusMinutes || 1} minutes focused.
            </div>
          )}

          {/* Stats Summary Card */}
          <div className="bg-cream-200 border-2 border-pixel-border p-3 text-left space-y-2 shadow-pixel-sm font-sans text-xs">
            {/* Subject */}
            <div className="flex items-center justify-between border-b border-pixel-border/20 pb-1.5">
              <span className="text-oak-700 flex items-center gap-1.5 font-medium">
                <BookOpen size={14} className="text-honey-700" />
                Subject
              </span>
              <span className="font-bold text-oak-900">{session.subject}</span>
            </div>

            {/* Time Focused */}
            <div className="flex items-center justify-between border-b border-pixel-border/20 pb-1.5">
              <span className="text-oak-700 flex items-center gap-1.5 font-medium">
                <Clock size={14} className="text-honey-700" />
                Time Focused
              </span>
              <span className="font-bold text-honey-800">
                {focusedMinutes || session.focusMinutes || session.targetMinutes || 25} minutes
              </span>
            </div>

            {/* Tasks Finished */}
            <div className="flex items-center justify-between">
              <span className="text-oak-700 flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={14} className="text-emerald-700" />
                Tasks Completed
              </span>
              <span className="font-bold text-emerald-800">
                {completedTasks} of {totalTasks} finished
              </span>
            </div>
          </div>

          {/* Return Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full pixel-btn-primary py-2.5 text-xs flex items-center justify-center gap-2"
          >
            <span>RETURN TO LIBRARY HALL</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
