// src/screens/Trip/TripDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LeafletMap from '../../components/map/LeafletMap';
import { COLORS, FONTS } from '../../constants';
import { tripService } from '../../services';

const TABS = ['Overview', 'Itinerary', 'Members', 'Expenses'];

const SAMPLE = {
  _id: '1', destination: 'Manali, Himachal Pradesh',
  startDate: '2025-02-10', endDate: '2025-02-15',
  budget: 15000, status: 'upcoming', maxMembers: 6,
  lat: 32.2432, lng: 77.1892, tripType: 'Adventure',
  description: 'An epic trip to the mountains of Manali. We plan to trek to Solang Valley, visit Rohtang Pass, and enjoy the snow!',
  members: [{ name: 'You', role: 'Organizer' }, { name: 'Priya S.', role: 'Member' }],
  itinerary: [
    { day: 1, plan: 'Arrival + Hotel Check-in + Local market' },
    { day: 2, plan: 'Solang Valley trekking + Snow activities' },
    { day: 3, plan: 'Rohtang Pass + Hadimba Temple' },
    { day: 4, plan: 'River rafting + Vashisht hot springs' },
    { day: 5, plan: 'Mall Road shopping + Departure' },
  ],
};

export default function TripDetailScreen({ navigation, route }) {
  const tripId = route?.params?.tripId;
  const [trip, setTrip]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      const res = await tripService.getTripById(tripId);
      setTrip(res.data?.trip || res.data);
    } catch {
      setTrip(SAMPLE);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>{trip?.destination}</Text>
        <Text style={styles.heroDates}>{trip?.startDate?.slice(0,10)} → {trip?.endDate?.slice(0,10)}</Text>
        <View style={styles.heroBadges}>
          <View style={styles.heroBadge}><Ionicons name="people-outline" size={13} color={COLORS.white} /><Text style={styles.heroBadgeText}> {trip?.members?.length || 0}/{trip?.maxMembers}</Text></View>
          <View style={styles.heroBadge}><Ionicons name="wallet-outline" size={13} color={COLORS.white} /><Text style={styles.heroBadgeText}> ₹{trip?.budget?.toLocaleString('en-IN')}</Text></View>
          <View style={[styles.heroBadge, { backgroundColor: COLORS.success }]}><Text style={styles.heroBadgeText}>{trip?.status}</Text></View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'Overview' && (
          <View>
            <Text style={styles.sectionTitle}>About This Trip</Text>
            <Text style={styles.desc}>{trip?.description}</Text>
            <Text style={styles.sectionTitle}>Location on Map</Text>
            <LeafletMap latitude={trip?.lat || 32.2432} longitude={trip?.lng || 77.1892} zoom={10}
              markers={[{ lat: trip?.lat || 32.2432, lng: trip?.lng || 77.1892, title: trip?.destination, description: 'Trip destination' }]}
              height={200} />
          </View>
        )}
        {activeTab === 'Itinerary' && (
          <View>
            {(trip?.itinerary || []).map(item => (
              <View key={item.day} style={styles.dayCard}>
                <View style={styles.dayBadge}><Text style={styles.dayNum}>Day {item.day}</Text></View>
                <Text style={styles.dayPlan}>{item.plan}</Text>
              </View>
            ))}
            {(!trip?.itinerary || trip.itinerary.length === 0) && (
              <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginTop: 30 }}>No itinerary added yet</Text>
            )}
          </View>
        )}
        {activeTab === 'Members' && (
          <View>
            {(trip?.members || []).map((m, i) => (
              <View key={i} style={styles.memberCard}>
                <View style={styles.memberAvatar}><Text style={styles.memberAvatarText}>{m.name?.charAt(0)}</Text></View>
                <Text style={styles.memberName}>{m.name}</Text>
                <View style={[styles.roleBadge, m.role === 'Organizer' && { backgroundColor: COLORS.secondary }]}>
                  <Text style={styles.roleText}>{m.role}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.inviteBtn}>
              <Ionicons name="person-add-outline" size={18} color={COLORS.primary} />
              <Text style={styles.inviteBtnText}>Invite More Buddies</Text>
            </TouchableOpacity>
          </View>
        )}
        {activeTab === 'Expenses' && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Ionicons name="wallet-outline" size={48} color={COLORS.textLight} />
            <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.base, marginTop: 12 }}>No expenses yet</Text>
            <TouchableOpacity style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10, marginTop: 16 }}
              onPress={() => navigation.navigate('Expenses')}>
              <Text style={{ color: COLORS.white, fontWeight: '700' }}>Go to Expenses</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn: { position: 'absolute', top: 50, left: 16 },
  heroTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white, marginTop: 8 },
  heroDates: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 4, marginBottom: 12 },
  heroBadges: { flexDirection: 'row', gap: 8 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  heroBadgeText: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: '700' },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },
  sectionTitle: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 10, marginTop: 8 },
  desc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 16 },
  dayCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1 },
  dayBadge: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginRight: 12 },
  dayNum: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: '700' },
  dayPlan: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textPrimary, lineHeight: 20 },
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1 },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  memberAvatarText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base },
  memberName: { flex: 1, fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textPrimary },
  roleBadge: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  roleText: { color: COLORS.white, fontSize: FONTS.sizes.xs, fontWeight: '700' },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 12, padding: 14, gap: 8, marginTop: 4 },
  inviteBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.sm },
});
