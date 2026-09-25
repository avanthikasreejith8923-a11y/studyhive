import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assistantAPI } from '../../services/api';
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  MessageSquare,
  Bot,
  AlertCircle,
  Lightbulb,
  BookOpen,
  ChevronDown,
} from 'lucide-react';

const QUICK_PROMPTS = [
  '🧩 Break down my study session into Pomodoros',
  '💡 Explain active recall & Feynman technique',
  '⏱️ Best study break activities',
  '🍯 How do Honey drops & XP work?',
];

export const StudyAssistantWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConfigured, setIsConfigured] = useState(true);

  // Storage key scoped to authenticated user
  const storageKey = `studyhive_chat_${user?._id || 'guest'}`;

  // Initialize messages from sessionStorage
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved chat session:', e);
    }
    return [
      {
        id: 'welcome_1',
        role: 'assistant',
        content: `Bzz! Welcome to the library archives! 🍯 I'm your StudyHive Scholar.\n\nNeed help breaking down a study goal, clarifying a complex topic, or choosing a focus interval? Ask me anything!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sync to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {}
  }, [messages, storageKey]);

  // Scroll to bottom when messages change or panel opens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isAuthenticated) return null;

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    setError('');
    const userMsg = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Build history for backend (excluding welcome banner)
      const history = nextMessages
        .filter((m) => m.id !== 'welcome_1')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await assistantAPI.chat(query, history);

      if (res.configured === false) {
        setIsConfigured(false);
      } else {
        setIsConfigured(true);
      }

      const botMsg = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: res.reply || 'Here is what I found in the study archives!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unconfigured: res.configured === false,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Could not reach the assistant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const resetMsg = [
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: `Conversation refreshed! 🌿 What would you like to study next?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(resetMsg);
    setError('');
    try {
      sessionStorage.removeItem(storageKey);
    } catch (e) {}
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none">
      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] max-h-[85vh] bg-cream-100 border-3 border-pixel-border shadow-pixel-lg flex flex-col mb-3 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-honey-400 border-b-3 border-pixel-border p-2.5 px-3 flex items-center justify-between shadow-pixel-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-cream-50 border-2 border-pixel-border rounded flex items-center justify-center text-sm shadow-pixel-xs">
                🎓
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-pixel text-[11px] text-oak-900">STUDYHIVE SCHOLAR</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" title="Online" />
                </div>
                <p className="font-sans text-[10px] text-oak-800 leading-tight">
                  In-App AI Study Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1 hover:bg-honey-300 text-oak-800 border border-pixel-border bg-cream-50 transition-colors"
                title="Clear conversation"
              >
                <RotateCcw size={12} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-honey-300 text-oak-900 border border-pixel-border bg-cream-50 transition-colors"
                title="Minimize assistant"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Unconfigured Alert Banner */}
          {!isConfigured && (
            <div className="bg-amber-100 border-b-2 border-amber-400 p-2 text-xs font-sans text-amber-900 flex items-start gap-2">
              <AlertCircle size={15} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Assistant Offline</span>
                <span>To enable AI responses, add <code>ANTHROPIC_API_KEY</code> to <code>server/.env</code> and restart.</span>
              </div>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#FFFDF7]">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] p-2.5 text-xs font-sans rounded-none shadow-pixel-sm ${
                      isAssistant
                        ? msg.unconfigured
                          ? 'bg-amber-50 border-2 border-amber-300 text-oak-900'
                          : 'bg-cream-100 border-2 border-pixel-border text-oak-900'
                        : 'bg-honey-400 border-2 border-pixel-border text-oak-900'
                    }`}
                  >
                    {/* Role Label */}
                    <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-pixel-border/30">
                      <span className="font-pixel text-[8px] uppercase tracking-wider text-oak-700">
                        {isAssistant ? 'StudyHive Scholar 🐝' : (user?.username || 'You')}
                      </span>
                      <span className="text-[9px] text-oak-500 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Message Body */}
                    <div className="whitespace-pre-wrap leading-relaxed select-text font-sans">
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-cream-100 border-2 border-pixel-border p-2 px-3 shadow-pixel-sm flex items-center gap-1.5">
                  <span className="font-pixel text-[9px] text-oak-700">Thinking</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-honey-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-honey-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-honey-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Drawer */}
          {messages.length <= 3 && !isLoading && (
            <div className="p-2 bg-cream-50 border-t-2 border-pixel-border">
              <div className="font-pixel text-[8px] text-oak-600 mb-1 flex items-center gap-1">
                <Lightbulb size={10} className="text-honey-600" />
                <span>TRY ASKING:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[10px] font-sans bg-white hover:bg-honey-100 border border-pixel-border px-1.5 py-0.5 text-oak-800 transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-t-2 border-red-300 p-2 text-xs font-sans text-red-800 flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')} className="font-bold text-xs">✕</button>
            </div>
          )}

          {/* Input Box Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2 bg-cream-100 border-t-3 border-pixel-border flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question or study tip..."
              maxLength={1000}
              disabled={isLoading}
              className="flex-1 pixel-input text-xs py-1.5 px-2 bg-white disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="pixel-btn-primary px-3 py-1.5 text-xs flex items-center justify-center shrink-0 disabled:opacity-50"
              title="Send message"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 bg-honey-400 hover:bg-honey-300 border-3 border-pixel-border p-2.5 px-3.5 shadow-pixel-lg hover:-translate-y-0.5 transition-all"
          title="Open StudyHive AI Assistant"
        >
          {/* Notification / Status Pip */}
          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-pixel-border rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </span>

          <span className="text-lg animate-float">🎓</span>
          <span className="font-pixel text-[10px] text-oak-900 hidden sm:inline">
            STUDY ASSISTANT
          </span>
        </button>
      )}
    </div>
  );
};
