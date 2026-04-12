// src/screens/Buddy/BuddyProfileScreen.js
// Triggering Fast Refresh to clear cache
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../../constants';
import { userService, reelService, channelService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');
const GRID_SIZE = width / 3;

export default function BuddyProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user: currentUser } = useAuth();
  const rawUsername = route.params?.username || route.params?.buddy?.username;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followProcessing, setFollowProcessing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [dmLoading, setDmLoading] = useState(false);

  // Media Grid
  const [media, setMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'reels'

  useEffect(() => {
    if (!rawUsername) {
      setLoading(false);
      return;
    }
    loadProfile();
  }, [rawUsername]);

  const loadProfile = async () => {
    try {
      const res = await userService.getUser(rawUsername);
      const userObj = res.data; // Safely unpack the user JSON schema
      setProfile(userObj);
      setIsFollowing(userObj.isFollowing || false);

      // Once profile ID is known, async fetch media grid!
      if (userObj._id) {
        fetchUserMedia(userObj._id);
      } else {
        setLoadingMedia(false);
      }
    } catch (err) {
      console.error('Failed to load profile:', err?.response?.data || err.message);
      setLoadingMedia(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMedia = async (userId) => {
    try {
      const res = await reelService.getUserReels(userId, { limit: 12 });
      setMedia(res?.data || []);
    } catch (err) {
      // Endpoint likely empty or restricted, fallback to empty array safely
      setMedia([]);
    } finally {
      setLoadingMedia(false);
    }
  };

  const toggleFollow = async () => {
    if (!profile) return;
    setFollowProcessing(true);
    try {
      if (isFollowing) {
        await userService.unfollow(profile._id);
        setIsFollowing(false);
        setProfile(prev => ({ ...prev, followerCount: Math.max(0, prev.followerCount - 1) }));
      } else {
        await userService.follow(profile._id);
        setIsFollowing(true);
        setProfile(prev => ({ ...prev, followerCount: prev.followerCount + 1 }));
      }
    } catch (err) {
      console.error('Action failed:', err?.response?.data || err.message);
    } finally {
      setFollowProcessing(false);
    }
  };

  // ── Start / Open a DM with this user ─────────────
  const startDM = async () => {
    if (!profile?._id || dmLoading) return;
    setDmLoading(true);
    try {
      const res = await channelService.createOrGetDM({ recipientId: profile._id });
      const channel = res?.data;
      if (!channel?._id) throw new Error('No channel returned');
      navigation.navigate('ChatRoom', {
        channelId: channel._id,
        channelName: profile.displayName || profile.username,
        channelType: 'dm',
      });
    } catch (err) {
      console.error('DM error:', err?.response?.data || err.message);
      Alert.alert('Could not open chat', err?.message || 'Please try again');
    } finally {
      setDmLoading(false);
    }
  };

  const showProfileOptions = () => {
    if (profile.isOwn) return;

    Alert.alert(
      profile.username,
      'Profile Options',
      [
        {
          text: isBlocked ? 'Unblock User' : 'Block User',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isBlocked) {
                await userService.unblockUser(profile._id);
                setIsBlocked(false);
                Alert.alert('Unblocked', `You have unblocked ${profile.displayName}`);
              } else {
                await userService.blockUser(profile._id);
                setIsBlocked(true);
                Alert.alert('Blocked', `${profile.displayName} has been blocked.`);
              }
            } catch (err) {
              console.error('Block action failed', err);
              Alert.alert('Error', 'Could not complete the action. Please try again.');
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.slate900} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }]}>
        <Ionicons name="person-outline" size={64} color={COLORS.textLight} />
        <Text style={styles.errorTitle}>User Not Found</Text>
        <TouchableOpacity style={styles.backBtnWrapper} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── HEADER NAVBAR ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={26} color={COLORS.slate900} />
        </TouchableOpacity>
        <Text style={styles.headerUsername}>{profile.username}</Text>
        <TouchableOpacity onPress={showProfileOptions} activeOpacity={0.7} style={styles.headerIcon}>
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.slate900} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── AVATAR & STATS ROW ── */}
        <View style={styles.profileRow}>
          <View style={styles.avatarContainer}>
            {profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{profile.displayName?.charAt(0) || 'U'}</Text>
              </View>
            )}
            {/* Mocking the little bottom-right creator badge if applicable */}
            {profile.isCreator && (
              <View style={styles.creatorBadge}>
                <Ionicons name="star" size={10} color={COLORS.white} />
              </View>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statCount}>{profile.journeyCount || 0}</Text>
              <Text style={styles.statLabel}>posts</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statCount}>{profile.followerCount || 0}</Text>
              <Text style={styles.statLabel}>followers</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statCount}>{profile.followingCount || 0}</Text>
              <Text style={styles.statLabel}>following</Text>
            </View>
          </View>
        </View>

        {/* ── BIO SECTION ── */}
        <View style={styles.bioContainer}>
          <Text style={styles.bioName}>{profile.displayName}</Text>
          {profile.bio ? <Text style={styles.bioDesc}>{profile.bio}</Text> : null}
          {profile.creatorBio && profile.isCreator ? <Text style={styles.bioDesc}>{profile.creatorBio}</Text> : null}

          {(profile.homeCity || profile.websiteUrl) && (
            <View style={styles.bioMeta}>
              {profile.homeCity && (
                <View style={styles.metaBadge}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.metaBadgeText}>{profile.homeCity}</Text>
                </View>
              )}
              {profile.websiteUrl && (
                <TouchableOpacity style={styles.metaBadge}>
                  <Ionicons name="link-outline" size={14} color={COLORS.accent} />
                  <Text style={[styles.metaBadgeText, { color: COLORS.accent }]}>{profile.websiteUrl}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* ── ACTIONS ROW ── */}
        {!profile.isOwn && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.mainCta, isFollowing && styles.followingCta]}
              activeOpacity={0.8}
              onPress={toggleFollow}
              disabled={followProcessing}
            >
              {followProcessing ? (
                <ActivityIndicator color={isFollowing ? COLORS.slate900 : COLORS.white} size="small" />
              ) : (
                <Text style={[styles.mainCtaText, isFollowing && styles.followingCtaText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCta}
              activeOpacity={0.8}
              onPress={startDM}
              disabled={dmLoading}
            >
              {dmLoading
                ? <ActivityIndicator size="small" color={COLORS.slate900} />
                : <Text style={styles.secondaryCtaText}>Message</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconCta} activeOpacity={0.8}>
              <Ionicons name="person-add-outline" size={18} color={COLORS.slate900} />
            </TouchableOpacity>
          </View>
        )}

        {profile.isOwn && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.secondaryCta, { flex: 1, paddingHorizontal: 0 }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.secondaryCtaText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryCta, { flex: 1, paddingHorizontal: 0 }]}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryCtaText}>Share Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── MEDIA TABS ── */}
        <View style={styles.tabsRow}>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'grid' && styles.activeTabItem]} onPress={() => setActiveTab('grid')}>
            <Ionicons name="grid-outline" size={24} color={activeTab === 'grid' ? COLORS.slate900 : COLORS.textLight} />
          </TouchableOpacity>
          {profile.isCreator && (
            <TouchableOpacity style={[styles.tabItem, activeTab === 'reels' && styles.activeTabItem]} onPress={() => setActiveTab('reels')}>
              <Ionicons name="play-circle-outline" size={28} color={activeTab === 'reels' ? COLORS.slate900 : COLORS.textLight} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.tabItem, activeTab === 'tags' && styles.activeTabItem]} onPress={() => setActiveTab('tags')}>
            <Ionicons name="pricetag-outline" size={24} color={activeTab === 'tags' ? COLORS.slate900 : COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* ── MEDIA GRID ── */}
        {loadingMedia ? (
          <View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator color={COLORS.textLight} /></View>
        ) : media.length > 0 ? (
          <View style={styles.gridContainer}>
            {media.map((item, index) => (
              <TouchableOpacity key={item._id || index} style={styles.gridItem}>
                <Image source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/150' }} style={{ width: '100%', height: '100%' }} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyGridContainer}>
            <View style={styles.emptyGridRing}>
              <Ionicons name="camera-outline" size={48} color={COLORS.textPrimary} />
            </View>
            <Text style={styles.emptyGridTitle}>No Posts Yet</Text>
            <Text style={styles.emptyGridSub}>When {profile.username} posts journeys or reels, they'll appear here.</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  errorTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.slate900, marginTop: 16 },
  backBtnWrapper: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.slate900, borderRadius: 20 },
  backBtnText: { color: COLORS.white, fontWeight: '700' },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 60, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white },
  headerIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerUsername: { fontSize: 16, fontWeight: '700', color: COLORS.slate900 },

  // Abstracted Profile Top Area
  profileRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },

  // Avatar Group
  avatarContainer: { position: 'relative', marginRight: 24 },
  avatarImg: { width: 84, height: 84, borderRadius: 42, borderWidth: 1, borderColor: COLORS.border },
  avatarFallback: { width: 84, height: 84, borderRadius: 42, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  avatarFallbackText: { fontSize: 32, fontWeight: '800', color: COLORS.slate800 },
  creatorBadge: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.secondary, borderWidth: 2, borderColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },

  // Stats Group
  statsContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingRight: 10 },
  statBox: { alignItems: 'center' },
  statCount: { fontSize: 18, fontWeight: '700', color: COLORS.slate900 },
  statLabel: { fontSize: 13, color: COLORS.slate800 },

  // Bio Section
  bioContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  bioName: { fontSize: 14, fontWeight: '700', color: COLORS.slate900 },
  bioDesc: { fontSize: 14, color: COLORS.slate800, marginTop: 2, lineHeight: 20 },
  bioMeta: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 12 },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaBadgeText: { fontSize: 14, color: COLORS.textSecondary },

  // Actions
  actionsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  mainCta: { flex: 1, backgroundColor: COLORS.secondary, borderRadius: 8, paddingVertical: 8, justifyContent: 'center', alignItems: 'center' },
  followingCta: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  mainCtaText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },
  followingCtaText: { color: COLORS.slate900 },

  secondaryCta: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  secondaryCtaText: { color: COLORS.slate900, fontSize: 14, fontWeight: '700' },
  iconCta: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, width: 36, justifyContent: 'center', alignItems: 'center' },

  // Tabs
  tabsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 8 },
  tabItem: { flex: 1, height: 48, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'transparent' },
  activeTabItem: { borderBottomColor: COLORS.slate900 },

  // Media Grid (Responsive)
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: GRID_SIZE, height: GRID_SIZE, borderWidth: 0.5, borderColor: COLORS.white },

  // Empty State
  emptyGridContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyGridRing: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: COLORS.slate900, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyGridTitle: { fontSize: 22, fontWeight: '800', color: COLORS.slate900, marginBottom: 8 },
  emptyGridSub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
});
