// src/screens/Trip/MyJourneysScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import Header from '../../components/common/Header';
import { COLORS, FONTS, SHADOWS } from '../../constants';
import { journeyService } from '../../services';

const STATUS_COLORS = {
  active: COLORS.success,
  completed: COLORS.textSecondary,
  planned: COLORS.secondary
};

export default function MyJourneysScreen() {
  const navigation = useNavigation();
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJourneys = useCallback(async () => {
    try {
      const res = await journeyService.getMyJourneys();
      setJourneys(res.data || []);
    } catch (err) {
      console.log('Error fetching my journeys:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadJourneys(); }, [loadJourneys]);
  const onRefresh = () => { setRefreshing(true); loadJourneys(); };
  if (loading) return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="My Journeys" onBackPress={() => navigation.goBack()} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="My Journeys" onBackPress={() => navigation.goBack()}
        rightIcon="add" onRightPress={() => navigation.navigate('CreateJourney')} />

      <FlatList
        data={journeys}
        keyExtractor={i => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.secondary]} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <LinearGradient colors={[COLORS.brand50, '#ffedd5']} style={styles.emptyCircle}>
              <Ionicons name="compass-outline" size={60} color={COLORS.secondary} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No Journeys Yet</Text>
            <Text style={styles.emptyDesc}>Start your first live journey and share it with friends!</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('CreateJourney')}>
              <Text style={styles.emptyBtnText}>Start Journey</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('JourneyDetail', { journeyId: item._id })} activeOpacity={0.9}>
            <View style={styles.cardTop}>
              <View style={styles.iconWrap}>
                <Text style={{ fontSize: 24 }}>{item.emoji || '📍'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.dates}>{moment(item.startTime || item.createdAt).format('MMM D, YYYY')} • {item.startLocationName}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || COLORS.textSecondary }]}>
                {item.status === 'active' && <View style={styles.liveDot} />}
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>

            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {item.tags.map((t, i) => (
                  <View key={i} style={styles.tagPill}><Text style={styles.tagText}>#{t}</Text></View>
                ))}
              </View>
            )}

            <View style={styles.cardBottom}>
              <View style={styles.statCol}>
                <Ionicons name="footsteps-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.meta}>{item.analytics?.totalDistanceKm || 0} km</Text>
              </View>
              <View style={styles.statCol}>
                <Ionicons name="heart-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.meta}>{item.analytics?.totalReactions || 0}</Text>
              </View>
              <View style={styles.statCol}>
                <Ionicons name="eye-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.meta}>{item.analytics?.totalViews || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, marginBottom: 16, ...SHADOWS.light, borderWidth: 1, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  title: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.slate900, marginBottom: 4 },
  dates: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600' },

  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.white },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tagPill: { backgroundColor: COLORS.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  tagText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700' },

  cardBottom: { flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  statCol: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: FONTS.sizes.sm, color: COLORS.slate800, fontWeight: '600' },

  emptyWrap: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 20 },
  emptyCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 20, ...SHADOWS.glow },
  emptyTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.slate900, marginBottom: 8 },
  emptyDesc: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.secondary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, ...SHADOWS.glow },
  emptyBtnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '800' }
});
