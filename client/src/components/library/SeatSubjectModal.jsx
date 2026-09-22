import React, { useState } from 'react';
import { PixelBee } from '../common/PixelBee';
import { X, BookOpen, Clock, Sparkles } from 'lucide-react';

const SUBJECT_PRESETS = [
  { name: 'Coding 💻', value: 'Coding' },
  { name: 'Math 📐', value: 'Mathematics' },
  { name: 'Literature 📚', value: 'Literature' },
  { name: 'Science 🧪', value: 'Science' },
  { name: 'History 🏛️', value: 'History' },
  { name: 'Languages 🌐', value: 'Languages' },
  { name: 'Art & Design 🎨', value: 'Art & Design' },
];

const DURATION_PRESETS = [15, 25, 45, 60];

export const SeatSubjectModal = ({ isOpen, onClose, desk, onConfirmSeat }) => {
  const [subject, setSubject] = useState('Coding');
  const [customSubject, setCustomSubject] = useState('');
  const [duration, setDuration] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !desk) return null;

  const handleSelectPreset = (preset) => {
    setSubject(preset);
    setCustomSubject('');
    setError('');
  };

  const handleCustomChange = (e) => {
    setCustomSubject(e.target.value);
    setSubject(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalSubject = (customSubject || subject || '').trim();
    if (!finalSubject) {
      setError('Please pick or enter a subject to study.');
      return;
    }

    setLoading(true);
    try {
      await onConfirmSeat({
        subject: finalSubject,
        targetMinutes: duration,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to start session at this desk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-oak-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg pixel-panel bg-cream-100 p-0 overflow-hidden shadow-pixel-lg">
        {/* Title Bar */}
        <div className="pixel-panel-header">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-yellow-400 border border-pixel-border"></span>
            <span className="font-pixel text-[11px] text-oak-900">
              CLAIM DESK: {desk.name.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-honey-500 p-0.5 border border-pixel-border text-oak-900"
            title="Cancel"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Desk Banner */}
          <div className="flex items-center gap-3 bg-honey-100 border-2 border-pixel-border p-3 shadow-pixel-sm">
            <div className="text-3xl bg-cream-50 p-2 border border-pixel-border">
              {desk.icon || '🪑'}
            </div>
            <div>
              <h3 className="font-pixel text-xs text-honey-900">{desk.name}</h3>
              <p className="text-xs text-oak-700 font-sans mt-0.5">{desk.description}</p>
            </div>
          </div>

          {/* Subject Picker */}
          <div>
            <label className="block font-pixel text-[10px] text-oak-900 mb-2 flex items-center gap-1.5">
              <BookOpen size={13} className="text-honey-700" />
              1. PICK OR TYPE YOUR STUDY SUBJECT
            </label>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {SUBJECT_PRESETS.map((p) => {
                const isSelected = subject === p.value && !customSubject;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handleSelectPreset(p.value)}
                    className={`pixel-btn text-[10px] py-1 px-2.5 font-sans font-medium transition-all ${
                      isSelected
                        ? 'bg-honey-500 text-oak-900 font-bold border-pixel-border shadow-pixel-sm'
                        : 'bg-cream-50 hover:bg-cream-200 text-oak-800'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <div className="relative">
              <input
                type="text"
                value={customSubject}
                onChange={handleCustomChange}
                placeholder="Or type custom subject (e.g. Organic Chemistry, French B1)..."
                className="w-full pixel-input text-sm font-sans"
                maxLength={60}
              />
            </div>
          </div>

          {/* Target Focus Duration */}
          <div>
            <label className="block font-pixel text-[10px] text-oak-900 mb-2 flex items-center gap-1.5">
              <Clock size={13} className="text-honey-700" />
              2. POMODORO FOCUS TARGET
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATION_PRESETS.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className={`pixel-btn py-2 text-xs font-pixel ${
                    duration === mins
                      ? 'bg-honey-500 text-oak-900 font-bold'
                      : 'bg-cream-50 text-oak-700 hover:bg-cream-200'
                  }`}
                >
                  {mins} MIN
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-2 bg-red-100 border-2 border-red-600 text-red-800 text-xs font-sans">
              ⚠️ {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-dashed border-pixel-border/30">
            <button
              type="button"
              onClick={onClose}
              className="pixel-btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="pixel-btn-primary text-xs px-5 py-2.5 flex items-center gap-2"
            >
              <span>{loading ? 'TAKING SEAT...' : 'SIT DOWN & FOCUS'}</span>
              <span className="text-sm">🍯</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
