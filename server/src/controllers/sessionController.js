import { Session } from '../models/Session.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';

export const createSession = async (req, res) => {
  try {
    const { subject, deskId, deskName, targetMinutes } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: 'Subject is required to start a study session.' });
    }

    const session = await Session.create({
      user: req.user._id,
      subject: subject.trim(),
      deskId: deskId || 'desk_window',
      deskName: deskName || 'The Window Alcove',
      targetMinutes: Number(targetMinutes) || 25,
      startTime: new Date(),
      completed: false,
    });

    return res.status(201).json({
      message: 'Session started! Welcome to your desk.',
      session,
    });
  } catch (error) {
    console.error('createSession error:', error);
    return res.status(500).json({ message: 'Failed to create study session.', error: error.message });
  }
};

export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { endTime, focusMinutes, completed } = req.body;

    const session = await Session.findOne({ _id: id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    if (endTime !== undefined) session.endTime = endTime;
    if (focusMinutes !== undefined) session.focusMinutes = Number(focusMinutes);
    if (completed !== undefined) session.completed = Boolean(completed);

    if (!session.endTime && completed) {
      session.endTime = new Date();
    }

    await session.save();

    // Reward calculation if completed or ending
    let rewards = null;
    let user = null;

    if (completed || focusMinutes !== undefined) {
      const tasks = await Task.find({ session: session._id });
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.done).length;

      const target = session.targetMinutes || 25;
      const focused = Math.max(0, Number(session.focusMinutes) || 0);
      const isFullSession = Boolean(completed) && focused >= target;

      let honeyEarned = 0;
      let xpEarned = 0;

      if (isFullSession) {
        // Full Pomodoro interval completed: Base + Completion Bonus
        honeyEarned += 25;
        xpEarned += 50;

        // Tasks bonus
        honeyEarned += completedTasks * 5;
        xpEarned += completedTasks * 10;

        // Perfect task list bonus
        if (totalTasks > 0 && completedTasks === totalTasks) {
          honeyEarned += 10;
          xpEarned += 20;
        }
      } else {
        // Early quit / partial session: reduced or no honey
        honeyEarned += Math.floor(focused / 5) * 2;
        xpEarned += focused * 2;
        honeyEarned += completedTasks * 3;
        xpEarned += completedTasks * 5;
      }

      user = await User.findById(req.user._id);
      if (user) {
        const oldLevel = user.level || 1;
        user.honey = Math.max(0, (user.honey || 0) + honeyEarned);
        user.xp = Math.max(0, (user.xp || 0) + xpEarned);
        user.totalFocusMinutes = (user.totalFocusMinutes || 0) + focused;

        // Level threshold: 100 XP per level
        const newLevel = Math.floor(user.xp / 100) + 1;
        const leveledUp = newLevel > oldLevel;
        user.level = newLevel;

        await user.save();

        rewards = {
          honeyEarned,
          xpEarned,
          leveledUp,
          newLevel,
          isFullSession,
          tasksCompleted: completedTasks,
          tasksTotal: totalTasks,
          totalHoney: user.honey,
          totalXp: user.xp,
        };
      }
    }

    return res.status(200).json({
      message: 'Session updated successfully.',
      session,
      rewards,
      user,
    });
  } catch (error) {
    console.error('updateSession error:', error);
    return res.status(500).json({ message: 'Failed to update session.', error: error.message });
  }
};

export const getSessionHistory = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .sort({ startTime: -1 })
      .limit(20);

    return res.status(200).json({ sessions });
  } catch (error) {
    console.error('getSessionHistory error:', error);
    return res.status(500).json({ message: 'Failed to fetch session history.' });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findOne({ _id: id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const tasks = await Task.find({ session: id }).sort({ createdAt: 1 });

    return res.status(200).json({ session, tasks });
  } catch (error) {
    console.error('getSessionById error:', error);
    return res.status(500).json({ message: 'Failed to fetch session details.' });
  }
};
