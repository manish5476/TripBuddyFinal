// src/screens/Chat/ChannelInfoScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../components/common/Header';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { channelService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const MUTE_OPTIONS = [
  { label: 'Unmute', hours: 0 },
  { label: '1 hour', hours: 1 },
  { label: '8 hours', hours: 8 },
  { label: '24 hours', hours: 24 },
];

export default function ChannelInfoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { channelId } = route.params || {};
  const { user: me } = useAuth();

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [muteLoading, setMuteLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [showMuteOptions, setShowMuteOptions] = useState(false);

  useEffect(() => { fetchChannel(); }, [channelId]);

  const fetchChannel = async () => {
    try {
      const res = await channelService.getChannel(channelId);
      setChannel(res?.data || null);
    } catch (err) {
      Alert.alert('Error', 'Failed to load channel info.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const myMember = channel?.members?.find(m => m.userId?._id === me?._id || m.userId === me?._id);
  const isAdmin = ['owner', 'admin'].includes(myMember?.role);
  const isMuted = myMember?.isMuted;
  const memberCount = channel?.totalMemberCount || 0;

  const handleMute = async (hours) => {
    setShowMuteOptions(false);
    setMuteLoading(true);
    try {
      await channelService.muteChannel(channelId, { hours });
      Alert.alert('Success', hours > 0 ? `Muted for ${hours}h` : 'Unmuted');
      fetchChannel();
    } catch { Alert.alert('Error', 'Could not update mute settings.'); }
    finally { setMuteLoading(false); }
  };

  const handleLeave = () => {
    Alert.alert(
      'Leave Channel',
      `Are you sure you want to leave "${channel?.name || 'this chat'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave', style: 'destructive',
          onPress: async () => {
            setLeaveLoading(true);
            try {
              await channelService.leaveChannel(channelId);
              navigation.navigate('Chats');
            } catch { Alert.alert('Error', 'Could not leave channel.'); }
            finally { setLeaveLoading(false); }
          },
        },
      ]
    );
  };

  const handleKickMember = async (userId, displayName) => {
    Alert.alert('Remove Member', `Remove ${displayName} from this group?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await channelService.removeMember(channelId, userId);
            fetchChannel();
          } catch { Alert.alert('Error', 'Could not remove member.'); }
        },
      },
    ]);
  };

  const handleMarkRead = async () => {
    try {
      await channelService.markAllRead(channelId, { seq: 0 });
      Alert.alert('Done', 'Marked all messages as read.');
    } catch {}
  };

  if (loading) return (
    <View style={styles.container}>
      <Header title="Channel Info" onBackPress={() => navigation.goBack()} />
      <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.secondary} /></View>
    </View>
  );

  const isGroup = channel?.type === 'group';
  const members = channel?.members?.filter(m => m.status === 'active') || [];

  return (
    <View style={styles.container}>
      <Header title={isGroup ? 'Group Info' : 'Chat Info'} onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Channel identity hero */}
        <LinearGradient colors={isGroup ? ['#7c3aed', '#4f46e5'] : [COLORS.secondary, '#ec4899']} style={styles.hero}>
          <View style={styles.heroAvatar}>
            <Ionicons name={isGroup ? 'people' : 'person'} size={40} color={COLORS.white} />
          </View>
          <Text style={styles.heroName}>{channel?.name || 'Direct Message'}</Text>
          {isGroup && <Text style={styles.heroCounts}>{memberCount} members</Text>}
          {channel?.description ? <Text style={styles.heroDesc}>{channel.description}</Text> : null}
        </LinearGradient>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBlock} onPress={() => navigation.navigate('ChatRoom', { channelId })}>
            <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary }]}>
              <Ionicons name="chatbubble" size={22} color={COLORS.white} />
            </View>
            <Text style={styles.actionLabel}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBlock} onPress={() => setShowMuteOptions(p => !p)} disabled={muteLoading}>
            <View style={[styles.actionIcon, { backgroundColor: isMuted ? COLORS.slate900 : COLORS.background, borderWidth: 1, borderColor: COLORS.border }]}>
              <Ionicons name={isMuted ? 'notifications-off' : 'notifications-outline'} size={22} color={isMuted ? COLORS.white : COLORS.slate900} />
            </View>
            <Text style={styles.actionLabel}>{isMuted ? 'Muted' : 'Mute'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBlock} onPress={handleMarkRead}>
            <View style={[styles.actionIcon, { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border }]}>
              <Ionicons name="checkmark-done-outline" size={22} color={COLORS.slate900} />
            </View>
            <Text style={styles.actionLabel}>Mark Read</Text>
          </TouchableOpacity>
        </View>

        {/* Mute options */}
        {showMuteOptions && (
          <View style={styles.muteOptions}>
            {MUTE_OPTIONS.map(opt => (
              <TouchableOpacity key={opt.hours} style={styles.muteOption} onPress={() => handleMute(opt.hours)}>
                <Ionicons name={opt.hours === 0 ? 'notifications' : 'notifications-off'} size={18} color={COLORS.secondary} />
                <Text style={styles.muteOptionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Members list (groups only) */}
        {isGroup && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Members ({memberCount})</Text>
            {members.map(member => {
              const u = member.userId;
              const displayName = typeof u === 'object' ? (u?.displayName || u?.username) : 'Member';
              const userId = typeof u === 'object' ? u?._id : u;
              const isMe = userId === me?._id;
              const roleLabel = member.role === 'owner' ? '👑' : member.role === 'admin' ? '🛡️' : null;

              return (
                <View key={userId} style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{displayName?.charAt(0)?.toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>
                      {displayName} {roleLabel} {isMe ? '(You)' : ''}
                    </Text>
                    <Text style={styles.memberRole}>{member.role}</Text>
                  </View>
                  {isAdmin && !isMe && (
                    <TouchableOpacity onPress={() => handleKickMember(userId, displayName)}>
                      <Ionicons name="remove-circle-outline" size={22} color={COLORS.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Danger zone */}
        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleLeave} disabled={leaveLoading}>
            {leaveLoading
              ? <ActivityIndicator size="small" color={COLORS.danger} />
              : <><Ionicons name="exit-outline" size={20} color={COLORS.danger} />
                  <Text style={styles.dangerText}>Leave {isGroup ? 'Group' : 'Chat'}</Text></>
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 60 },

  hero: { alignItems: 'center', padding: 32, gap: 8 },
  heroAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)', marginBottom: 8 },
  heroName: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  heroCounts: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  heroDesc: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 4 },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.white, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  actionBlock: { alignItems: 'center', gap: 8 },
  actionIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', ...SHADOWS.light },
  actionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },

  muteOptions: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 12, borderRadius: 20, padding: 8, ...SHADOWS.light, borderWidth: 1, borderColor: COLORS.border },
  muteOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14 },
  muteOptionText: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.slate900 },

  section: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 16, borderRadius: 24, padding: 20, ...SHADOWS.light, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.slate900, marginBottom: 16 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  memberAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center' },
  memberAvatarText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  memberName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.slate900 },
  memberRole: { fontSize: 11, color: COLORS.textSecondary, textTransform: 'capitalize' },

  dangerSection: { marginHorizontal: 16, marginTop: 24 },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.danger, backgroundColor: `${COLORS.danger}10` },
  dangerText: { color: COLORS.danger, fontWeight: '800', fontSize: FONTS.sizes.md },
});
