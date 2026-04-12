// src/screens/Trip/MyTripsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Header from '../../components/common/Header';
import { COLORS, FONTS } from '../../constants';
import { tripService } from '../../services';

const STATUS_COLORS = { upcoming: COLORS.secondary, active: COLORS.success, completed: COLORS.textSecondary };

const SAMPLE_TRIPS = [
  { _id: '1', destination: 'Manali, Himachal Pradesh', startDate: '2025-02-10', endDate: '2025-02-15', members: [1,2,3], maxMembers: 6, budget: 15000, status: 'upcoming' },
  { _id: '2', destination: 'Goa',                     startDate: '2025-03-01', endDate: '2025-03-07', members: [1,2,3,4,5], maxMembers: 8, budget: 22000, status: 'active' },
  { _id: '3', destination: 'Rishikesh',               startDate: '2025-01-05', endDate: '2025-01-08', members: [1,2], maxMembers: 4, budget: 8000,  status: 'completed' },
];

export default function MyTripsScreen() {
  const navigation = useNavigation();
  const [trips, setTrips]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrips = useCallback(async () => {
    try {
      const res = await tripService.getMyTrips();
      setTrips(res.data?.trips || []);
    } catch {
      setTrips(SAMPLE_TRIPS); // fallback to sample data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadTrips(); }, []);

  const onRefresh = () => { setRefreshing(true); loadTrips(); };

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="My Trips" onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="My Trips" onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        rightIcon="add" onRightPress={() => navigation.navigate('CreateTrip')} />
      <FlatList
        data={trips}
        keyExtractor={i => i._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Ionicons name="airplane-outline" size={60} color={COLORS.textLight} />
            <Text style={{ color: COLORS.textSecondary, marginTop: 12, fontSize: FONTS.sizes.base }}>No trips yet</Text>
            <TouchableOpacity style={{ marginTop: 16, backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}
              onPress={() => navigation.navigate('CreateTrip')}>
              <Text style={{ color: COLORS.white, fontWeight: '700' }}>Create Your First Trip</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TripDetail', { tripId: item._id })} activeOpacity={0.8}>
            <View style={styles.cardTop}>
              <View style={styles.iconWrap}><Ionicons name="airplane" size={22} color={COLORS.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dest}>{item.destination}</Text>
                <Text style={styles.dates}>{item.startDate?.slice(0,10)} → {item.endDate?.slice(0,10)}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || COLORS.textSecondary }]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.cardBottom}>
              <Text style={styles.meta}><Ionicons name="people-outline" size={13} /> {item.members?.length || 0}/{item.maxMembers} members</Text>
              <Text style={styles.meta}><Ionicons name="wallet-outline" size={13} /> ₹{item.budget?.toLocaleString('en-IN')}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: `${COLORS.primary}15`, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  dest: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.textPrimary },
  dates: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: '700', textTransform: 'capitalize' },
  cardBottom: { flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  meta: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
});
