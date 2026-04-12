// src/screens/Trip/JourneyDetailScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import Header from '../../components/common/Header';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { journeyService } from '../../services';

// Mock Action Modal (In a real app, use bottom sheets or proper modals)
export default function JourneyDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { journeyId } = route.params || {};

  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSegmentInput, setShowSegmentInput] = useState(false);
  const [segmentMode, setSegmentMode] = useState('train');

  const fetchJourneyDetails = useCallback(async () => {
    if (!journeyId) return;
    try {
      const res = await journeyService.getJourney(journeyId);
      // Backend returns: { data: { journey, stopCount, liveSession } }
      setJourney(res.data?.journey || res.data || null);
    } catch (err) {
      console.log('Error fetching journey:', err);
      Alert.alert('Error', 'Failed to load journey details.');
      if (!journey) navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [journeyId]);

  useEffect(() => {
    fetchJourneyDetails();
  }, [fetchJourneyDetails]);

  // API Action: End Journey
  const handleEndJourney = async () => {
    Alert.alert('End Journey', 'Are you sure you want to officially end this journey?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End Journey', style: 'destructive', onPress: async () => {
        setActionLoading(true);
        try {
          // Sending coordinates could be dynamic here
          await journeyService.endJourney(journeyId, {
            endLat: 21.1702, endLng: 72.8311, endLocationName: 'Surat (Destination)'
          });
          Alert.alert('Success', 'Journey ended successfully! Wrap Card generated.');
          fetchJourneyDetails();
        } catch (e) {
          Alert.alert('Error', 'Could not end the journey.');
        } finally {
          setActionLoading(false);
        }
      }}
    ]);
  };

  // API Action: Toggle Ghost Mode
  const handleToggleGhostMode = async () => {
    setActionLoading(true);
    try {
      await journeyService.toggleGhostMode(journeyId);
      Alert.alert('Ghost Mode', `Ghost mode is now ${!journey.isGhostMode ? 'ON' : 'OFF'}`);
      fetchJourneyDetails();
    } catch (e) {
      Alert.alert('Error', 'Could not toggle ghost mode.');
    } finally {
      setActionLoading(false);
    }
  };

  // API Action: Add Transport Segment
  const handleAddSegment = async () => {
    if (!showSegmentInput) {
      setShowSegmentInput(true);
      return;
    }
    setActionLoading(true);
    try {
      await journeyService.addTransportSegment(journeyId, {
        mode: segmentMode,
        startLocationName: 'Current Stop',
        endLocationName: 'Next Destination',
      });
      setShowSegmentInput(false);
      Alert.alert('Success', 'Transport segment successfully added!');
      fetchJourneyDetails();
    } catch (e) {
      Alert.alert('Error', 'Could not add transport segment.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <View style={styles.container}>
      <Header title="Journey Details" onBackPress={() => navigation.goBack()} />
      <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.secondary} /></View>
    </View>
  );

  if (!journey) return (
    <View style={styles.container}>
      <Header title="Not Found" onBackPress={() => navigation.goBack()} />
      <View style={styles.centered}><Text style={{color: COLORS.danger}}>Journey not found</Text></View>
    </View>
  );

  const isActive = journey.status === 'active';

  return (
    <View style={styles.container}>
      <Header title={journey.title} onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Mock Map Header */}
        <View style={styles.mapArea}>
          <LinearGradient colors={['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.3)']} style={styles.mapGradient}>
            <Ionicons name="map" size={80} color="rgba(59, 130, 246, 0.4)" />
            <View style={styles.mapPin}>
               <Text style={styles.emojiPin}>{journey.emoji || '📍'}</Text>
            </View>
            <View style={styles.trajectory} />
          </LinearGradient>
          
          <View style={styles.mapOverlayInfo}>
            <View style={styles.statusBadge}>
              {isActive && <View style={styles.liveDot} />}
              <Text style={styles.statusText}>{journey.status.toUpperCase()}</Text>
            </View>
            {journey.isGhostMode && (
              <View style={[styles.statusBadge, { backgroundColor: COLORS.slate900, marginLeft: 8 }]}>
                <Ionicons name="ghost" size={12} color={COLORS.white} style={{ marginRight: 4 }} />
                <Text style={styles.statusText}>GHOST MODE</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Main Info */}
          <Text style={styles.routeText}>{journey.startLocationName}   {journey.endLocationName ? `→   ${journey.endLocationName}` : ''}</Text>
          <Text style={styles.descText}>{journey.description}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaDates}><Ionicons name="calendar-outline" size={14}/> {moment(journey.startTime).format('LLL')}</Text>
            <View style={styles.visPill}><Text style={styles.visText}>{journey.visibility}</Text></View>
          </View>

          {/* Quick Actions Panel */}
          {isActive && (
            <View style={styles.actionsPanel}>
              <Text style={styles.sectionTitle}>Live Controls</Text>
              
              <View style={styles.actionGrid}>
                {/* Create Stop */}
                <TouchableOpacity style={styles.actionBlock} activeOpacity={0.8} onPress={() => navigation.navigate('CreateStop', { journeyId })}>
                   <View style={[styles.actionIconBox, { backgroundColor: COLORS.success }]}>
                     <Ionicons name="camera" size={24} color={COLORS.white} />
                   </View>
                   <Text style={styles.actionLabel}>Log Stop</Text>
                </TouchableOpacity>

                {/* Timeline */}
                <TouchableOpacity style={styles.actionBlock} activeOpacity={0.8} onPress={() => navigation.navigate('JourneyTimeline', { journeyId, journeyTitle: journey.title })}>
                   <View style={[styles.actionIconBox, { backgroundColor: COLORS.secondary }]}>
                     <Ionicons name="git-commit" size={24} color={COLORS.white} />
                   </View>
                   <Text style={styles.actionLabel}>Timeline</Text>
                </TouchableOpacity>

                {/* Ghost Mode */}
                <TouchableOpacity style={styles.actionBlock} activeOpacity={0.8} onPress={handleToggleGhostMode} disabled={actionLoading}>
                   <View style={[styles.actionIconBox, { backgroundColor: journey.isGhostMode ? COLORS.slate900 : COLORS.background }]}>
                     <Ionicons name="ghost" size={24} color={journey.isGhostMode ? COLORS.white : COLORS.slate900} />
                   </View>
                   <Text style={styles.actionLabel}>Ghost Mode</Text>
                </TouchableOpacity>

                {/* Add Friend */}
                <TouchableOpacity style={styles.actionBlock} activeOpacity={0.8} disabled={actionLoading} onPress={() => Alert.alert('Add Co-Traveller', 'Would hit /co-travellers API')}>
                   <View style={[styles.actionIconBox, { backgroundColor: COLORS.background }]}>
                     <Ionicons name="person-add" size={24} color={COLORS.secondary} />
                   </View>
                   <Text style={styles.actionLabel}>Add Buddy</Text>
                </TouchableOpacity>
              </View>

              {/* Segment Input Prompt */}
              {showSegmentInput && (
                <View style={styles.promptBox}>
                  <Text style={styles.promptText}>Select new transport mode:</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    {['train', 'flight', 'bus', 'car'].map(m => (
                      <TouchableOpacity key={m} style={[styles.modePill, segmentMode === m && styles.modePillActive]} onPress={() => setSegmentMode(m)}>
                         <Text style={[styles.modeText, segmentMode === m && { color: COLORS.white }]}>{m.toUpperCase()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.submitBtn} onPress={handleAddSegment} disabled={actionLoading}>
                    <Text style={styles.submitBtnText}>Confirm Segment</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* End Journey */}
              <TouchableOpacity style={styles.endBtn} activeOpacity={0.9} onPress={handleEndJourney} disabled={actionLoading}>
                {actionLoading ? <ActivityIndicator color={COLORS.white} /> : (
                  <>
                    <Ionicons name="stop-circle" size={20} color={COLORS.white} />
                    <Text style={styles.endBtnText}>END JOURNEY</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Analytics Overview */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Analytics Summary</Text>
          <View style={styles.statsCard}>
             <View style={styles.statBox}>
                <Ionicons name="eye" size={24} color={COLORS.secondary} />
                <Text style={styles.statVal}>{journey.analytics?.totalViews || 0}</Text>
                <Text style={styles.statLbl}>Views</Text>
             </View>
             <View style={styles.statDiv} />
             <View style={styles.statBox}>
                <Ionicons name="heart" size={24} color={COLORS.danger} />
                <Text style={styles.statVal}>{journey.analytics?.totalReactions || 0}</Text>
                <Text style={styles.statLbl}>Reactions</Text>
             </View>
             <View style={styles.statDiv} />
             <View style={styles.statBox}>
                <Ionicons name="footsteps" size={24} color={COLORS.success} />
                <Text style={styles.statVal}>{journey.analytics?.totalDistanceKm || 0}</Text>
                <Text style={styles.statLbl}>Km Logged</Text>
             </View>
          </View>
          
          {/* Post-Journey actions mapping */}
          {!isActive && (
            <TouchableOpacity style={styles.wrapBtn} activeOpacity={0.9} onPress={() => Alert.alert('Travelogue', 'Generate AI Narrative endpoint triggered!')}>
              <LinearGradient colors={['#ec4899', '#8b5cf6']} style={styles.wrapGradient} start={{x:0, y:0}} end={{x:1, y:1}}>
                <Ionicons name="sparkles" size={24} color={COLORS.white} />
                <View style={{ marginLeft: 16 }}>
                  <Text style={styles.wrapTitle}>View Wrap Card</Text>
                  <Text style={styles.wrapSub}>AI generated travelogue & narrative</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  mapArea: { height: 260, position: 'relative' },
  mapGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapPin: { position: 'absolute', top: 100, backgroundColor: COLORS.white, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', ...SHADOWS.glow, zIndex: 2 },
  emojiPin: { fontSize: 32 },
  trajectory: { position: 'absolute', top: 130, left: '20%', right: '20%', height: 4, backgroundColor: COLORS.secondary, borderStyle: 'dashed', borderRadius: 2, zIndex: 1 },
  mapOverlayInfo: { position: 'absolute', bottom: 16, left: 16, flexDirection: 'row' },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, ...SHADOWS.light },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.white, marginRight: 6 },
  statusText: { color: COLORS.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  content: { padding: SPACING.lg, marginTop: -20, backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  routeText: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.slate900, marginBottom: 8 },
  descText: { fontSize: FONTS.sizes.md, color: COLORS.slate800, lineHeight: 24, marginBottom: 16 },
  
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  metaDates: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },
  visPill: { backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  visText: { color: COLORS.secondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.slate900, marginBottom: 16 },
  
  actionsPanel: { backgroundColor: COLORS.white, borderRadius: 24, padding: SPACING.lg, ...SHADOWS.light, borderWidth: 1, borderColor: COLORS.border },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  actionBlock: { alignItems: 'center', gap: 8 },
  actionIconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  actionLabel: { fontSize: 12, fontWeight: '700', color: COLORS.slate800 },
  
  promptBox: { backgroundColor: COLORS.background, padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: COLORS.secondary },
  promptText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.slate900 },
  modePill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  modePillActive: { backgroundColor: COLORS.slate900, borderColor: COLORS.slate900 },
  modeText: { fontSize: 10, fontWeight: '800', color: COLORS.slate800 },
  submitBtn: { backgroundColor: COLORS.secondary, marginTop: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: COLORS.white, fontWeight: '800' },

  endBtn: { flexDirection: 'row', backgroundColor: COLORS.danger, paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8, ...SHADOWS.glow },
  endBtnText: { color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: '800', letterSpacing: 1 },

  statsCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 24, padding: 20, ...SHADOWS.light, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'space-between', alignItems: 'center' },
  statBox: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 22, fontWeight: '800', color: COLORS.slate900, marginTop: 8, marginBottom: 2 },
  statLbl: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  statDiv: { width: 1, height: 40, backgroundColor: COLORS.border },

  wrapBtn: { marginTop: 24, borderRadius: 20, overflow: 'hidden', ...SHADOWS.glow },
  wrapGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  wrapTitle: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '800', marginBottom: 4 },
  wrapSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' }
});
