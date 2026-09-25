import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Users,
  Clock,
  BookOpen,
  Radio,
  Search,
  CheckCircle,
  Ban,
  UserCheck,
  RefreshCw,
  Flame,
  Award,
  Layers,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

export const AdminDashboard = ({ onReturnToApp }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'users' | 'hives'

  // Data states
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [hivesList, setHivesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  // Fetch stats & data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, hivesRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ search: searchQuery }),
        adminAPI.getHives(),
      ]);

      setStats(statsRes.stats);
      setUsersList(usersRes.users || []);
      setHivesList(hivesRes.hives || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(err.message || 'Failed to load administrator records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle user search
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.getUsers({ search: searchQuery });
      setUsersList(res.users || []);
    } catch (err) {
      setError(err.message || 'Failed to search users.');
    }
  };

  // Toggle user ban
  const handleToggleBan = async (targetUser) => {
    if (targetUser._id === user?._id) {
      alert('You cannot ban your own administrator account.');
      return;
    }

    const nextState = !targetUser.isBanned;
    const confirmMsg = nextState
      ? `Are you sure you want to BAN scholar "${targetUser.username}"? They will be locked out of logging in.`
      : `Unban scholar "${targetUser.username}" and restore library access?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    setNotification('');
    try {
      const res = await adminAPI.toggleBan(targetUser._id, nextState);
      setNotification(res.message);
      // Update local state
      setUsersList((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, isBanned: nextState } : u))
      );
      if (stats) {
        setStats((prev) => ({
          ...prev,
          bannedUsers: nextState ? prev.bannedUsers + 1 : Math.max(0, prev.bannedUsers - 1),
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to update ban status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle admin privilege
  const handleToggleAdmin = async (targetUser) => {
    if (targetUser._id === user?._id) {
      alert('You cannot modify your own administrator privileges.');
      return;
    }

    const nextState = !targetUser.isAdmin;
    const confirmMsg = nextState
      ? `Promote "${targetUser.username}" to StudyHive Administrator?`
      : `Revoke administrator privileges from "${targetUser.username}"?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    setNotification('');
    try {
      const res = await adminAPI.toggleAdmin(targetUser._id, nextState);
      setNotification(res.message);
      setUsersList((prev) =>
        prev.map((u) =>
          u._id === targetUser._id ? { ...u, isAdmin: nextState, role: nextState ? 'admin' : 'user' } : u
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to update admin role.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 md:p-8">
      {/* Top Banner / Navigation */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Shield size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">StudyHive Admin Console</h1>
                <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full border border-indigo-500/30 font-medium">
                  Internal Ops
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <span className="font-semibold text-slate-200">{user?.username}</span> ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded border border-slate-700 transition"
              title="Refresh data"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {onReturnToApp && (
              <button
                onClick={onReturnToApp}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded transition shadow"
              >
                <ArrowLeft size={13} />
                <span>Return to Library 🐝</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications & Error messages */}
        {notification && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-400" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification('')} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-rose-400" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-1">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === 'stats'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <Clock size={15} />
            <span>Session Stats & Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <Users size={15} />
            <span>User Management ({stats?.totalUsers ?? usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hives')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === 'hives'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <Radio size={15} />
            <span>Active Study Hives ({hivesList.length})</span>
          </button>
        </div>

        {/* ================= TAB 1: SESSION STATS & OVERVIEW ================= */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Sessions Today</span>
                  <Clock size={15} className="text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats?.sessionsToday ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {stats?.sessionsThisWeek ?? 0} logged this week
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Total Focus Hours</span>
                  <Flame size={15} className="text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-300">
                  {stats?.totalFocusHours ?? 0} hrs
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {stats?.totalFocusMinutes ?? 0} total focus minutes
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Average Session Length</span>
                  <BookOpen size={15} className="text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-300">
                  {stats?.avgFocusMinutes ?? 0} mins
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {stats?.completedSessions ?? 0} sessions completed
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-lg">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Total Registered Scholars</span>
                  <Users size={15} className="text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats?.totalUsers ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {stats?.bannedUsers ?? 0} banned • {hivesList.length} active hives
                </div>
              </div>
            </div>

            {/* Popular Subjects Breakdown */}
            <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-amber-400" />
                  <h3 className="font-semibold text-sm text-slate-200">Most Popular Study Subjects</h3>
                </div>
                <span className="text-xs text-slate-400">Based on all library sessions</span>
              </div>

              {stats?.popularSubjects?.length > 0 ? (
                <div className="space-y-3">
                  {stats.popularSubjects.map((sub, idx) => {
                    const maxCount = stats.popularSubjects[0]?.count || 1;
                    const percent = Math.round((sub.count / maxCount) * 100);

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-200 flex items-center gap-1.5">
                            <span className="text-slate-500 font-mono w-4">#{idx + 1}</span>
                            <span>{sub.subject}</span>
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {sub.count} sessions ({Math.round(sub.totalMinutes / 60)} hrs)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No session subject records found yet. Once users study at desks, popular subjects will display here.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: USER MANAGEMENT ================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search Header */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username or email..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition"
              >
                Search
              </button>
            </form>

            {/* Users Table */}
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg overflow-x-auto shadow">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="py-3 px-4">Scholar</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Level / XP</th>
                    <th className="py-3 px-4">Honey Drops</th>
                    <th className="py-3 px-4">Focus Time</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                        No scholar accounts matching query.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((u) => {
                      const isSelf = u._id === user?._id;
                      const isAdmin = u.isAdmin || u.role === 'admin';

                      return (
                        <tr key={u._id} className="hover:bg-slate-700/30 transition">
                          {/* Username & Email */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                              <span>{u.username}</span>
                              {isSelf && (
                                <span className="bg-slate-700 text-slate-300 text-[9px] px-1 rounded">You</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                          </td>

                          {/* Role */}
                          <td className="py-3 px-4">
                            {isAdmin ? (
                              <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-medium">
                                <Shield size={10} /> Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded text-[10px]">
                                Scholar
                              </span>
                            )}
                          </td>

                          {/* Level / XP */}
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-200">Lvl {u.level || 1}</span>
                            <span className="text-[10px] text-slate-400 ml-1">({u.xp || 0} XP)</span>
                          </td>

                          {/* Honey */}
                          <td className="py-3 px-4 font-mono text-amber-300">
                            🍯 {u.honey ?? 0}
                          </td>

                          {/* Focus Time */}
                          <td className="py-3 px-4 font-mono text-slate-300">
                            {Math.round((u.totalFocusMinutes || 0) / 60)}h {Math.round((u.totalFocusMinutes || 0) % 60)}m
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            {u.isBanned ? (
                              <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-medium">
                                <Ban size={10} /> Banned
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-medium">
                                <CheckCircle size={10} /> Active
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right space-x-2">
                            {/* Ban / Unban Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleBan(u)}
                              disabled={isSelf || actionLoading}
                              className={`px-2.5 py-1 rounded text-[11px] font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${
                                u.isBanned
                                  ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40'
                              }`}
                              title={isSelf ? 'Cannot ban self' : u.isBanned ? 'Unban user' : 'Ban user'}
                            >
                              {u.isBanned ? 'Unban' : 'Ban User'}
                            </button>

                            {/* Promote / Demote Admin */}
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleToggleAdmin(u)}
                                disabled={actionLoading}
                                className="px-2 py-1 rounded text-[10px] font-medium bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600 transition"
                                title={isAdmin ? 'Revoke admin privileges' : 'Grant admin privileges'}
                              >
                                {isAdmin ? 'Revoke Admin' : 'Make Admin'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: ACTIVE STUDY HIVES ================= */}
        {activeTab === 'hives' && (
          <div className="space-y-4">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg overflow-x-auto shadow">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/60">
                  <tr>
                    <th className="py-3 px-4">Hive Name</th>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4">Join Code</th>
                    <th className="py-3 px-4">Host Scholar</th>
                    <th className="py-3 px-4">Members</th>
                    <th className="py-3 px-4">Desks Seated</th>
                    <th className="py-3 px-4">Timer Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {hivesList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                        No active study hives found in the library right now.
                      </td>
                    </tr>
                  ) : (
                    hivesList.map((hive) => (
                      <tr key={hive._id} className="hover:bg-slate-700/30 transition">
                        <td className="py-3 px-4 font-semibold text-slate-100">
                          {hive.name}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {hive.topic || 'General Study'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          {hive.joinCode}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {hive.host?.username || 'Anonymous'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[11px] font-medium">
                            {hive.memberCount} member{hive.memberCount === 1 ? '' : 's'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {hive.seatedCount} seated
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              hive.timerRunning
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {hive.timerRunning ? `Running (${hive.timerMode})` : 'Paused'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
