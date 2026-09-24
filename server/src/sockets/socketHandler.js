import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Hive } from '../models/Hive.js';
import { Message } from '../models/Message.js';
import { areAcceptedFriends } from '../controllers/chatController.js';

// In-memory active presence tracker: userId -> { socketId, userId, username, status, hiveId, hiveName }
const activeUsers = new Map();

// Helper exported to controllers to get live status
export const getUserPresence = (userId) => {
  const presence = activeUsers.get(userId.toString());
  if (!presence) {
    return { status: 'offline' };
  }
  return {
    status: presence.status || 'online',
    hiveId: presence.hiveId || null,
    hiveName: presence.hiveName || null,
  };
};

export const setupSocketHandler = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(); // Allow guest/unauthenticated socket if needed
      }

      const secret = process.env.JWT_SECRET || 'studybee_super_secret_jwt_key_cozy_library_2026';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select(
        'username equippedItems avatarConfig role isBanned'
      );

      if (user && !user.isBanned) {
        socket.user = user;
      }
      next();
    } catch (err) {
      console.warn('Socket auth verification failed:', err.message);
      next();
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;

    if (user) {
      const userIdStr = user._id.toString();
      console.log(`🔌 Authenticated socket connected: ${user.username} (${socket.id})`);

      // Register presence as online
      activeUsers.set(userIdStr, {
        socketId: socket.id,
        userId: userIdStr,
        username: user.username,
        status: 'online',
        hiveId: null,
        hiveName: null,
      });

      // Join individual user room for 1:1 notifications & chat
      socket.join(`user:${userIdStr}`);

      // Broadcast presence change to all clients
      io.emit('user:presence_changed', {
        userId: userIdStr,
        presence: { status: 'online' },
      });
    }

    // ==========================================
    // HIVES: GROUP STUDY ROOM PRESENCE & SYNC
    // ==========================================

    socket.on('hive:join', async ({ hiveId }) => {
      try {
        if (!user || !hiveId) return;
        const hive = await Hive.findById(hiveId)
          .populate('host', 'username equippedItems avatarConfig level streak')
          .populate('members', 'username equippedItems avatarConfig level streak')
          .populate('desks.user', 'username equippedItems avatarConfig');

        if (!hive) {
          return socket.emit('hive:error', { message: 'Hive not found' });
        }

        const roomName = `hive:${hiveId}`;
        socket.join(roomName);

        // Update presence to 'in_hive'
        const userIdStr = user._id.toString();
        const currentPresence = activeUsers.get(userIdStr) || {};
        activeUsers.set(userIdStr, {
          ...currentPresence,
          status: 'in_hive',
          hiveId: hive._id.toString(),
          hiveName: hive.name,
        });

        // Ensure user is in members array in DB
        const isMember = hive.members.some((m) => m._id.toString() === userIdStr);
        if (!isMember) {
          hive.members.push(user._id);
          await hive.save();
        }

        // Notify other hive members
        socket.to(roomName).emit('hive:member_joined', {
          user: {
            _id: user._id,
            username: user.username,
            equippedItems: user.equippedItems,
            avatarConfig: user.avatarConfig,
          },
        });

        // Broadcast friend status update
        io.emit('user:presence_changed', {
          userId: userIdStr,
          presence: { status: 'in_hive', hiveId: hive._id.toString(), hiveName: hive.name },
        });

        // Send full state to the joining user
        socket.emit('hive:state', { hive });
      } catch (err) {
        console.error('Error on hive:join:', err);
      }
    });

    socket.on('hive:leave', async ({ hiveId }) => {
      try {
        if (!user || !hiveId) return;
        const userIdStr = user._id.toString();
        const roomName = `hive:${hiveId}`;

        socket.leave(roomName);

        // Update presence back to online
        activeUsers.set(userIdStr, {
          socketId: socket.id,
          userId: userIdStr,
          username: user.username,
          status: 'online',
          hiveId: null,
          hiveName: null,
        });

        const hive = await Hive.findById(hiveId);
        if (hive) {
          hive.members = hive.members.filter((m) => m.toString() !== userIdStr);
          const vacatedDesk = hive.desks.find((d) => d.user && d.user.toString() === userIdStr);
          hive.desks = hive.desks.filter((d) => d.user && d.user.toString() !== userIdStr);
          await hive.save();

          if (vacatedDesk) {
            io.to(roomName).emit('hive:desk_vacated', {
              deskId: vacatedDesk.deskId,
              userId: userIdStr,
            });
          }

          io.to(roomName).emit('hive:member_left', {
            userId: userIdStr,
          });
        }

        io.emit('user:presence_changed', {
          userId: userIdStr,
          presence: { status: 'online' },
        });
      } catch (err) {
        console.error('Error on hive:leave:', err);
      }
    });

    socket.on('hive:claim_desk', async ({ hiveId, deskId, subject }) => {
      try {
        if (!user || !hiveId || !deskId) return;
        const userIdStr = user._id.toString();
        const hive = await Hive.findById(hiveId);
        if (!hive) return;

        // Check if desk is already occupied by someone else
        const alreadyOccupied = hive.desks.find(
          (d) => d.deskId === deskId && d.user.toString() !== userIdStr
        );
        if (alreadyOccupied) {
          return socket.emit('hive:error', { message: 'This desk was just claimed by another scholar!' });
        }

        // Vacate previous desk if user was seated elsewhere in this hive
        hive.desks = hive.desks.filter((d) => d.user.toString() !== userIdStr);

        // Add new desk seating
        hive.desks.push({
          deskId,
          user: user._id,
          subject: subject ? subject.trim() : 'General Focus',
          seatedAt: new Date(),
        });

        await hive.save();

        // Broadcast to everyone in hive room
        io.to(`hive:${hiveId}`).emit('hive:desk_claimed', {
          deskId,
          user: {
            _id: user._id,
            username: user.username,
            equippedItems: user.equippedItems,
            avatarConfig: user.avatarConfig,
          },
          subject: subject ? subject.trim() : 'General Focus',
        });
      } catch (err) {
        console.error('Error on hive:claim_desk:', err);
      }
    });

    socket.on('hive:vacate_desk', async ({ hiveId, deskId }) => {
      try {
        if (!user || !hiveId || !deskId) return;
        const userIdStr = user._id.toString();
        const hive = await Hive.findById(hiveId);
        if (!hive) return;

        hive.desks = hive.desks.filter(
          (d) => !(d.deskId === deskId && d.user.toString() === userIdStr)
        );
        await hive.save();

        io.to(`hive:${hiveId}`).emit('hive:desk_vacated', {
          deskId,
          userId: userIdStr,
        });
      } catch (err) {
        console.error('Error on hive:vacate_desk:', err);
      }
    });

    // ==========================================
    // SHARED HIVE TIMER (COLLABORATIVE SYNC)
    // ==========================================

    socket.on('hive:timer:start', async ({ hiveId }) => {
      try {
        if (!user || !hiveId) return;
        const hive = await Hive.findById(hiveId);
        if (!hive) return;

        const remaining = hive.timerState?.remainingSeconds > 0
          ? hive.timerState.remainingSeconds
          : hive.timerState?.duration || 25 * 60;

        const endsAt = Date.now() + remaining * 1000;

        hive.timerState.isRunning = true;
        hive.timerState.startedAt = new Date();
        hive.timerState.endsAt = endsAt;
        hive.timerState.remainingSeconds = remaining;
        hive.timerState.lastUpdated = new Date();

        await hive.save();

        io.to(`hive:${hiveId}`).emit('hive:timer:update', {
          mode: hive.timerState.mode,
          duration: hive.timerState.duration,
          remainingSeconds: remaining,
          isRunning: true,
          endsAt,
          serverTime: Date.now(),
        });
      } catch (err) {
        console.error('Error on hive:timer:start:', err);
      }
    });

    socket.on('hive:timer:pause', async ({ hiveId }) => {
      try {
        if (!user || !hiveId) return;
        const hive = await Hive.findById(hiveId);
        if (!hive) return;

        let remaining = hive.timerState.remainingSeconds;
        if (hive.timerState.isRunning && hive.timerState.endsAt) {
          remaining = Math.max(0, Math.round((hive.timerState.endsAt - Date.now()) / 1000));
        }

        hive.timerState.isRunning = false;
        hive.timerState.endsAt = null;
        hive.timerState.remainingSeconds = remaining;
        hive.timerState.lastUpdated = new Date();

        await hive.save();

        io.to(`hive:${hiveId}`).emit('hive:timer:update', {
          mode: hive.timerState.mode,
          duration: hive.timerState.duration,
          remainingSeconds: remaining,
          isRunning: false,
          endsAt: null,
          serverTime: Date.now(),
        });
      } catch (err) {
        console.error('Error on hive:timer:pause:', err);
      }
    });

    socket.on('hive:timer:reset', async ({ hiveId }) => {
      try {
        if (!user || !hiveId) return;
        const hive = await Hive.findById(hiveId);
        if (!hive) return;

        const duration = hive.timerState?.duration || 25 * 60;
        hive.timerState.isRunning = false;
        hive.timerState.endsAt = null;
        hive.timerState.remainingSeconds = duration;
        hive.timerState.lastUpdated = new Date();

        await hive.save();

        io.to(`hive:${hiveId}`).emit('hive:timer:update', {
          mode: hive.timerState.mode,
          duration,
          remainingSeconds: duration,
          isRunning: false,
          endsAt: null,
          serverTime: Date.now(),
        });
      } catch (err) {
        console.error('Error on hive:timer:reset:', err);
      }
    });

    socket.on('hive:timer:set_mode', async ({ hiveId, mode, durationMinutes }) => {
      try {
        if (!user || !hiveId) return;
        const hive = await Hive.findById(hiveId);
        if (!hive) return;

        const validModes = {
          focus: 25,
          shortBreak: 5,
          longBreak: 15,
        };

        const targetMinutes = durationMinutes || validModes[mode] || 25;
        const durationSeconds = targetMinutes * 60;

        hive.timerState.mode = mode || 'focus';
        hive.timerState.duration = durationSeconds;
        hive.timerState.remainingSeconds = durationSeconds;
        hive.timerState.isRunning = false;
        hive.timerState.endsAt = null;
        hive.timerState.lastUpdated = new Date();

        await hive.save();

        io.to(`hive:${hiveId}`).emit('hive:timer:update', {
          mode: hive.timerState.mode,
          duration: durationSeconds,
          remainingSeconds: durationSeconds,
          isRunning: false,
          endsAt: null,
          serverTime: Date.now(),
        });
      } catch (err) {
        console.error('Error on hive:timer:set_mode:', err);
      }
    });

    // ==========================================
    // 1:1 FRIEND CHAT & REAL-TIME MESSAGING
    // ==========================================

    socket.on('chat:send', async ({ recipientId, text }) => {
      try {
        if (!user) return;
        if (!text || !text.trim()) return;
        if (!recipientId) return;

        const currentUserId = user._id;

        // Strict security rule: Only accepted friends can chat
        const isFriend = await areAcceptedFriends(currentUserId, recipientId);
        if (!isFriend) {
          return socket.emit('chat:error', {
            message: 'You can only chat with accepted study friends.',
          });
        }

        const message = new Message({
          sender: currentUserId,
          recipient: recipientId,
          text: text.trim().slice(0, 1000),
          read: false,
        });

        await message.save();

        const populated = await Message.findById(message._id).populate(
          'sender',
          'username equippedItems avatarConfig'
        );

        // Emit to recipient's personal room
        io.to(`user:${recipientId}`).emit('chat:message', populated);

        // Emit back to sender
        socket.emit('chat:message', populated);
      } catch (err) {
        console.error('Error on chat:send:', err);
        socket.emit('chat:error', { message: 'Failed to send message.' });
      }
    });

    socket.on('chat:read', async ({ friendId }) => {
      try {
        if (!user || !friendId) return;
        await Message.updateMany(
          {
            sender: friendId,
            recipient: user._id,
            read: false,
          },
          {
            $set: { read: true },
          }
        );

        // Notify friend that messages were read
        io.to(`user:${friendId}`).emit('chat:read_receipt', {
          readerId: user._id.toString(),
        });
      } catch (err) {
        console.error('Error on chat:read:', err);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`👋 Client disconnected: ${socket.id}`);
      if (user) {
        const userIdStr = user._id.toString();
        const presence = activeUsers.get(userIdStr);

        // If user was in a hive, vacate their desk and leave
        if (presence?.hiveId) {
          try {
            const hive = await Hive.findById(presence.hiveId);
            if (hive) {
              const vacatedDesk = hive.desks.find(
                (d) => d.user && d.user.toString() === userIdStr
              );
              hive.desks = hive.desks.filter(
                (d) => d.user && d.user.toString() !== userIdStr
              );
              hive.members = hive.members.filter((m) => m.toString() !== userIdStr);
              await hive.save();

              const roomName = `hive:${presence.hiveId}`;
              if (vacatedDesk) {
                io.to(roomName).emit('hive:desk_vacated', {
                  deskId: vacatedDesk.deskId,
                  userId: userIdStr,
                });
              }
              io.to(roomName).emit('hive:member_left', {
                userId: userIdStr,
              });
            }
          } catch (err) {
            console.error('Error during hive disconnect cleanup:', err);
          }
        }

        activeUsers.delete(userIdStr);

        // Broadcast offline status
        io.emit('user:presence_changed', {
          userId: userIdStr,
          presence: { status: 'offline' },
        });
      }
    });
  });
};
