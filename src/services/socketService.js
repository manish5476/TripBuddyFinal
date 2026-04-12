// src/services/socketService.js
// Triggering Fast Refresh for socket fix
import { io } from 'socket.io-client';
import { API_CONFIG } from '../constants';

let socket = null;

export const socketService = {
  // ── Connect / Disconnect ─────────────────────────
  connect: (token) => {
    if (socket?.connected) return socket;
    socket = io(API_CONFIG.SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socket.on('connect',       () => console.log('✅ Socket connected:', socket.id));
    socket.on('disconnect',    (r) => console.log('❌ Socket disconnected:', r));
    socket.on('connect_error', (e) => console.log('⚠️ Socket error:', e.message));
    return socket;
  },

  disconnect: () => { socket?.disconnect(); socket = null; },

  // ── Channel rooms ────────────────────────────────
  joinRoom:  (channelId) => socket?.emit('channel:join',  { channelId }),
  leaveRoom: (channelId) => socket?.emit('channel:leave', { channelId }),

  // ── Send text message ────────────────────────────
  sendMessage: (roomId, message) =>
    socket?.emit('send_message', { roomId, message }),

  // ── Typing indicator ─────────────────────────────
  emitTyping: (channelId) => socket?.emit('channel:typing', { channelId }),
  onTyping:   (cb)     => socket?.on('user_typing', cb),

  // ── Legacy receive_message (ChatListScreen compat) ─
  onMessage:  (cb) => socket?.on('receive_message', cb),
  offMessage: ()   => socket?.off('receive_message'),

  // ── Direct socket access (ChatRoomScreen uses this)
  getSocket: () => socket,

  // ── Convenience on/off helpers ───────────────────
  on:  (event, cb) => socket?.on(event, cb),
  off: (event, cb) => socket?.off(event, cb),
};
