import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getAuthToken } from '../services/api';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [presenceMap, setPresenceMap] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const token = getAuthToken();
    const newSocket = io({
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🐝 Connected to StudyHive real-time socket:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from StudyHive socket');
      setConnected(false);
    });

    newSocket.on('user:presence_changed', ({ userId, presence }) => {
      setPresenceMap((prev) => ({
        ...prev,
        [userId]: presence,
      }));
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?._id]);

  // Emitter helpers
  const joinHive = (hiveId) => {
    if (socketRef.current) {
      socketRef.current.emit('hive:join', { hiveId });
    }
  };

  const leaveHive = (hiveId) => {
    if (socketRef.current) {
      socketRef.current.emit('hive:leave', { hiveId });
    }
  };

  const claimDesk = (hiveId, deskId, subject) => {
    if (socketRef.current) {
      socketRef.current.emit('hive:claim_desk', { hiveId, deskId, subject });
    }
  };

  const vacateDesk = (hiveId, deskId) => {
    if (socketRef.current) {
      socketRef.current.emit('hive:vacate_desk', { hiveId, deskId });
    }
  };

  const startHiveTimer = (hiveId) => {
    if (socketRef.current) {
      socketRef.current.emit('hive:timer:start', { hiveId });
    }
  };

  const pauseHiveTimer = (hiveId) => {
    if (socketRef.current) {
      socketRef.current.emit('hive:timer:pause', { hiveId });
    }
  };

  const resetHiveTimer = (hiveId) => {
    if (socketRef.current) {
      socketRef.current.emit('hive:timer:reset', { hiveId });
    }
  };

  const setHiveTimerMode = (hiveId, mode, durationMinutes) => {
    if (socketRef.current) {
      socketRef.current.emit('hive:timer:set_mode', { hiveId, mode, durationMinutes });
    }
  };

  const sendChatMessage = (recipientId, text) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:send', { recipientId, text });
    }
  };

  const markChatRead = (friendId) => {
    if (socketRef.current) {
      socketRef.current.emit('chat:read', { friendId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        presenceMap,
        joinHive,
        leaveHive,
        claimDesk,
        vacateDesk,
        startHiveTimer,
        pauseHiveTimer,
        resetHiveTimer,
        setHiveTimerMode,
        sendChatMessage,
        markChatRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
