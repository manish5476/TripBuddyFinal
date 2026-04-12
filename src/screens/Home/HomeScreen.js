// src/screens/Home/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../constants';
import { journeyService } from '../../services';
import moment from 'moment';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      const res = await journeyService.listPublicJourneys();
      setJourneys(res.data || []);
    } catch (err) {
      console.log('Error fetching feed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchJourneys();
  };

  const renderFeedItem = ({ item }) => {
    const isLive = item.status === 'active';
    const authorInit = item.ownerId?.displayName ? item.ownerId.displayName.charAt(0).toUpperCase() : 'U';

    return (
      <View style={styles.feedCard}>
        <TouchableOpacity style={styles.mapGraphic} activeOpacity={0.9} onPress={() => navigation.navigate('JourneyDetail', { journeyId: item._id })}>
          <View style={styles.gridOverlay} />

          <View style={styles.mapHeaderRow}>
            {isLive && (
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            <View style={styles.trainTag}>
              <Text style={styles.trainText}>{item.emoji || '📍'} {(item.title || 'Journey').toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.trajectoryContainer}>
            <View style={styles.trajectoryLine} />
            <View style={styles.trajectoryDotStart} />
            {isLive && <View style={styles.trajectoryDotCurrent} />}
          </View>
        </TouchableOpacity>

        <View style={styles.feedContent}>
          <View style={styles.feedHeaderRow}>
            {item.ownerId?.avatarUrl ? (
              <Image source={{ uri: item.ownerId.avatarUrl }} style={styles.authorAvatar} />
            ) : (
              <LinearGradient colors={[COLORS.secondary, '#f43f5e']} style={styles.authorAvatar}>
                <Text style={styles.authorInit}>{authorInit}</Text>
              </LinearGradient>
            )}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.authorName}>{item.ownerId?.displayName || 'Unknown Traveler'}</Text>
                {item.ownerId?.isVerified && <Ionicons name="checkmark-circle" size={14} color={COLORS.accent} />}
              </View>
              <Text style={styles.feedMeta}>{moment(item.createdAt).fromNow()} · 📍 {item.startLocationName} {item.endLocationName ? `→ ${item.endLocationName}` : ''}</Text>
            </View>
          </View>

          <Text style={styles.feedText}>{item.description}</Text>

          {item.tags && item.tags.length > 0 && (
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {item.tags.map((tag, idx) => (
                <View key={idx} style={styles.tagPill}>
                  <Text style={styles.tagPillText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.feedActions}>
            <View style={styles.actionsLeft}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="heart-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.actionBtnText}>{item.analytics?.totalReactions || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.actionBtnText}>{item.analytics?.totalComments || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="eye-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.actionBtnText}>{item.analytics?.totalViews || 0}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.mapJumpBtn} onPress={() => navigation.navigate('ExploreMap', { lat: item.startCoordinates?.coordinates?.[1], lng: item.startCoordinates?.coordinates?.[0] })}>
              <Text style={styles.mapJumpText}>Map ↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const ListHeader = () => (
    <View>
      {/* ── STORIES ROW ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesContainer}>
        <TouchableOpacity style={styles.storyItem} activeOpacity={0.7} onPress={() => navigation.navigate('CreateTrip')}>
          <View style={styles.addStopCircle}>
            <Ionicons name="add" size={28} color={COLORS.textLight} />
          </View>
          <Text style={styles.storyLabel}>Add Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.storyItem} activeOpacity={0.7} onPress={() => navigation.navigate('ExploreMap')}>
          <View style={[styles.storyRing, { borderColor: COLORS.secondary }]}>
            <View style={styles.storyInner}>
              <Text style={styles.storyEmoji}>🚂</Text>
            </View>
          </View>
          <Text style={[styles.storyLabel, { color: COLORS.secondary, fontWeight: '700' }]}>LIVE</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.storyItem} activeOpacity={0.7}>
          <View style={[styles.storyRing, { borderColor: COLORS.border }]}>
            <View style={[styles.storyInner, { backgroundColor: COLORS.background }]}>
              <Text style={styles.storyEmoji}>✈️</Text>
            </View>
          </View>
          <Text style={styles.storyLabel}>Priya</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.divider} />

      {/* ── COMPANION CALLOUT ── */}
      <TouchableOpacity style={styles.companionBox} activeOpacity={0.9} onPress={() => navigation.navigate('ExploreMap')}>
        <LinearGradient colors={[COLORS.slate800, COLORS.slate900]} style={styles.companionGradient}>
          <View style={styles.companionIconBadge}>
            <Text style={{ fontSize: 24 }}>👥</Text>
          </View>
          <View style={styles.companionTextCol}>
            <Text style={styles.companionTitle}>3 Travelers Nearby · Surat</Text>
            <Text style={styles.companionDesc}>@priya, @rohan, @arjun heading your way</Text>
          </View>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>New</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>FEED</Text>
          <Text style={styles.headerTitle}>Discover</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.chatIconBtn} onPress={() => navigation.navigate('Chat')}>
            <Ionicons name="chatbubble-outline" size={30} color={COLORS.textLight} />
            <View style={styles.chatBadge} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.getParent('DrawerNav')?.openDrawer?.() || navigation.dispatch(DrawerActions.openDrawer())} activeOpacity={0.8}>
            <LinearGradient colors={[COLORS.secondary, '#ec4899']} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>M</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      ) : (
        <FlatList
          data={journeys}
          keyExtractor={(item) => item._id}
          renderItem={renderFeedItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.secondary} />}
          initialNumToRender={5}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 40, marginHorizontal: SPACING.lg, backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginTop: 20 }}>
              <Ionicons name="compass-outline" size={48} color={COLORS.textLight} />
              <Text style={{ marginTop: 12, fontSize: FONTS.sizes.md, color: COLORS.textSecondary, fontWeight: '600' }}>No public journeys at the moment.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl + 20, paddingBottom: SPACING.md },
  headerSubtitle: { fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 28, fontFamily: 'Outfit_700Bold', fontWeight: '800', color: COLORS.slate900 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  chatIconBtn: { position: 'relative' },
  chatBadge: { position: 'absolute', top: -2, right: -4, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.danger, borderWidth: 2, borderColor: COLORS.background },
  avatarGradient: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  avatarText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '800' },

  // Stories
  scrollArea: { flex: 1 },
  storiesContainer: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: 20 },
  storyItem: { alignItems: 'center', gap: 6 },
  addStopCircle: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.textLight, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  storyRing: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, padding: 3 },
  storyInner: { width: '100%', height: '100%', borderRadius: 34, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  storyEmoji: { fontSize: 28 },
  storyLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },

  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.lg, marginVertical: SPACING.md },

  // Companion Callout
  companionBox: { marginHorizontal: SPACING.lg, marginBottom: SPACING.xl, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  companionGradient: { borderRadius: 20, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: COLORS.secondary },
  companionIconBadge: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(249, 115, 22, 0.15)', borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.3)', justifyContent: 'center', alignItems: 'center' },
  companionTextCol: { flex: 1 },
  companionTitle: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '800', marginBottom: 2 },
  companionDesc: { color: COLORS.textLight, fontSize: 10 },
  newBadge: { backgroundColor: COLORS.secondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  newBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },

  // Feed Area
  feedFeed: { paddingHorizontal: SPACING.md },
  feedCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 4, marginHorizontal: SPACING.md, ...SHADOWS.light, marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.border },
  mapGraphic: { height: 160, backgroundColor: COLORS.background, borderRadius: 20, padding: 12, position: 'relative', overflow: 'hidden' },
  gridOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.5 }, // Can implement SVG grid here or use a faint pattern
  mapHeaderRow: { flexDirection: 'row', gap: 8 },
  liveTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.brand50, borderWidth: 1, borderColor: '#ffedd5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Object.keys(COLORS).includes('danger') ? COLORS.danger : 'red' },
  liveText: { color: Object.keys(COLORS).includes('danger') ? COLORS.danger : 'red', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  trainTag: { backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  trainText: { color: COLORS.slate800, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  trajectoryContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  trajectoryLine: { height: 2, backgroundColor: COLORS.secondary, width: '100%', borderStyle: 'dashed', borderRadius: 1 },
  trajectoryDotStart: { position: 'absolute', left: 20, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.slate800 },
  trajectoryDotCurrent: { position: 'absolute', left: '60%', width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.secondary, borderWidth: 3, borderColor: COLORS.white, ...SHADOWS.glow },

  feedContent: { padding: SPACING.md, paddingTop: SPACING.lg },
  feedHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  authorAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  authorInit: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '800' },
  authorName: { color: COLORS.slate900, fontSize: FONTS.sizes.md, fontWeight: '800' },
  feedMeta: { color: COLORS.textSecondary, fontSize: 10, marginTop: 2 },

  feedText: { color: COLORS.slate800, fontSize: FONTS.sizes.md, lineHeight: 22, fontWeight: '500', marginBottom: SPACING.md },

  feedActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionsLeft: { flexDirection: 'row', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4 },
  actionBtnText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  mapJumpBtn: { backgroundColor: COLORS.brand50, borderWidth: 1, borderColor: '#ffedd5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  mapJumpText: { color: COLORS.secondary, fontSize: 12, fontWeight: '800' },
  tagPill: { backgroundColor: COLORS.slate900, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagPillText: { color: COLORS.textLight, fontSize: 10, fontWeight: '600' }
});
