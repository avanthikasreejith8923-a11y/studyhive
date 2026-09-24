import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Play, Pause, RotateCcw, Clock, Sparkles } from 'lucide-react';

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

export const SharedHiveTimer = ({ hiveId, initialTimerState }) => {
  const {
    socket,
    startHiveTimer,
    pauseHiveTimer,
    resetHiveTimer,
    setHiveTimerMode,
  } = useSocket();

  const [mode, setMode] = useState(initialTimerState?.mode || 'focus');
  const [duration, setDuration] = useState(initialTimerState?.duration || 25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(
    initialTimerState?.remainingSeconds ?? 25 * 60
  );
  const [isRunning, setIsRunning] = useState(initialTimerState?.isRunning || false);
  const [endsAt, setEndsAt] = useState(initialTimerState?.endsAt || null);
  const [displaySeconds, setDisplaySeconds] = useState(remainingSeconds);

  // Sync state if initialTimerState updates
  useEffect(() => {
    if (initialTimerState) {
      setMode(initialTimerState.mode || 'focus');
      setDuration(initialTimerState.duration || 25 * 60);
      setIsRunning(initialTimerState.isRunning || false);
      setEndsAt(initialTimerState.endsAt || null);
      setRemainingSeconds(initialTimerState.remainingSeconds ?? 25 * 60);
    }
  }, [initialTimerState]);

  // Listen to hive:timer:update from socket
  useEffect(() => {
    if (!socket) return;

    const handleTimerUpdate = (data) => {
      setMode(data.mode);
      setDuration(data.duration);
      setIsRunning(data.isRunning);
      setEndsAt(data.endsAt);
      setRemainingSeconds(data.remainingSeconds);

      if (data.isRunning && data.endsAt) {
        const left = Math.max(0, Math.round((data.endsAt - Date.now()) / 1000));
        setDisplaySeconds(left);
      } else {
        setDisplaySeconds(data.remainingSeconds);
      }
    };

    socket.on('hive:timer:update', handleTimerUpdate);

    return () => {
      socket.off('hive:timer:update', handleTimerUpdate);
    };
  }, [socket]);

  // Active countdown ticker
  useEffect(() => {
    let interval = null;

    if (isRunning && endsAt) {
      const updateTime = () => {
        const left = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
        setDisplaySeconds(left);

        if (left === 0) {
          playChime();
          setIsRunning(false);
        }
      };

      updateTime();
      interval = setInterval(updateTime, 500);
    } else {
      setDisplaySeconds(remainingSeconds);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, endsAt, remainingSeconds]);

  const handleTogglePlay = () => {
    if (isRunning) {
      pauseHiveTimer(hiveId);
    } else {
      startHiveTimer(hiveId);
    }
  };

  const handleReset = () => {
    resetHiveTimer(hiveId);
  };

  const handleModeChange = (newMode, mins) => {
    setHiveTimerMode(hiveId, newMode, mins);
  };

  // Format time (MM:SS)
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentTotal = duration || 25 * 60;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((currentTotal - displaySeconds) / currentTotal) * 100)
  );

  return (
    <div className="pixel-panel bg-cream-100 p-4 shadow-pixel">
      {/* Header Tabs */}
      <div className="flex items-center justify-between mb-3 border-b-2 border-pixel-border pb-2.5">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => handleModeChange('focus', 25)}
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
            onClick={() => handleModeChange('shortBreak', 5)}
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
            onClick={() => handleModeChange('longBreak', 15)}
            className={`pixel-btn text-[9px] py-1 px-2.5 ${
              mode === 'longBreak'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-cream-200 text-oak-700 hover:bg-cream-50'
            }`}
          >
            LONG BREAK
          </button>
        </div>

        <div className="flex items-center gap-1 text-[9px] font-pixel text-honey-800 bg-honey-200 border border-pixel-border px-1.5 py-0.5 shadow-pixel-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>HIVE SYNCED</span>
        </div>
      </div>

      {/* Clock Face */}
      <div className="text-center my-3 bg-cream-200 border-3 border-pixel-border p-4 shadow-pixel-sm relative overflow-hidden">
        {isRunning && (
          <div className="absolute inset-0 bg-honey-300/20 pointer-events-none animate-pulse" />
        )}

        <div className="font-pixel text-4xl sm:text-5xl text-oak-900 tracking-wider mb-2 select-none">
          {formattedTime}
        </div>

        <div className="font-sans text-xs text-oak-600">
          {mode === 'focus'
            ? isRunning
              ? 'Shared focus session in progress with the hive!'
              : 'Shared timer paused. Any hive member can start.'
            : isRunning
              ? 'Shared break time! Stand up, stretch, sip water.'
              : 'Break paused.'}
        </div>
      </div>

      {/* Golden Honey Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between font-sans text-xs text-oak-700 mb-1">
          <span>Hive Progress</span>
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

      {/* Synchronized Collaborative Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`pixel-btn py-2.5 px-6 text-xs flex items-center gap-2 ${
            isRunning ? 'bg-amber-500 text-oak-900' : 'pixel-btn-primary'
          }`}
        >
          {isRunning ? (
            <>
              <Pause size={14} />
              <span>PAUSE FOR HIVE</span>
            </>
          ) : (
            <>
              <Play size={14} className="fill-current" />
              <span>START FOR HIVE</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="pixel-btn-secondary py-2.5 px-3 text-xs text-oak-800"
          title="Reset Hive Timer"
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
};
