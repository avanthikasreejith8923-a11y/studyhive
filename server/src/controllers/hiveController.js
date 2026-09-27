import crypto from 'crypto';
import { Hive } from '../models/Hive.js';

/**
 * Generates a random 6-character alphanumeric join code (e.g. "BEE789")
 */
const generateJoinCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // excluding confusing chars like I, O, 1, 0
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new Hive
export const createHive = async (req, res) => {
  try {
    const { name, topic, isPublic } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Hive name must be at least 2 characters.' });
    }

    // Generate unique join code
    let joinCode = generateJoinCode();
    let exists = await Hive.findOne({ joinCode });
    while (exists) {
      joinCode = generateJoinCode();
      exists = await Hive.findOne({ joinCode });
    }

    const hive = new Hive({
      name: name.trim(),
      topic: topic ? topic.trim() : 'Cozy Library Study Session',
      joinCode,
      host: req.user._id,
      members: [req.user._id],
      desks: [],
      isPublic: isPublic !== false,
      timerState: {
        mode: 'focus',
        duration: 25 * 60,
        remainingSeconds: 25 * 60,
        isRunning: false,
        startedAt: null,
        endsAt: null,
        lastUpdated: new Date(),
      },
    });

    await hive.save();

    const populated = await Hive.findById(hive._id)
      .populate('host', 'username equippedItems avatarConfig level streak')
      .populate('members', 'username equippedItems avatarConfig level streak')
      .populate('desks.user', 'username equippedItems avatarConfig');

    res.status(201).json({
      message: 'Hive created successfully! 🐝',
      hive: populated,
    });
  } catch (error) {
    console.error('Error creating hive:', error);
    res.status(500).json({ message: 'Failed to create hive', error: error.message });
  }
};

// List public hives (with pagination)
export const listHives = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [hives, totalCount] = await Promise.all([
      Hive.find({ isPublic: true })
        .populate('host', 'username equippedItems avatarConfig')
        .populate('members', 'username equippedItems avatarConfig')
        .populate('desks.user', 'username equippedItems avatarConfig')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Hive.countDocuments({ isPublic: true }),
    ]);

    res.json({
      hives,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit) || 1,
    });
  } catch (error) {
    console.error('Error listing hives:', error);
    res.status(500).json({ message: 'Failed to retrieve hives', error: error.message });
  }
};

// Get single hive details
export const getHiveById = async (req, res) => {
  try {
    const { id } = req.params;
    const hive = await Hive.findById(id)
      .populate('host', 'username equippedItems avatarConfig level streak')
      .populate('members', 'username equippedItems avatarConfig level streak')
      .populate('desks.user', 'username equippedItems avatarConfig');

    if (!hive) {
      return res.status(404).json({ message: 'Hive not found in the archives.' });
    }

    res.json({ hive });
  } catch (error) {
    console.error('Error getting hive:', error);
    res.status(500).json({ message: 'Failed to fetch hive', error: error.message });
  }
};

// Join hive by Join Code (or ID)
export const joinHive = async (req, res) => {
  try {
    const { joinCode, hiveId } = req.body;

    let query = {};
    if (joinCode) {
      query.joinCode = joinCode.trim().toUpperCase();
    } else if (hiveId) {
      query._id = hiveId;
    } else {
      return res.status(400).json({ message: 'Please provide a hive join code.' });
    }

    const hive = await Hive.findOne(query);

    if (!hive) {
      return res.status(404).json({ message: 'No hive found matching this code.' });
    }

    // Add user if not already a member
    const userIdStr = req.user._id.toString();
    const isMember = hive.members.some((m) => m.toString() === userIdStr);
    if (!isMember) {
      hive.members.push(req.user._id);
      await hive.save();
    }

    const populated = await Hive.findById(hive._id)
      .populate('host', 'username equippedItems avatarConfig level streak')
      .populate('members', 'username equippedItems avatarConfig level streak')
      .populate('desks.user', 'username equippedItems avatarConfig');

    res.json({
      message: 'Joined hive successfully! 🐝',
      hive: populated,
    });
  } catch (error) {
    console.error('Error joining hive:', error);
    res.status(500).json({ message: 'Failed to join hive', error: error.message });
  }
};

// Leave hive
export const leaveHive = async (req, res) => {
  try {
    const { id } = req.params;
    const hive = await Hive.findById(id);

    if (!hive) {
      return res.status(404).json({ message: 'Hive not found.' });
    }

    const userIdStr = req.user._id.toString();

    // Remove from members
    hive.members = hive.members.filter((m) => m.toString() !== userIdStr);

    // Vacate any desk the user was seated at
    hive.desks = hive.desks.filter((d) => d.user && d.user.toString() !== userIdStr);

    // If host left and other members exist, transfer host to next member
    if (hive.host.toString() === userIdStr && hive.members.length > 0) {
      hive.host = hive.members[0];
    }

    await hive.save();

    const populated = await Hive.findById(hive._id)
      .populate('host', 'username equippedItems avatarConfig level streak')
      .populate('members', 'username equippedItems avatarConfig level streak')
      .populate('desks.user', 'username equippedItems avatarConfig');

    res.json({
      message: 'Left hive successfully.',
      hive: populated,
    });
  } catch (error) {
    console.error('Error leaving hive:', error);
    res.status(500).json({ message: 'Failed to leave hive', error: error.message });
  }
};
