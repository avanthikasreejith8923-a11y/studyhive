import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PixelBee } from '../common/PixelBee';
import { Sparkles, KeyRound, Mail, User as UserIcon, X } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email || username, password);
      } else {
        await register(username, email, password);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role = 'student') => {
    setErrorMsg('');
    setLoading(true);
    const demoUser = role === 'admin' ? 'admin_bee' : 'cozy_bee';
    const demoEmail = `${demoUser}@studybee.dev`;
    const demoPass = 'cozypower123';

    try {
      try {
        await login(demoEmail, demoPass);
      } catch {
        // If not registered yet, register automatically
        await register(demoUser, demoEmail, demoPass);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-oak-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md pixel-panel bg-cream-100 p-0 overflow-hidden animate-gentle-pulse">
        {/* Window Title Bar */}
        <div className="pixel-panel-header">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-red-500 border border-pixel-border"></span>
            <span className="inline-block w-3 h-3 bg-yellow-400 border border-pixel-border"></span>
            <span className="inline-block w-3 h-3 bg-green-500 border border-pixel-border"></span>
            <span className="font-pixel text-[11px] ml-1">
              {mode === 'login' ? 'LIBRARY PASS SIGN-IN' : 'NEW BEE REGISTRATION'}
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
        <div className="p-6">
          {/* Mascot & Cozy Speech Bubble */}
          <div className="flex items-center gap-4 mb-6 bg-cream-300 p-3 border-2 border-pixel-border shadow-pixel-sm">
            <PixelBee size={52} animated={true} />
            <div className="flex-1 text-sm font-retro text-oak-900">
              <p className="font-bold text-honey-800">
                {mode === 'login' ? 'Welcome back, honey!' : 'Join our cozy library hive!'}
              </p>
              <p className="text-xs text-oak-700">
                {mode === 'login'
                  ? 'Pick up your quill, earn honey drops, and get in the zone.'
                  : 'Get 50 bonus honey drops and your very own study desk.'}
              </p>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex border-2 border-pixel-border mb-5 bg-cream-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 font-pixel text-xs transition-colors ${
                mode === 'login'
                  ? 'bg-honey-500 text-oak-900 font-bold'
                  : 'bg-cream-100 text-oak-700 hover:bg-cream-50'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 font-pixel text-xs transition-colors ${
                mode === 'register'
                  ? 'bg-honey-500 text-oak-900 font-bold'
                  : 'bg-cream-100 text-oak-700 hover:bg-cream-50'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="mb-4 p-2 bg-red-100 border-2 border-red-600 text-red-800 font-mono text-xs shadow-pixel-sm">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block font-pixel text-[10px] text-oak-800 mb-1 flex items-center gap-1.5">
                  <UserIcon size={12} />
                  Bee Name (Username)
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. HoneyScholar"
                  className="w-full pixel-input text-sm"
                  minLength={3}
                  maxLength={20}
                />
              </div>
            )}

            <div>
              <label className="block font-pixel text-[10px] text-oak-800 mb-1 flex items-center gap-1.5">
                <Mail size={12} />
                {mode === 'login' ? 'Email or Username' : 'Library Email'}
              </label>
              <input
                type={mode === 'login' ? 'text' : 'email'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'login' ? 'bee@studybee.dev or username' : 'scholar@studybee.dev'}
                className="w-full pixel-input text-sm"
              />
            </div>

            <div>
              <label className="block font-pixel text-[10px] text-oak-800 mb-1 flex items-center gap-1.5">
                <KeyRound size={12} />
                Secret Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pixel-input text-sm"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full pixel-btn-primary py-3 text-sm mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                'BUZZING IN...'
              ) : mode === 'login' ? (
                'ENTER THE LIBRARY 🍯'
              ) : (
                'GET MY LIBRARY CARD 🐝'
              )}
            </button>
          </form>

          {/* Demo Quick Login Helper */}
          <div className="mt-5 pt-4 border-t-2 border-dashed border-pixel-border/40 text-center">
            <p className="font-retro text-xs text-oak-700 mb-2">Want to test right away without typing?</p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                disabled={loading}
                className="pixel-btn bg-cream-200 hover:bg-cream-50 text-[10px] py-1.5 px-3 flex items-center gap-1"
              >
                <Sparkles size={12} className="text-honey-600" />
                Quick Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
                className="pixel-btn bg-amber-200 hover:bg-amber-100 text-[10px] py-1.5 px-3 flex items-center gap-1"
              >
                👑 Admin Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
