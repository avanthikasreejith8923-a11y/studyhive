import { Task } from '../models/Task.js';
import { Session } from '../models/Session.js';

export const getTasks = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Verify session belongs to user
    const session = await Session.findOne({ _id: sessionId, user: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const tasks = await Task.find({ session: sessionId }).sort({ createdAt: 1 });
    return res.status(200).json({ tasks });
  } catch (error) {
    console.error('getTasks error:', error);
    return res.status(500).json({ message: 'Failed to fetch tasks.', error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Task text cannot be empty.' });
    }

    const session = await Session.findOne({ _id: sessionId, user: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const task = await Task.create({
      session: sessionId,
      user: req.user._id,
      text: text.trim(),
      done: false,
    });

    return res.status(201).json({
      message: 'Task added to session checklist.',
      task,
    });
  } catch (error) {
    console.error('createTask error:', error);
    return res.status(500).json({ message: 'Failed to create task.', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { done, text } = req.body;

    const task = await Task.findOne({ _id: id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (done !== undefined) task.done = Boolean(done);
    if (text !== undefined && text.trim()) task.text = text.trim();

    await task.save();

    return res.status(200).json({
      message: 'Task updated.',
      task,
    });
  } catch (error) {
    console.error('updateTask error:', error);
    return res.status(500).json({ message: 'Failed to update task.', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    return res.status(200).json({
      message: 'Task removed.',
      taskId: id,
    });
  } catch (error) {
    console.error('deleteTask error:', error);
    return res.status(500).json({ message: 'Failed to delete task.', error: error.message });
  }
};
