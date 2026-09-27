import React, { useState, useEffect } from 'react';
import { sessionsAPI } from '../../services/api';
import { BookOpen, Clock, Calendar, CheckCircle2, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';

export const StudyHistoryModal = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchHistory = async (targetPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await sessionsAPI.getHistory(targetPage, 8);
      // data: { sessions: [...], totalCount, page, totalPages }
      setSessions(data.sessions || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
      setPage(data.page || targetPage);
    } catch (err) {
      console.error('Failed to load study history:', err);
      setError(err.message || 'Could not load your study history archives. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-oak-900/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl pixel-panel bg-cream-100 p-0 overflow-hidden shadow-pixel-lg animate-gentle-pulse">
        {/* Header */}
        <div className="pixel-panel-header">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-honey-500 border border-pixel-border"></span>
            <span className="font-pixel text-[11px] text-oak-900">
              SCHOLAR LOGBOOK • PAST STUDY SESSIONS
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-honey-500 p-1 border border-pixel-border text-oak-900 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            title="Close logbook"
            aria-label="Close study history logbook"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 max-h-[500px] overflow-y-auto space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-500 text-red-900 text-xs font-sans flex items-center justify-between">
              <span>⚠️ {error}</span>
              <button
                type="button"
                onClick={() => fetchHistory(page)}
                className="pixel-btn bg-red-200 hover:bg-red-300 text-[10px] py-1 px-2.5 text-red-900 font-bold focus-visible:ring-2 focus-visible:ring-red-500"
              >
                RETRY
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-3 bg-cream-50 border-2 border-pixel-border/40 animate-pulse flex items-center justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-cream-300"></div>
                    <div className="w-48 h-3 bg-cream-300"></div>
                  </div>
                  <div className="w-16 h-6 bg-cream-300"></div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            /* Empty State */
            <div className="pixel-panel p-8 text-center bg-cream-50 border-2 border-dashed border-pixel-border/40 my-2">
              <div className="text-3xl mb-2">📜</div>
              <h4 className="font-pixel text-xs text-oak-900 mb-1">
                NO STUDY SESSIONS RECORDED YET
              </h4>
              <p className="font-sans text-xs text-oak-600 mb-4 max-w-sm mx-auto">
                Take a seat at any desk in the library, start your focus timer, and complete your first
                session to record your academic achievements in this logbook!
              </p>
              <button
                type="button"
                onClick={onClose}
                className="pixel-btn-primary text-xs px-4 py-2 focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                FIND A COZY DESK
              </button>
            </div>
          ) : (
            /* Sessions List */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-oak-600 font-sans border-b border-pixel-border/30 pb-1.5">
                <span>{totalCount} total logged study sessions</span>
                <span>Page {page} of {totalPages}</span>
              </div>

              {sessions.map((sess) => {
                const dateStr = sess.startTime
                  ? new Date(sess.startTime).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div
                    key={sess._id}
                    className="p-3 bg-cream-50 border-2 border-pixel-border shadow-pixel-sm flex items-center justify-between gap-3 flex-wrap hover:bg-cream-100 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-xs text-oak-900">{sess.subject || 'Focus'}</span>
                        <span className="font-sans text-[10px] bg-honey-200 border border-pixel-border px-1.5 py-0.2 text-oak-800">
                          {sess.deskName || 'Library Desk'}
                        </span>
                        {sess.status === 'completed' ? (
                          <span className="text-emerald-700 text-[10px] font-sans font-bold flex items-center gap-0.5">
                            <CheckCircle2 size={11} /> Completed
                          </span>
                        ) : (
                          <span className="text-oak-500 text-[10px] font-sans">
                            {sess.status}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] font-sans text-oak-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {dateStr}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {sess.focusMinutes || 0} min focused
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-pixel text-xs text-honey-800">
                          +{sess.honeyEarned || 0} 🍯
                        </div>
                        <div className="text-[10px] font-sans text-oak-600">
                          +{sess.xpEarned || 0} XP
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="pt-3 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => fetchHistory(page - 1)}
                    className="pixel-btn text-xs py-1 px-3 flex items-center gap-1 disabled:opacity-40"
                    aria-label="Previous history page"
                  >
                    <ChevronLeft size={12} />
                    <span>PREV</span>
                  </button>
                  <span className="font-pixel text-xs text-oak-800">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages || loading}
                    onClick={() => fetchHistory(page + 1)}
                    className="pixel-btn text-xs py-1 px-3 flex items-center gap-1 disabled:opacity-40"
                    aria-label="Next history page"
                  >
                    <span>NEXT</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
