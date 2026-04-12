// src/screens/Chat/ChatListScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import Header from '../../components/common/Header';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { channelService } from '../../services';

export default function ChatListScreen() {
  const navigation = useNavigation();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'dm' | 'group'

  const loadChannels = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const params = filter !== 'all' ? { type: filter } : {};
      const res = await channelService.getMyChannels(params);
      setChannels(res?.data || []);
    } catch (err) {
      console.log('Channel list error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  // Reload every time screen comes into focus
  useFocusEffect(useCallback(() => { loadChannels(); }, [loadChannels]));

  const handleNewDM = () => navigation.navigate('FindBuddies');
  const handleNewGroup = () => navigation.navigate('CreateGroup');

  const getChannelName = (ch) => {
    if (ch.type === 'dm') return ch.otherParticipant?.displayName || 'Direct Message';
    return ch.name || 'Group';
  };

  const getChannelAvatar = (ch) => {
    if (ch.type === 'dm') return ch.otherParticipant?.displayName?.charAt(0)?.toUpperCase() || '?';
    return (ch.name || 'G').charAt(0).toUpperCase();
  };

  const getLastMessagePreview = (ch) => {
    if (!ch.lastMessage?.text && !ch.lastMessage?.type) return 'No messages yet';
    if (ch.lastMessage?.type === 'image') return '📷 Photo';
    if (ch.lastMessage?.type === 'video') return '🎥 Video';
    if (ch.lastMessage?.type === 'voice') return '🎤 Voice message';
    if (ch.lastMessage?.type === 'system') return '📢 System update';
    return ch.lastMessage?.text || '';
  };

  const filtered = channels.filter(ch => {
    const name = getChannelName(ch).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const renderChannel = ({ item }) => {
    const isGroup = item.type === 'group';
    const name = getChannelName(item);
    const initial = getChannelAvatar(item);
    const preview = getLastMessagePreview(item);
    const unread = item.myUnreadCount || 0;
    const time = item.lastMessage?.sentAt ? moment(item.lastMessage.sentAt).fromNow(true) : '';

    return (
      <TouchableOpacity
        style={styles.channelItem}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ChatRoom', { channelId: item._id, channelName: name, channelType: item.type })}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: isGroup ? '#7c3aed' : COLORS.secondary }]}>
          {item.avatarUrl
            ? null
            : <Text style={styles.avatarText}>{initial}</Text>
          }
          {isGroup && (
            <View style={styles.groupBadge}>
              <Ionicons name="people" size={8} color={COLORS.white} />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.channelInfo}>
          <View style={styles.topRow}>
            <Text style={[styles.channelName, unread > 0 && styles.channelNameUnread]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={[styles.timeText, unread > 0 && { color: COLORS.secondary }]}>{time}</Text>
          </View>
          <View style={styles.bottomRow}>
            <Text style={[styles.previewText, unread > 0 && styles.previewUnread]} numberOfLines={1}>
              {preview}
            </Text>
            {unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unread > 99 ? '99+' : unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Messages"
        onMenuPress={() => navigation.getParent?.('DrawerNav')?.openDrawer?.() || navigation.dispatch(DrawerActions.openDrawer())}
        rightComponent={
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={styles.headerBtn} onPress={handleNewGroup}>
              <Ionicons name="people-outline" size={22} color={COLORS.slate900} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={handleNewDM}>
              <Ionicons name="create-outline" size={22} color={COLORS.slate900} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {['all', 'dm', 'group'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => { setFilter(f); setLoading(true); }}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? '💬 All' : f === 'dm' ? '👤 DMs' : '👥 Groups'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.secondary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={c => c._id}
          renderItem={renderChannel}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadChannels(true)} colors={[COLORS.secondary]} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptySubtitle}>Start a DM or create a group!</Text>
              <TouchableOpacity style={styles.startChatBtn} onPress={handleNewDM}>
                <Ionicons name="add" size={18} color={COLORS.white} />
                <Text style={styles.startChatText}>Start a Chat</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 12, marginBottom: 4, borderRadius: 16, paddingHorizontal: 14, height: 44, gap: 10, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.light },
  searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.slate900 },

  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  filterTabActive: { backgroundColor: COLORS.slate900, borderColor: COLORS.slate900 },
  filterText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.white },

  channelItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.white },
  avatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: 14, position: 'relative' },
  avatarText: { color: COLORS.white, fontWeight: '800', fontSize: 18 },
  groupBadge: { position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.white },

  channelInfo: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  channelName: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.slate900, flex: 1, marginRight: 8 },
  channelNameUnread: { fontWeight: '800' },
  timeText: { fontSize: 11, color: COLORS.textLight, fontWeight: '600' },
  previewText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginRight: 8 },
  previewUnread: { color: COLORS.slate800, fontWeight: '600' },
  unreadBadge: { backgroundColor: COLORS.secondary, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  unreadText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },

  separator: { height: 1, backgroundColor: COLORS.border, marginLeft: 82 },

  emptyState: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.slate900, marginTop: 12 },
  emptySubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  startChatBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.secondary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 16, ...SHADOWS.glow },
  startChatText: { color: COLORS.white, fontWeight: '800', fontSize: FONTS.sizes.md },
});
