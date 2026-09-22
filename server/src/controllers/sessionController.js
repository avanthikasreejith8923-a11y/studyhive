import { Session } from '../models/Session.js';
import { Task } from '../models/Task.js';

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

    return res.status(200).json({
      message: 'Session updated successfully.',
      session,
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
