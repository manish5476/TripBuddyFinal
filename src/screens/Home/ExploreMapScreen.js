// src/screens/Home/ExploreMapScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import LeafletMap from '../../components/map/LeafletMap';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../constants';

const { width, height } = Dimensions.get('window');

export default function ExploreMapScreen({ route }) {
  const navigation = useNavigation();
  const initLat = route?.params?.lat || 22.5;
  const initLng = route?.params?.lng || 80.0;

  // Animation for the pulsing dot
  const pulseAnim = React.useRef(new Animated.Value(0.5)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* ── LIVE LEAFLET MAP (Background) ── */}
      <View style={StyleSheet.absoluteFillObject}>
        <LeafletMap latitude={initLat} longitude={initLng} zoom={5} height="100%" />
      </View>

      {/* ── TOP HEADER: BROADCAST NAV ── */}
      <LinearGradient colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.7)', 'transparent']} style={styles.topGradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <View style={styles.broadcastPill}>
            <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
            <Text style={styles.broadcastText}>BROADCASTING</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── GROUP WATCH PILL ── */}
      <TouchableOpacity style={styles.groupPill} activeOpacity={0.9} onPress={() => console.log('View Companions')}>
        <View style={styles.avatarsRow}>
          <LinearGradient colors={['#f472b6', '#ec4899']} style={styles.miniAvatar}>
            <Text style={styles.miniAvatarText}>P</Text>
          </LinearGradient>
          <LinearGradient colors={[COLORS.accent, '#8b5cf6']} style={[styles.miniAvatar, { marginLeft: -8 }]}>
            <Text style={styles.miniAvatarText}>R</Text>
          </LinearGradient>
        </View>
        <Text style={styles.groupText}>3 in group</Text>
      </TouchableOpacity>

      {/* ── SOS FLOAT ── */}
      <View style={styles.sosContainer}>
        <TouchableOpacity style={styles.sosButton} activeOpacity={0.8} onPress={() => alert('SOS Triggered!')}>
          <Text style={{ fontSize: 22 }}>🆘</Text>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      {/* ── BOTTOM HUD DASHBOARD ── */}
      <View style={styles.hudOverlay}>
        <View style={styles.hudHandle} />

        <View style={{ padding: SPACING.lg, paddingBottom: SPACING.xxl + 80 }}>
          {/* Title Row */}
          <View style={styles.hudTitleRow}>
            <View>
              <Text style={styles.hudTitle}>Journey Active</Text>
              <Text style={styles.hudSubtitle}><Text style={{ fontWeight: '800' }}>1</Text> Stops · <Text style={{ fontWeight: '800' }}>--</Text> Elapsed</Text>
            </View>
            <View style={styles.hudIconBadge}>
              <Text style={{ fontSize: 24 }}>📍</Text>
            </View>
          </View>

          {/* Scrollable Actions */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionScrollRow}>
            <TouchableOpacity style={[styles.actionChip, { backgroundColor: COLORS.accent50, borderColor: COLORS.textLight }]}>
              <Text style={{ fontSize: 14 }}>💬</Text>
              <Text style={[styles.actionChipText, { color: COLORS.accent }]}>Group Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionChip, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
              <Text style={{ fontSize: 14 }}>🍱</Text>
              <Text style={[styles.actionChipText, { color: '#b45309' }]}>Utilities</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionChip, { backgroundColor: COLORS.background, borderColor: COLORS.border }]}>
              <Text style={{ fontSize: 14 }}>⛶</Text>
              <Text style={[styles.actionChipText, { color: COLORS.textSecondary }]}>Fit Map</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Primary Bottom Actions */}
          <View style={styles.bottomButtonsRow}>
            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={() => navigation.navigate('CreateTrip')}>
              <Text style={{ fontSize: 20 }}>📍</Text>
              <Text style={styles.primaryBtnText}>Log Stop</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.endBtn} activeOpacity={0.85} onPress={() => navigation.navigate('Home')}>
              <Text style={{ fontSize: 18 }}>🏁</Text>
              <Text style={styles.endBtnText}>End</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Top Navigation
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 140, paddingTop: 50, paddingHorizontal: 20, zIndex: 10, pointerEvents: 'box-none' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto' },
  backBtn: { width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  broadcastPill: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger },
  broadcastText: { color: COLORS.danger, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  // Group Pill
  groupPill: { position: 'absolute', top: 110, right: 16, backgroundColor: 'rgba(255,255,255,0.95)', borderWidth: 1, borderColor: COLORS.secondary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5, zIndex: 10 },
  avatarsRow: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  miniAvatarText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  groupText: { fontSize: 10, fontWeight: '800', color: '#ea580c' }, // brand-600

  // SOS Float
  sosContainer: { position: 'absolute', left: 16, top: height / 2 - 28, zIndex: 10 },
  sosButton: { width: 56, height: 56, backgroundColor: COLORS.danger, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fca5a5', shadowColor: COLORS.danger, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  sosText: { color: COLORS.white, fontSize: 9, fontWeight: '800', marginTop: 2, letterSpacing: 1 },

  // Bottom HUD
  hudOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20, zIndex: 10 },
  hudHandle: { width: 40, height: 5, backgroundColor: COLORS.border, borderRadius: 3, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  hudTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  hudTitle: { fontSize: 22, fontWeight: '800', color: COLORS.slate900, fontFamily: 'Outfit_700Bold' },
  hudSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  hudIconBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.brand50, justifyContent: 'center', alignItems: 'center' },

  actionScrollRow: { gap: 8, paddingBottom: 20 },
  actionChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  actionChipText: { fontSize: 12, fontWeight: '700' },

  bottomButtonsRow: { flexDirection: 'row', gap: 12 },
  primaryBtn: { flex: 1, backgroundColor: COLORS.slate900, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: COLORS.slate900, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  primaryBtnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '800' },
  endBtn: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 16, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 6 },
  endBtnText: { color: COLORS.danger, fontSize: FONTS.sizes.md, fontWeight: '800' },
});
