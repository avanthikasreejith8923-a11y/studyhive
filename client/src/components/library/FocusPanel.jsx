import React from 'react';
import { PomodoroTimer } from '../timer/PomodoroTimer';
import { TaskList } from '../tasks/TaskList';
import { MusicPlayer } from '../audio/MusicPlayer';
import { LogOut, BookOpen, Clock, Sparkles } from 'lucide-react';

export const FocusPanel = ({
  activeSession,
  onLeaveDesk,
  onFocusComplete,
  onTasksChange,
  onTimerModeChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Active Desk & Session Banner */}
      {activeSession ? (
        <div className="pixel-panel bg-honey-100 p-3.5 border-3 border-pixel-border shadow-pixel flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 bg-honey-400 border border-pixel-border flex items-center justify-center text-base shadow-pixel-sm shrink-0">
              📖
            </div>
            <div className="truncate">
              <div className="font-pixel text-[10px] text-honey-900 truncate">
                {activeSession.deskName || 'Active Desk'}
              </div>
              <div className="font-sans text-xs font-semibold text-oak-800 truncate">
                Subject: <span className="text-honey-800">{activeSession.subject}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLeaveDesk}
            className="pixel-btn bg-cream-50 hover:bg-red-50 hover:text-red-700 text-[10px] py-1.5 px-3 shrink-0 flex items-center gap-1"
            title="Leave desk and view session summary"
          >
            <LogOut size={12} />
            <span>LEAVE DESK</span>
          </button>
        </div>
      ) : (
        <div className="pixel-panel bg-cream-100 p-4 text-center border-3 border-dashed border-pixel-border/50">
          <p className="font-pixel text-[10px] text-honey-800 mb-1">
            NOT CURRENTLY SEATED
          </p>
          <p className="font-sans text-xs text-oak-600">
            Click an open desk on the left library floor to pick a subject and start studying!
          </p>
        </div>
      )}

      {/* Pomodoro Timer */}
      <PomodoroTimer
        targetMinutes={activeSession?.targetMinutes || 25}
        onFocusComplete={onFocusComplete}
        onModeChange={onTimerModeChange}
      />

      {/* Tasks List */}
      <TaskList
        sessionId={activeSession?._id}
        onTasksChange={onTasksChange}
      />

      {/* Lo-Fi Radio Player */}
      <MusicPlayer />
    </div>
  );
};
