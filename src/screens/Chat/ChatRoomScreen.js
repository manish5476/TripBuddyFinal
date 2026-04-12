// src/screens/Chat/ChatRoomScreen.js
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  ChatRoomScreen — Full Messaging Implementation             ║
 * ║                                                              ║
 * ║  Features:                                                   ║
 * ║  • Cursor-based paginated message loading (before=seq)       ║
 * ║  • Text / Media / Voice / Poll / Reaction / Vote            ║
 * ║  • Swipe-to-reply with reply preview                        ║
 * ║  • 15-minute edit window for text messages                  ║
 * ║  • Soft delete (author + admin)                             ║
 * ║  • Emoji reaction toggling                                  ║
 * ║  • Real-time via Socket.IO (message:new, message:edited,    ║
 * ║    message:deleted, message:react, poll:voted)              ║
 * ║  • Typing indicator                                         ║
 * ║  • AttachmentBar: gallery, camera, voice, poll              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import React, {
  useState, useRef, useEffect, useCallback, useMemo,
} from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
  Modal, Image, Animated, PanResponder, Alert, Pressable, Vibration, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';

import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { messageService } from '../../services';
import { socketService } from '../../services/socketService';

const PAGE_SIZE = 30;
const EDIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// ─── Quick emoji set for reaction picker ────────────
const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '🔥', '🙏', '🎉'];

// ─── Helper: format sent-at time ────────────────────
const formatTime = (date) =>
  date ? moment(date).format('h:mm A') : '';

const formatDateDivider = (date) => {
  if (!date) return '';
  const m = moment(date);
  if (m.isSame(moment(), 'day')) return 'Today';
  if (m.isSame(moment().subtract(1, 'day'), 'day')) return 'Yesterday';
  return m.format('MMM D, YYYY');
};

// ─── Inject date-divider items between messages ─────
const injectDateDividers = (msgs) => {
  const result = [];
  let lastDate = null;
  msgs.forEach((msg) => {
    const dateKey = moment(msg.sentAt).format('YYYY-MM-DD');
    if (dateKey !== lastDate) {
      result.push({ _id: `divider_${dateKey}`, isDivider: true, date: msg.sentAt });
      lastDate = dateKey;
    }
    result.push(msg);
  });
  return result;
};

// ─── Avatar initials ─────────────────────────────────
const Avatar = ({ sender, size = 32 }) => {
  const initials = (sender?.displayName || sender?.username || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const color = useMemo(() => {
    const palette = ['#7c3aed', '#0ea5e9', '#10b981', '#f97316', '#ec4899', '#ef4444'];
    const idx = (sender?._id || '').charCodeAt(0) % palette.length;
    return palette[idx] || COLORS.accent;
  }, [sender?._id]);

  if (sender?.avatarUrl) {
    return (
      <Image
        source={{ uri: sender.avatarUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, justifyContent: 'center', alignItems: 'center',
    }}>
      <Text style={{ color: '#fff', fontSize: size * 0.37, fontWeight: '800' }}>{initials}</Text>
    </View>
  );
};

// ─── Poll Message Renderer ────────────────────────────
const PollMessage = ({ msg, onVote, currentUserId }) => {
  const poll = msg.pollPayload;
  if (!poll) return null;

  const totalVotes = poll.options.reduce((s, o) => s + (o.votes || 0), 0);
  const hasExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const isClosed = poll.isClosed || hasExpired;

  const myVotes = poll.options
    .map((o, i) => (o.voterIds?.some((id) => id.toString() === currentUserId) ? i : -1))
    .filter((i) => i !== -1);

  return (
    <View style={styles.pollCard}>
      <Text style={styles.pollQuestion}>{poll.question}</Text>
      {poll.options.map((opt, idx) => {
        const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
        const voted = myVotes.includes(idx);
        return (
          <TouchableOpacity
            key={idx}
            style={[styles.pollOption, voted && styles.pollOptionVoted]}
            onPress={() => !isClosed && onVote(msg._id, [idx])}
            activeOpacity={isClosed ? 1 : 0.7}
          >
            <View style={[styles.pollBar, { width: `${pct}%` }]} />
            <View style={styles.pollOptionContent}>
              <Text style={[styles.pollOptionText, voted && { color: COLORS.accent }]}>
                {voted && <Ionicons name="checkmark-circle" size={13} color={COLORS.accent} />} {opt.text}
              </Text>
              <Text style={styles.pollPct}>{pct}%</Text>
            </View>
          </TouchableOpacity>
        );
      })}
      <Text style={styles.pollMeta}>
        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        {isClosed ? ' · Closed' : poll.expiresAt ? ` · Ends ${moment(poll.expiresAt).fromNow()}` : ''}
        {poll.isMultiChoice ? ' · Multiple choice' : ''}
      </Text>
    </View>
  );
};

// ─── Reaction Summary row ────────────────────────────
const ReactionRow = ({ msg, onReact, currentUserId }) => {
  const summary = msg.reactionSummary || {};
  const entries = Object.entries(summary).filter(([, c]) => c > 0);
  if (!entries.length) return null;
  return (
    <View style={styles.reactionRow}>
      {entries.map(([emoji, count]) => {
        const myReaction = msg.reactions?.some(
          (r) => r.emoji === emoji && r.userId?.toString() === currentUserId
        );
        return (
          <TouchableOpacity
            key={emoji}
            style={[styles.reactionChip, myReaction && styles.reactionChipMine]}
            onPress={() => onReact(msg._id, emoji)}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            <Text style={[styles.reactionCount, myReaction && { color: COLORS.accent }]}>{count}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Single Message Bubble ────────────────────────────
const MessageBubble = React.memo(({
  msg, isMine, onLongPress, onReact, onReply, onVote, currentUserId,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 && Math.abs(g.dy) < 20,
    onPanResponderMove: (_, g) => {
      if ((isMine && g.dx < 0) || (!isMine && g.dx > 0)) {
        translateX.setValue(Math.max(-60, Math.min(60, g.dx)));
      }
    },
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dx) > 40) {
        Vibration.vibrate(30);
        onReply(msg);
      }
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    },
  });

  if (msg.isDivider) {
    return (
      <View style={styles.dateDivider}>
        <View style={styles.dateLine} />
        <Text style={styles.dateLabel}>{formatDateDivider(msg.date)}</Text>
        <View style={styles.dateLine} />
      </View>
    );
  }

  if (msg.isDeleted) {
    return (
      <View style={[styles.msgRow, isMine && styles.msgRowMine]}>
        <View style={[styles.bubble, styles.bubbleDeleted]}>
          <Text style={styles.deletedText}>⛔ This message was deleted</Text>
        </View>
      </View>
    );
  }

  if (msg.type === 'system') {
    return (
      <View style={styles.systemMsgWrap}>
        <Text style={styles.systemMsg}>📢 {msg.text}</Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={[styles.msgRow, isMine && styles.msgRowMine, { transform: [{ translateX }] }]}
      {...panResponder.panHandlers}
    >
      {!isMine && (
        <View style={styles.avatarWrap}>
          <Avatar sender={msg.senderId} size={30} />
        </View>
      )}

      <View style={{ maxWidth: '78%' }}>
        {/* Reply preview */}
        {msg.replyPreview && (
          <View style={[styles.replyPreview, isMine && styles.replyPreviewMine]}>
            <View style={styles.replyBar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.replyName}>{msg.replyPreview.senderName}</Text>
              <Text style={styles.replyText} numberOfLines={1}>{msg.replyPreview.textPreview}</Text>
            </View>
          </View>
        )}

        <Pressable
          onLongPress={() => onLongPress(msg)}
          delayLongPress={350}
          style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}
        >
          {/* Sender name for group msgs */}
          {!isMine && (
            <Text style={styles.senderName}>
              {msg.senderId?.displayName || msg.senderId?.username || 'Unknown'}
            </Text>
          )}

          {/* ── Text ── */}
          {msg.type === 'text' && (
            <Text style={[styles.msgText, isMine && styles.msgTextMine]}>
              {msg.text}
              {msg.isEdited && <Text style={styles.editedTag}> (edited)</Text>}
            </Text>
          )}

          {/* ── Media ── */}
          {msg.type === 'media' && msg.media?.length > 0 && (
            <View style={styles.mediaGrid}>
              {msg.media.map((m, idx) => (
                <View key={idx} style={styles.mediaThumb}>
                  {m.type === 'video' ? (
                    <View style={styles.videoThumb}>
                      <Image source={{ uri: m.thumbnailUrl || m.url }} style={styles.mediaImg} />
                      <View style={styles.playOverlay}>
                        <Ionicons name="play-circle" size={36} color="#fff" />
                      </View>
                    </View>
                  ) : (
                    <Image source={{ uri: m.url }} style={styles.mediaImg} />
                  )}
                </View>
              ))}
              {msg.text ? <Text style={[styles.msgText, isMine && styles.msgTextMine, { marginTop: 6 }]}>{msg.text}</Text> : null}
            </View>
          )}

          {/* ── Voice note ── */}
          {msg.type === 'audio' && msg.media?.length > 0 && (
            <View style={styles.voiceNote}>
              <Ionicons name="mic" size={18} color={isMine ? '#fff' : COLORS.accent} />
              <View style={styles.voiceWave}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      {
                        height: 4 + Math.random() * 16,
                        backgroundColor: isMine ? 'rgba(255,255,255,0.7)' : COLORS.accent,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.voiceDuration, isMine && { color: 'rgba(255,255,255,0.8)' }]}>
                {msg.media[0]?.durationSeconds
                  ? `${Math.floor(msg.media[0].durationSeconds / 60)}:${String(msg.media[0].durationSeconds % 60).padStart(2, '0')}`
                  : '0:00'}
              </Text>
            </View>
          )}

          {/* ── Poll ── */}
          {msg.type === 'poll' && (
            <PollMessage msg={msg} onVote={onVote} currentUserId={currentUserId} />
          )}

          {/* ── Location ── */}
          {msg.type === 'location' && (
            <View style={styles.locationCard}>
              <Ionicons name="location" size={18} color={COLORS.danger} />
              <Text style={[styles.msgText, isMine && styles.msgTextMine, { flex: 1 }]}>
                {msg.sharedLocation?.locationName || 'Shared a location'}
                {msg.sharedLocation?.isLive && (
                  <Text style={{ color: COLORS.success }}> 🔴 Live</Text>
                )}
              </Text>
            </View>
          )}

          {/* ── Shared Entity (Stop / Journey / Reel) ── */}
          {['stop_share', 'journey_share', 'reel_share'].includes(msg.type) && msg.sharedEntity && (
            <View style={styles.entityCard}>
              {msg.sharedEntity.previewImage
                ? <Image source={{ uri: msg.sharedEntity.previewImage }} style={styles.entityImg} />
                : null}
              <View style={styles.entityInfo}>
                <Text style={styles.entityType}>{msg.sharedEntity.entityType}</Text>
                <Text style={styles.entityTitle} numberOfLines={2}>{msg.sharedEntity.previewTitle}</Text>
                {msg.sharedEntity.previewMeta ? <Text style={styles.entityMeta}>{msg.sharedEntity.previewMeta}</Text> : null}
              </View>
            </View>
          )}

          {/* ── Expense share ── */}
          {msg.type === 'expense_share' && msg.expenseSharePayload && (
            <View style={styles.expenseCard}>
              <Ionicons name="wallet" size={18} color={COLORS.warning} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.msgText, isMine && styles.msgTextMine]}>{msg.expenseSharePayload.title}</Text>
                <Text style={[styles.expenseAmount, isMine && { color: 'rgba(255,255,255,0.85)' }]}>
                  ₹{msg.expenseSharePayload.amountINR?.toLocaleString()}
                  {msg.expenseSharePayload.splitCount > 1
                    ? ` ÷ ${msg.expenseSharePayload.splitCount} people`
                    : ''}
                </Text>
              </View>
            </View>
          )}

          {/* Time + delivery status */}
          <View style={[styles.msgMeta, isMine && { justifyContent: 'flex-end' }]}>
            <Text style={[styles.msgTime, isMine && styles.msgTimeMine]}>
              {formatTime(msg.sentAt)}
            </Text>
            {isMine && (
              <Ionicons
                name={msg.deliveryStatus === 'read' ? 'checkmark-done' : 'checkmark-done-outline'}
                size={12}
                color={msg.deliveryStatus === 'read' ? COLORS.accent : 'rgba(255,255,255,0.5)'}
                style={{ marginLeft: 3 }}
              />
            )}
          </View>
        </Pressable>

        {/* Reactions */}
        <ReactionRow msg={msg} onReact={onReact} currentUserId={currentUserId} />
      </View>

      {isMine && (
        <View style={[styles.avatarWrap, { marginLeft: 8, marginRight: 0 }]}>
          <Avatar sender={msg.senderId} size={30} />
        </View>
      )}
    </Animated.View>
  );
});

// ─── Poll Creation Modal ─────────────────────────────
const PollModal = ({ visible, onClose, onSubmit }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isMultiChoice, setIsMultiChoice] = useState(false);
  const [expiresIn, setExpiresIn] = useState(24);

  const addOption = () => options.length < 10 && setOptions([...options, '']);
  const updateOption = (i, v) => setOptions(options.map((o, idx) => idx === i ? v : o));
  const removeOption = (i) => options.length > 2 && setOptions(options.filter((_, idx) => idx !== i));

  const submit = () => {
    if (!question.trim()) return Alert.alert('Error', 'Please enter a question');
    const valid = options.filter((o) => o.trim());
    if (valid.length < 2) return Alert.alert('Error', 'At least 2 options required');
    onSubmit({ question: question.trim(), options: valid, isMultiChoice, expiresInHours: expiresIn });
    setQuestion(''); setOptions(['', '']); setIsMultiChoice(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.pollModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Poll</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>

          <TextInput
            style={styles.pollQuestionInput}
            placeholder="Ask a question..."
            placeholderTextColor={COLORS.textLight}
            value={question}
            onChangeText={setQuestion}
            multiline
          />

          {options.map((opt, i) => (
            <View key={i} style={styles.optionRow}>
              <TextInput
                style={styles.optionInput}
                placeholder={`Option ${i + 1}`}
                placeholderTextColor={COLORS.textLight}
                value={opt}
                onChangeText={(v) => updateOption(i, v)}
              />
              {i >= 2 && (
                <TouchableOpacity onPress={() => removeOption(i)} style={{ padding: 8 }}>
                  <Ionicons name="remove-circle" size={22} color={COLORS.danger} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addOptionBtn} onPress={addOption}>
            <Ionicons name="add-circle-outline" size={18} color={COLORS.accent} />
            <Text style={styles.addOptionText}>Add option</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.multiChoiceRow}
            onPress={() => setIsMultiChoice(!isMultiChoice)}
          >
            <Ionicons
              name={isMultiChoice ? 'checkbox' : 'checkbox-outline'}
              size={22}
              color={isMultiChoice ? COLORS.accent : COLORS.textSecondary}
            />
            <Text style={styles.multiChoiceLabel}>Allow multiple choices</Text>
          </TouchableOpacity>

          <View style={styles.expiryRow}>
            <Text style={styles.expiryLabel}>Expires in:</Text>
            {[1, 6, 24, 72].map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.expiryChip, expiresIn === h && styles.expiryChipActive]}
                onPress={() => setExpiresIn(h)}
              >
                <Text style={[styles.expiryText, expiresIn === h && { color: COLORS.white }]}>
                  {h < 24 ? `${h}h` : `${h / 24}d`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitPollBtn} onPress={submit}>
            <Text style={styles.submitPollText}>Create Poll</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── Message context menu modal ───────────────────────
const MessageMenu = ({ visible, msg, isMine, isAdmin, onClose, onReact, onEdit, onDelete, onReply }) => {
  const canEdit = isMine && msg?.type === 'text'
    && (Date.now() - new Date(msg.sentAt).getTime()) < EDIT_WINDOW_MS;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.menuOverlay} onPress={onClose}>
        <View style={styles.menuCard}>
          {/* Quick reaction bar */}
          <View style={styles.quickReactions}>
            {QUICK_EMOJIS.map((e) => (
              <TouchableOpacity key={e} onPress={() => { onReact(msg?._id, e); onClose(); }} style={styles.quickEmojiBtn}>
                <Text style={styles.quickEmoji}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.menuDivider} />
          {/* Actions */}
          <TouchableOpacity style={styles.menuItem} onPress={() => { onReply(msg); onClose(); }}>
            <Ionicons name="arrow-undo" size={20} color={COLORS.textPrimary} />
            <Text style={styles.menuItemText}>Reply</Text>
          </TouchableOpacity>
          {canEdit && (
            <TouchableOpacity style={styles.menuItem} onPress={() => { onEdit(msg); onClose(); }}>
              <Ionicons name="pencil" size={20} color={COLORS.accent} />
              <Text style={[styles.menuItemText, { color: COLORS.accent }]}>Edit</Text>
            </TouchableOpacity>
          )}
          {(isMine || isAdmin) && (
            <TouchableOpacity style={styles.menuItem} onPress={() => { onDelete(msg?._id); onClose(); }}>
              <Ionicons name="trash" size={20} color={COLORS.danger} />
              <Text style={[styles.menuItemText, { color: COLORS.danger }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════
// MAIN SCREEN
// ══════════════════════════════════════════════════════
export default function ChatRoomScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { channelId, channelName = 'Chat', channelType = 'group' } = route.params || {};
  const { user } = useAuth();

  // ─── State ──────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const [replyTo, setReplyTo] = useState(null);      // message being replied to
  const [editingMsg, setEditingMsg] = useState(null);      // message being edited
  const [menuMsg, setMenuMsg] = useState(null);      // context menu target
  const [menuVisible, setMenuVisible] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [pollVisible, setPollVisible] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);        // names of users typing

  // Cursor for pagination
  const lowestSeq = useRef(null);
  const flatListRef = useRef(null);
  const typingTimer = useRef(null);
  const isAdminRef = useRef(false); // will be set after members check

  // ─── Load initial messages ───────────────────────────
  const loadMessages = useCallback(async (before = null, prepend = false) => {
    if (!channelId) return;
    if (prepend) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = { limit: PAGE_SIZE };
      if (before) params.before = before;
      const res = await messageService.getMessages(channelId, params);
      const { data = [], pagination = {} } = res || {};

      setHasMore(pagination.hasMore || false);
      if (data.length > 0) lowestSeq.current = data[0].seq;  // oldest seq in page

      if (prepend) {
        setMessages((prev) => [...data, ...prev]);
      } else {
        setMessages(data);
        // Scroll to bottom initially
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 150);
      }
    } catch (err) {
      console.log('loadMessages error', err?.response?.data || err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [channelId]);

  // ─── Socket setup ────────────────────────────────────
  useEffect(() => {
    if (!channelId) return;
    const socket = socketService.getSocket();
    if (!socket) return;

    // join channel room
    socketService.joinRoom(channelId);

    // New message
    const onNewMsg = ({ message }) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
    };

    // Edited
    const onEdited = ({ messageId, text }) => {
      setMessages((prev) =>
        prev.map((m) => m._id === messageId ? { ...m, text, isEdited: true } : m)
      );
    };

    // Deleted
    const onDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => m._id === messageId ? { ...m, isDeleted: true, text: '' } : m)
      );
    };

    // Reaction
    const onReact = ({ messageId, summary, reactions }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, reactionSummary: summary, reactions: reactions || m.reactions } : m
        )
      );
    };

    // Poll vote
    const onPollVoted = ({ messageId, pollPayload }) => {
      setMessages((prev) =>
        prev.map((m) => m._id === messageId ? { ...m, pollPayload } : m)
      );
    };

    // Typing
    const onTyping = ({ userId, displayName }) => {
      if (userId === user?._id?.toString()) return;
      setTypingUsers((prev) => {
        if (!prev.includes(displayName)) return [...prev, displayName];
        return prev;
      });
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((n) => n !== displayName));
      }, 3000);
    };

    socket.on('message:new', onNewMsg);
    socket.on('message:edited', onEdited);
    socket.on('message:deleted', onDeleted);
    socket.on('message:react', onReact);
    socket.on('poll:voted', onPollVoted);
    socket.on('user_typing', onTyping);

    return () => {
      socketService.leaveRoom(channelId);
      socket.off('message:new', onNewMsg);
      socket.off('message:edited', onEdited);
      socket.off('message:deleted', onDeleted);
      socket.off('message:react', onReact);
      socket.off('poll:voted', onPollVoted);
      socket.off('user_typing', onTyping);
    };
  }, [channelId, user?._id]);

  // ─── Initial load ────────────────────────────────────
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // ─── Pagination: load more (older) ──────────────────
  const handleLoadMore = () => {
    if (loadingMore || !hasMore || !lowestSeq.current) return;
    loadMessages(lowestSeq.current, true);
  };

  // ─── Typing indicator emit ───────────────────────────
  const handleTyping = (text) => {
    setInputText(text);
    socketService.emitTyping(channelId);
    if (typingTimer.current) clearTimeout(typingTimer.current);
  };

  // ─── Send text message ───────────────────────────────
  const sendTextMessage = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    setSending(true);
    setInputText('');

    // Optimistic
    const optimistic = {
      _id: `opt_${Date.now()}`,
      senderId: user,
      type: 'text',
      text,
      sentAt: new Date(),
      deliveryStatus: 'sent',
      replyToMessageId: replyTo?._id || null,
      replyPreview: replyTo
        ? { senderName: replyTo.senderId?.displayName || 'Unknown', textPreview: replyTo.text || '', type: replyTo.type }
        : undefined,
    };
    setMessages((prev) => [...prev, optimistic]);
    setReplyTo(null);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);

    try {
      const payload = { type: 'text', text };
      if (replyTo?._id) payload.replyToMessageId = replyTo._id;
      await messageService.sendMessage(channelId, payload);
      // Real message arrives via socket, remove optimistic
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
    } catch (err) {
      Alert.alert('Failed to send', err?.response?.data?.message || 'Please try again');
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      setInputText(text); // restore
    } finally {
      setSending(false);
    }
  };

  // ─── Edit message ────────────────────────────────────
  const handleEditSubmit = async () => {
    if (!editingMsg || !inputText.trim()) return;
    setSending(true);
    try {
      await messageService.editMessage(editingMsg._id, { text: inputText.trim() });
      setMessages((prev) =>
        prev.map((m) =>
          m._id === editingMsg._id ? { ...m, text: inputText.trim(), isEdited: true } : m
        )
      );
    } catch (err) {
      Alert.alert('Edit failed', err?.response?.data?.message || 'Edit window may have expired');
    } finally {
      setEditingMsg(null);
      setInputText('');
      setSending(false);
    }
  };

  // ─── Delete message ──────────────────────────────────
  const handleDelete = (messageId) => {
    Alert.alert('Delete Message', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await messageService.deleteMessage(messageId);
            setMessages((prev) =>
              prev.map((m) => m._id === messageId ? { ...m, isDeleted: true, text: '', media: [] } : m)
            );
          } catch (err) {
            Alert.alert('Error', err?.response?.data?.message || 'Could not delete message');
          }
        },
      },
    ]);
  };

  // ─── React to message ────────────────────────────────
  const handleReact = async (messageId, emoji) => {
    try {
      const res = await messageService.reactToMessage(messageId, { emoji });
      const newSummary = res?.data?.reactionSummary || {};
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id !== messageId) return m;
          // Toggle local reaction
          const uid = user._id.toString();
          const existingIdx = m.reactions?.findIndex(
            (r) => r.userId?.toString() === uid && r.emoji === emoji
          );
          let reactions;
          if (existingIdx !== -1) {
            reactions = m.reactions.filter((_, i) => i !== existingIdx);
          } else {
            reactions = [...(m.reactions || []), { userId: user._id, emoji, reactedAt: new Date() }];
          }
          return { ...m, reactionSummary: newSummary, reactions };
        })
      );
    } catch (err) {
      console.log('react error', err?.response?.data);
    }
  };

  // ─── Vote on poll ────────────────────────────────────
  const handleVote = async (messageId, optionIndexes) => {
    try {
      const res = await messageService.votePoll(messageId, { optionIndexes });
      const pollPayload = res?.data?.pollPayload;
      if (pollPayload) {
        setMessages((prev) =>
          prev.map((m) => m._id === messageId ? { ...m, pollPayload } : m)
        );
      }
    } catch (err) {
      Alert.alert('Vote failed', err?.response?.data?.message || 'Could not record vote');
    }
  };

  // ─── Send media ──────────────────────────────────────
  const handlePickMedia = async () => {
    setAttachOpen(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.85,
      });
      if (result.canceled) return;
      const formData = new FormData();
      result.assets.forEach((asset, idx) => {
        const ext = asset.uri.split('.').pop();
        const mime = asset.type === 'video' ? `video/${ext}` : `image/${ext}`;
        formData.append('media', { uri: asset.uri, name: `media_${idx}.${ext}`, type: mime });
      });
      if (inputText.trim()) formData.append('caption', inputText.trim());
      setSending(true);
      await messageService.sendMediaMessage(channelId, formData);
      setInputText('');
    } catch (err) {
      Alert.alert('Upload failed', err?.response?.data?.message || 'Could not send media');
    } finally {
      setSending(false);
    }
  };

  const handleCamera = async () => {
    setAttachOpen(false);
    try {
      const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
      if (result.canceled) return;
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop();
      const formData = new FormData();
      formData.append('media', { uri: asset.uri, name: `photo.${ext}`, type: `image/${ext}` });
      setSending(true);
      await messageService.sendMediaMessage(channelId, formData);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Camera error');
    } finally {
      setSending(false);
    }
  };

  // ─── Send poll ───────────────────────────────────────
  const handleSendPoll = async (pollData) => {
    try {
      await messageService.sendPoll(channelId, pollData);
    } catch (err) {
      Alert.alert('Poll failed', err?.response?.data?.message || 'Could not create poll');
    }
  };

  // ─── Context menu handlers ───────────────────────────
  const handleLongPress = (msg) => {
    Vibration.vibrate(40);
    setMenuMsg(msg);
    setMenuVisible(true);
  };

  const startEdit = (msg) => {
    setEditingMsg(msg);
    setInputText(msg.text);
  };

  const startReply = (msg) => {
    setReplyTo(msg);
  };

  // ─── Prepare flat list data ──────────────────────────
  const listData = useMemo(() => injectDateDividers(messages), [messages]);

  // ─── Render item ─────────────────────────────────────
  const renderItem = ({ item }) => {
    if (item.isDivider) {
      return (
        <View style={styles.dateDivider}>
          <View style={styles.dateLine} />
          <Text style={styles.dateLabel}>{formatDateDivider(item.date)}</Text>
          <View style={styles.dateLine} />
        </View>
      );
    }
    const isMine = item.senderId?._id?.toString() === user?._id?.toString()
      || item.senderId?.toString() === user?._id?.toString();
    return (
      <MessageBubble
        msg={item}
        isMine={isMine}
        currentUserId={user?._id?.toString()}
        onLongPress={handleLongPress}
        onReact={handleReact}
        onReply={startReply}
        onVote={handleVote}
        isAdmin={isAdminRef.current}
      />
    );
  };

  const isMineMenu = menuMsg?.senderId?._id?.toString() === user?._id?.toString()
    || menuMsg?.senderId?.toString() === user?._id?.toString();

  const isEditing = Boolean(editingMsg);

  // ─── Typing bubble ────────────────────────────────────
  const TypingIndicator = () => {
    if (!typingUsers.length) return null;
    return (
      <View style={styles.typingRow}>
        <Text style={styles.typingText}>
          {typingUsers[0]}{typingUsers.length > 1 ? ` +${typingUsers.length - 1}` : ''} typing...
        </Text>
        <View style={styles.typingDots}>
          {[0, 1, 2].map((i) => <View key={i} style={[styles.dot, { opacity: 0.3 + i * 0.35 }]} />)}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* ── Custom Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{channelName}</Text>
          <Text style={styles.headerSubtitle}>
            {channelType === 'dm' ? 'Direct Message' : 'Group'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('ChannelInfo', { channelId, channelName })}
        >
          <Ionicons name="information-circle-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="call-outline" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* ── Messages ── */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={listData}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.msgList}
          showsVerticalScrollIndicator={false}
          onStartReached={handleLoadMore}
          onStartReachedThreshold={0.15}
          ListHeaderComponent={
            loadingMore ? (
              <View style={styles.topLoader}>
                <ActivityIndicator size="small" color={COLORS.secondary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyChatText}>No messages yet</Text>
              <Text style={styles.emptyChatSub}>Say hello 👋</Text>
            </View>
          }
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        />
      )}

      {/* ── Typing indicator ── */}
      <TypingIndicator />

      {/* ── Reply Preview Banner ── */}
      {replyTo && !isEditing && (
        <View style={styles.replyBanner}>
          <View style={styles.replyBannerBar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.replyBannerName}>
              {replyTo.senderId?.displayName || 'Unknown'}
            </Text>
            <Text style={styles.replyBannerText} numberOfLines={1}>
              {replyTo.text || `[${replyTo.type}]`}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Edit Banner ── */}
      {isEditing && (
        <View style={[styles.replyBanner, { borderLeftColor: COLORS.accent }]}>
          <View style={[styles.replyBannerBar, { backgroundColor: COLORS.accent }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.replyBannerName, { color: COLORS.accent }]}>Editing message</Text>
            <Text style={styles.replyBannerText} numberOfLines={1}>{editingMsg?.text}</Text>
          </View>
          <TouchableOpacity onPress={() => { setEditingMsg(null); setInputText(''); }}>
            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Attach Drawer ── */}
      {attachOpen && (
        <View style={styles.attachBar}>
          <AttachButton icon="images" label="Gallery" color="#7c3aed" onPress={handlePickMedia} />
          <AttachButton icon="camera" label="Camera" color="#0ea5e9" onPress={handleCamera} />
          <AttachButton icon="mic" label="Voice" color={COLORS.danger} onPress={() => { setAttachOpen(false); Alert.alert('Voice note', 'Hold to record coming soon'); }} />
          <AttachButton icon="bar-chart" label="Poll" color={COLORS.secondary} onPress={() => { setAttachOpen(false); setPollVisible(true); }} />
          <AttachButton icon="location" label="Location" color={COLORS.success} onPress={() => { setAttachOpen(false); Alert.alert('Location share', 'Requires location permission'); }} />
        </View>
      )}

      {/* ── Input Bar ── */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={[styles.attachToggle, attachOpen && { backgroundColor: COLORS.slate800 }]}
          onPress={() => setAttachOpen((v) => !v)}
        >
          <Ionicons name={attachOpen ? 'close' : 'add'} size={22} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.textInput}
            placeholder={isEditing ? 'Edit your message...' : 'Type a message...'}
            placeholderTextColor={COLORS.textLight}
            value={inputText}
            onChangeText={handleTyping}
            multiline
            maxLength={4000}
          />
          {!inputText.trim() && !isEditing && (
            <TouchableOpacity style={styles.emojiBtn} onPress={() => { }}>
              <Ionicons name="happy-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
          onPress={isEditing ? handleEditSubmit : sendTextMessage}
          disabled={!inputText.trim() || sending}
        >
          {sending
            ? <ActivityIndicator size="small" color={COLORS.white} />
            : <Ionicons name={isEditing ? 'checkmark' : 'send'} size={20} color={COLORS.white} />
          }
        </TouchableOpacity>
      </View>

      {/* ── Modals ── */}
      <MessageMenu
        visible={menuVisible}
        msg={menuMsg}
        isMine={isMineMenu}
        isAdmin={isAdminRef.current}
        onClose={() => setMenuVisible(false)}
        onReact={handleReact}
        onEdit={startEdit}
        onDelete={handleDelete}
        onReply={startReply}
      />

      <PollModal
        visible={pollVisible}
        onClose={() => setPollVisible(false)}
        onSubmit={handleSendPoll}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Attach Button helper ─────────────────────────────
const AttachButton = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.attachBtnWrap} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.attachIconCircle, { backgroundColor: color }]}>
      <Ionicons name={icon} size={22} color={COLORS.white} />
    </View>
    <Text style={styles.attachLabel}>{label}</Text>
  </TouchableOpacity>
);

// ══════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF2F6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ── Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8, paddingBottom: 12,
    paddingTop: Platform.OS === 'android'
      ? (StatusBar.currentHeight || 24) + 12
      : 52,
    ...SHADOWS.medium,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  headerInfo: { flex: 1, marginLeft: 4 },
  headerTitle: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: FONTS.sizes.xs, marginTop: 1 },
  headerBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center', borderRadius: 19 },

  // ── Messages list
  msgList: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 16 },
  topLoader: { paddingVertical: 12, alignItems: 'center' },

  // ── Date divider
  dateDivider: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 16, paddingHorizontal: 8,
  },
  dateLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  dateLabel: {
    marginHorizontal: 12, fontSize: FONTS.sizes.xs, color: COLORS.textSecondary,
    fontWeight: '600', backgroundColor: '#EEF2F6', paddingHorizontal: 8,
  },

  // ── Message row
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
  msgRowMine: { flexDirection: 'row-reverse' },
  avatarWrap: { marginRight: 8, marginBottom: 2 },

  // ── Bubble
  bubble: { borderRadius: 18, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, ...SHADOWS.light },
  bubbleOther: { backgroundColor: COLORS.white, borderBottomLeftRadius: 4 },
  bubbleMine: {
    backgroundColor: COLORS.primary, borderBottomRightRadius: 4,
  },
  bubbleDeleted: { backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  deletedText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontStyle: 'italic' },

  senderName: { fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.accent, marginBottom: 4 },
  msgText: { fontSize: FONTS.sizes.sm, color: COLORS.textPrimary, lineHeight: 20 },
  msgTextMine: { color: COLORS.white },
  editedTag: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  msgMeta: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 4,
  },
  msgTime: { fontSize: 10, color: COLORS.textLight },
  msgTimeMine: { color: 'rgba(255,255,255,0.55)' },

  // ── Reply preview inside bubble
  replyPreview: {
    flexDirection: 'row', borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden',
    marginBottom: 4,
  },
  replyPreviewMine: { backgroundColor: 'rgba(255,255,255,0.15)' },
  replyBar: { width: 3, backgroundColor: COLORS.accent },
  replyName: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.accent, paddingHorizontal: 8, paddingTop: 4 },
  replyText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, paddingHorizontal: 8, paddingBottom: 4 },

  // ── System message
  systemMsgWrap: { alignItems: 'center', marginVertical: 10 },
  systemMsg: {
    fontSize: FONTS.sizes.xs, color: COLORS.textSecondary,
    backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 4,
  },

  // ── Reactions
  reactionRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, gap: 4, marginLeft: 4 },
  reactionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 3,
    borderWidth: 1, borderColor: 'transparent',
  },
  reactionChipMine: { borderColor: COLORS.accent, backgroundColor: `${COLORS.accent}18` },
  reactionEmoji: { fontSize: 13 },
  reactionCount: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },

  // ── Media
  mediaGrid: { gap: 4 },
  mediaThumb: { borderRadius: 10, overflow: 'hidden', marginBottom: 4 },
  mediaImg: { width: 220, height: 180, borderRadius: 10, resizeMode: 'cover' },
  videoThumb: { position: 'relative' },
  playOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  // ── Voice note
  voiceNote: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, paddingVertical: 4, minWidth: 180,
  },
  voiceWave: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, height: 28 },
  waveBar: { width: 3, borderRadius: 2, backgroundColor: COLORS.accent },
  voiceDuration: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600' },

  // ── Poll
  pollCard: { minWidth: 220, gap: 8 },
  pollQuestion: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  pollOption: {
    borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border,
    overflow: 'hidden', backgroundColor: COLORS.background,
    marginBottom: 4, minHeight: 38,
  },
  pollOptionVoted: { borderColor: COLORS.accent, backgroundColor: `${COLORS.accent}12` },
  pollBar: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: `${COLORS.accent}18`, borderRadius: 10 },
  pollOptionContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  pollOptionText: { fontSize: FONTS.sizes.sm, color: COLORS.textPrimary, flex: 1 },
  pollPct: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textSecondary },
  pollMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, textAlign: 'right' },

  // ── Location card
  locationCard: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 180 },

  // ── Entity card (stop/journey/reel share)
  entityCard: {
    borderRadius: 12, overflow: 'hidden',
    backgroundColor: COLORS.background, minWidth: 220,
  },
  entityImg: { width: '100%', height: 120, resizeMode: 'cover' },
  entityInfo: { padding: 10, gap: 2 },
  entityType: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase' },
  entityTitle: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary },
  entityMeta: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },

  // ── Expense card
  expenseCard: { flexDirection: 'row', alignItems: 'center', minWidth: 180 },
  expenseAmount: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.warning, marginTop: 2 },

  // ── Empty state
  emptyChat: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyChatText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textSecondary },
  emptyChatSub: { fontSize: FONTS.sizes.md, color: COLORS.textLight },

  // ── Typing indicator
  typingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 18, paddingVertical: 4,
  },
  typingText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontStyle: 'italic' },
  typingDots: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.textSecondary },

  // ── Reply banner
  replyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 8,
    borderLeftWidth: 3, borderLeftColor: COLORS.secondary,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  replyBannerBar: { width: 3, height: '100%', backgroundColor: COLORS.secondary, borderRadius: 2 },
  replyBannerName: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.secondary },
  replyBannerText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },

  // ── Attach bar
  attachBar: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    paddingHorizontal: 16, paddingVertical: 14, gap: 20,
    justifyContent: 'space-around',
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  attachBtnWrap: { alignItems: 'center', gap: 6 },
  attachIconCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', ...SHADOWS.light },
  attachLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600' },

  // ── Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10, paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    gap: 8,
  },
  attachToggle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
  },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: COLORS.background, borderRadius: 22,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 6,
    minHeight: 42, maxHeight: 120,
  },
  textInput: {
    flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary,
    maxHeight: 100, paddingVertical: 4,
  },
  emojiBtn: { justifyContent: 'center', paddingLeft: 8, paddingBottom: 2 },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    marginBottom: 2,
    ...SHADOWS.light,
  },
  sendBtnDisabled: { backgroundColor: COLORS.border },

  // ── Message context menu modal
  menuOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  menuCard: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 32, paddingTop: 16,
  },
  quickReactions: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingBottom: 12 },
  quickEmojiBtn: { padding: 8 },
  quickEmoji: { fontSize: 28 },
  menuDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16, marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 24, paddingVertical: 14 },
  menuItemText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textPrimary },

  // ── Poll modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pollModal: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary },
  pollQuestionInput: {
    fontSize: FONTS.sizes.md, color: COLORS.textPrimary,
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14,
    minHeight: 56, textAlignVertical: 'top',
  },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  optionInput: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: FONTS.sizes.md, color: COLORS.textPrimary,
  },
  addOptionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 4 },
  addOptionText: { fontSize: FONTS.sizes.sm, color: COLORS.accent, fontWeight: '700' },
  multiChoiceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, marginBottom: 14 },
  multiChoiceLabel: { fontSize: FONTS.sizes.md, color: COLORS.textPrimary },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  expiryLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },
  expiryChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
  },
  expiryChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  expiryText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary },
  submitPollBtn: {
    backgroundColor: COLORS.primary, borderRadius: 16,
    paddingVertical: 14, alignItems: 'center',
    ...SHADOWS.medium,
  },
  submitPollText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '800' },
});
