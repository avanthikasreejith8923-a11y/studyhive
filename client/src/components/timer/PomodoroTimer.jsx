import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Sparkles, Settings } from 'lucide-react';

/**
 * Plays a gentle retro 8-bit chime using the Web Audio API
 */
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (cozy major chord)
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);

      gain.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + index * 0.12);
      osc.stop(ctx.currentTime + index * 0.12 + 0.65);
    });
  } catch (e) {
    console.warn('Audio chime could not play:', e);
  }
};

export const PomodoroTimer = ({
  targetMinutes = 25,
  onFocusComplete,
  onMinutesTick,
}) => {
  const [mode, setMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak'
  const [focusDuration, setFocusDuration] = useState(targetMinutes);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  const [timeLeft, setTimeLeft] = useState(targetMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalFocusedSeconds, setTotalFocusedSeconds] = useState(0);

  // Sync when prop changes
  useEffect(() => {
    if (targetMinutes && targetMinutes !== focusDuration) {
      setFocusDuration(targetMinutes);
      if (mode === 'focus' && !isRunning) {
        setTimeLeft(targetMinutes * 60);
      }
    }
  }, [targetMinutes]);

  // Main countdown timer interval
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (mode === 'focus') {
          setTotalFocusedSeconds((prev) => {
            const next = prev + 1;
            if (next % 60 === 0 && onMinutesTick) {
              onMinutesTick(Math.floor(next / 60));
            }
            return next;
          });
        }
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      playChime();

      if (mode === 'focus') {
        // Automatically mark focus complete and switch to break mode
        if (onFocusComplete) {
          onFocusComplete(Math.max(1, Math.floor(totalFocusedSeconds / 60)));
        }
        // Auto-switch to break mode
        setMode('shortBreak');
        setTimeLeft(shortBreakDuration * 60);
      } else {
        // Break finished, switch back to focus
        setMode('focus');
        setTimeLeft(focusDuration * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, focusDuration, shortBreakDuration, totalFocusedSeconds]);

  const handleModeChange = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'focus') {
      setTimeLeft(focusDuration * 60);
    } else if (newMode === 'shortBreak') {
      setTimeLeft(shortBreakDuration * 60);
    } else if (newMode === 'longBreak') {
      setTimeLeft(longBreakDuration * 60);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setTimeLeft(focusDuration * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(shortBreakDuration * 60);
    } else {
      setTimeLeft(longBreakDuration * 60);
    }
  };

  // Format time (MM:SS)
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Current total duration in seconds for progress computation
  const currentTotalSeconds =
    (mode === 'focus'
      ? focusDuration
      : mode === 'shortBreak'
      ? shortBreakDuration
      : longBreakDuration) * 60;

  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentTotalSeconds - timeLeft) / currentTotalSeconds) * 100)
  );

  return (
    <div className="pixel-panel bg-cream-100 p-4 shadow-pixel">
      {/* Timer Header Tabs */}
      <div className="flex items-center justify-between mb-3 border-b-2 border-pixel-border pb-2.5">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => handleModeChange('focus')}
            className={`pixel-btn text-[9px] py-1 px-2.5 ${
              mode === 'focus'
                ? 'bg-honey-500 text-oak-900 font-bold'
                : 'bg-cream-200 text-oak-700 hover:bg-cream-50'
            }`}
          >
            FOCUS
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('shortBreak')}
            className={`pixel-btn text-[9px] py-1 px-2.5 ${
              mode === 'shortBreak'
                ? 'bg-emerald-500 text-white font-bold'
                : 'bg-cream-200 text-oak-700 hover:bg-cream-50'
            }`}
          >
            SHORT BREAK
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('longBreak')}
            className={`pixel-btn text-[9px] py-1 px-2.5 ${
              mode === 'longBreak'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-cream-200 text-oak-700 hover:bg-cream-50'
            }`}
          >
            LONG BREAK
          </button>
        </div>

        <span className="font-pixel text-[9px] text-oak-600">
          {mode === 'focus' ? 'POMODORO 🍯' : 'BREAK TIME ☕'}
        </span>
      </div>

      {/* Main Clock Face */}
      <div className="text-center my-3 bg-cream-200 border-3 border-pixel-border p-4 shadow-pixel-sm relative overflow-hidden">
        {/* Subtle background glow when running */}
        {isRunning && (
          <div className="absolute inset-0 bg-honey-300/20 pointer-events-none animate-pulse" />
        )}

        <div className="font-pixel text-4xl sm:text-5xl text-oak-900 tracking-wider mb-2 select-none">
          {formattedTime}
        </div>

        <div className="font-sans text-xs text-oak-600">
          {mode === 'focus'
            ? isRunning
              ? 'Stay focused on your task! Deep work in progress...'
              : 'Timer paused. Ready to focus when you are.'
            : isRunning
            ? 'Rest your eyes, stretch, and sip some warm tea.'
            : 'Break paused.'}
        </div>
      </div>

      {/* Honeycomb / Golden Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between font-sans text-xs text-oak-700 mb-1">
          <span>Progress</span>
          <span className="font-mono font-bold">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full h-3.5 bg-cream-300 border-2 border-pixel-border p-0.5 shadow-pixel-sm">
          <div
            className={`h-full transition-all duration-300 ${
              mode === 'focus' ? 'bg-honey-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setIsRunning(!isRunning)}
          className={`pixel-btn py-2.5 px-6 text-xs flex items-center gap-2 ${
            isRunning
              ? 'bg-amber-500 text-oak-900'
              : 'pixel-btn-primary'
          }`}
        >
          {isRunning ? (
            <>
              <Pause size={14} />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play size={14} className="fill-current" />
              <span>START FOCUS</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="pixel-btn-secondary py-2.5 px-3 text-xs text-oak-800"
          title="Reset Timer"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};
