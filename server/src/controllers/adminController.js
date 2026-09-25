import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { Hive } from '../models/Hive.js';

/**
 * GET /api/admin/stats
 * Aggregate dashboard statistics: sessions today, this week, focus minutes, popular subjects, hives.
 */
export const getAdminStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      bannedUsers,
      totalSessions,
      completedSessions,
      sessionsToday,
      sessionsThisWeek,
      activeHivesCount,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Session.countDocuments(),
      Session.countDocuments({ completed: true }),
      Session.countDocuments({ createdAt: { $gte: startOfToday } }),
      Session.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Hive.countDocuments(),
    ]);

    // Aggregate total focus minutes and average focus minutes
    const focusStats = await Session.aggregate([
      { $match: { focusMinutes: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          totalMinutes: { $sum: '$focusMinutes' },
          avgMinutes: { $avg: '$focusMinutes' },
          sessionCount: { $sum: 1 },
        },
      },
    ]);

    const totalFocusMinutes = focusStats[0]?.totalMinutes || 0;
    const avgFocusMinutes = Math.round(focusStats[0]?.avgMinutes || 0);

    // Aggregate most popular study subjects
    const popularSubjects = await Session.aggregate([
      { $match: { subject: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 },
          totalMinutes: { $sum: '$focusMinutes' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
      {
        $project: {
          subject: '$_id',
          count: 1,
          totalMinutes: 1,
          _id: 0,
        },
      },
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        bannedUsers,
        totalSessions,
        completedSessions,
        sessionsToday,
        sessionsThisWeek,
        totalFocusMinutes,
        avgFocusMinutes,
        totalFocusHours: Math.round((totalFocusMinutes / 60) * 10) / 10,
        activeHivesCount,
        popularSubjects,
      },
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    return res.status(500).json({ message: 'Failed to aggregate admin statistics.', error: error.message });
  }
};

/**
 * GET /api/admin/users
 * Search and list all users with basic profile, stats, and ban status.
 */
export const getAdminUsers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;

    const filter = {};
    if (search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      filter.$or = [{ username: reg }, { email: reg }];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      users,
      totalCount,
      page: parseInt(page, 10),
      totalPages: Math.ceil(totalCount / take),
    });
  } catch (error) {
    console.error('getAdminUsers error:', error);
    return res.status(500).json({ message: 'Failed to fetch users list.', error: error.message });
  }
};

/**
 * PATCH /api/admin/users/:id/ban
 * Ban or unban a user. Banned users cannot log in.
 */
export const toggleBanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;

    // Prevent admin from banning themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot ban your own administrator account.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Scholar account not found.' });
    }

    const nextBanStatus = typeof isBanned === 'boolean' ? isBanned : !user.isBanned;
    user.isBanned = nextBanStatus;
    await user.save();

    return res.status(200).json({
      message: nextBanStatus
        ? `Account "${user.username}" has been banned from the library.`
        : `Account "${user.username}" has been unbanned.`,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('toggleBanUser error:', error);
    return res.status(500).json({ message: 'Failed to update user ban status.', error: error.message });
  }
};

/**
 * PATCH /api/admin/users/:id/role
 * Grant or revoke admin privileges.
 */
export const toggleAdminRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot revoke your own administrator role.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Scholar account not found.' });
    }

    const nextAdminStatus = typeof isAdmin === 'boolean' ? isAdmin : !user.isAdmin;
    user.isAdmin = nextAdminStatus;
    user.role = nextAdminStatus ? 'admin' : 'user';
    await user.save();

    return res.status(200).json({
      message: nextAdminStatus
        ? `Granted administrator privileges to "${user.username}".`
        : `Revoked administrator privileges from "${user.username}".`,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('toggleAdminRole error:', error);
    return res.status(500).json({ message: 'Failed to update admin role.', error: error.message });
  }
};

/**
 * GET /api/admin/hives
 * List all active study hives with member counts and seated desks.
 */
export const getAdminHives = async (req, res) => {
  try {
    const hives = await Hive.find()
      .populate('host', 'username email')
      .populate('members', 'username email')
      .sort({ updatedAt: -1 });

    const formattedHives = hives.map((hive) => ({
      _id: hive._id,
      name: hive.name,
      topic: hive.topic,
      joinCode: hive.joinCode,
      isPublic: hive.isPublic,
      host: hive.host ? { id: hive.host._id, username: hive.host.username, email: hive.host.email } : null,
      memberCount: hive.members?.length || 0,
      seatedCount: hive.desks?.length || 0,
      timerMode: hive.timerState?.mode || 'focus',
      timerRunning: hive.timerState?.isRunning || false,
      createdAt: hive.createdAt,
      updatedAt: hive.updatedAt,
    }));

    return res.status(200).json({ hives: formattedHives });
  } catch (error) {
    console.error('getAdminHives error:', error);
    return res.status(500).json({ message: 'Failed to fetch hives list.', error: error.message });
  }
};
