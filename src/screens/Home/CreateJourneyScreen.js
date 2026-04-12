// src/screens/Home/CreateJourneyScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Header from '../../components/common/Header';
import { COLORS, FONTS, SHADOWS } from '../../constants';
import { journeyService } from '../../services/api/journey.service';

const VISIBILITY_OPTIONS = ['public', 'friends', 'private'];
const PRESET_EMOJIS = ['🚴', '🚗', '🏃', '✈️', '🏍️', '🚢'];

export default function CreateJourneyScreen({ navigation }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emoji: '🚗',
    tags: '',
    visibility: 'friends',
    startLocationName: '',
    startLat: null,
    startLng: null,
    endLocationName: '',
    broadcastDelayMinutes: '0',
    showOnLiveGlobe: true,
  });

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    // Automatically fetch location on mount to reduce user clicks
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to auto-fill your starting point.');
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;

      // Reverse geocoding for a friendly name
      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      let locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`; // Fallback
      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        locationName = [place.city, place.region, place.country].filter(Boolean).join(', ');
      }

      setFormData(prev => ({
        ...prev,
        startLat: latitude,
        startLng: longitude,
        startLocationName: locationName,
      }));
    } catch (error) {
      console.log('Error fetching location:', error);
      Alert.alert('Error', 'Could not fetch your current location automatically.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.startLocationName) {
      Alert.alert('Missing Fields', 'Please provide at least a title and start location.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        emoji: formData.emoji,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        visibility: formData.visibility,
        startLocationName: formData.startLocationName,
        startLat: formData.startLat,
        startLng: formData.startLng,
        endLocationName: formData.endLocationName,
        broadcastDelayMinutes: parseInt(formData.broadcastDelayMinutes) || 0,
        showOnLiveGlobe: formData.showOnLiveGlobe,
      };

      await journeyService.createJourney(payload);
      Alert.alert('Journey Started! 🚀', 'Your journey is now live.', [
        { text: 'Awesome', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to start journey.');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="Start Journey" onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Journey Details</Text>
            
            <View style={styles.inputWrap}>
              <Ionicons name="text-outline" size={20} color={COLORS.textSecondary} style={styles.icon} />
              <TextInput style={styles.input} placeholder="Journey Title (e.g. Evening Ride)"
                placeholderTextColor={COLORS.textLight} value={formData.title} onChangeText={(val) => updateForm('title', val)} />
            </View>

            <View style={[styles.inputWrap, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
              <Ionicons name="chatbox-outline" size={20} color={COLORS.textSecondary} style={styles.icon} />
              <TextInput style={[styles.input, { textAlignVertical: 'top' }]} placeholder="Description (sunset vibes 🌇)"
                placeholderTextColor={COLORS.textLight} value={formData.description} multiline onChangeText={(val) => updateForm('description', val)} />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
              <Text style={styles.label}>Emoji Icon: </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginLeft: 10 }}>
                {PRESET_EMOJIS.map(emj => (
                  <TouchableOpacity key={emj} onPress={() => updateForm('emoji', emj)}
                    style={[styles.emojiWrap, formData.emoji === emj && styles.emojiWrapActive]}>
                    <Text style={styles.emojiText}>{emj}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="pricetag-outline" size={20} color={COLORS.textSecondary} style={styles.icon} />
              <TextInput style={styles.input} placeholder="Tags (comma separated, e.g. ride, fun)"
                placeholderTextColor={COLORS.textLight} value={formData.tags} onChangeText={(val) => updateForm('tags', val)} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>Location</Text>
              {locationLoading ? (
                <ActivityIndicator size="small" color={COLORS.secondary} />
              ) : (
                <TouchableOpacity onPress={fetchCurrentLocation} style={styles.refreshLocBtn}>
                  <Ionicons name="locate" size={16} color={COLORS.secondary} />
                  <Text style={styles.refreshLocText}>Auto-Locate</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="location" size={20} color={COLORS.danger} style={styles.icon} />
              <TextInput style={styles.input} placeholder="Start Location"
                placeholderTextColor={COLORS.textLight} value={formData.startLocationName} onChangeText={(val) => updateForm('startLocationName', val)} />
            </View>
            <View style={styles.inputWrap}>
              <Ionicons name="flag-outline" size={20} color={COLORS.textSecondary} style={styles.icon} />
              <TextInput style={styles.input} placeholder="Destination (Optional)"
                placeholderTextColor={COLORS.textLight} value={formData.endLocationName} onChangeText={(val) => updateForm('endLocationName', val)} />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <Text style={styles.label}>Visibility</Text>
            <View style={styles.chips}>
              {VISIBILITY_OPTIONS.map(opt => (
                <TouchableOpacity key={opt} style={[styles.chip, formData.visibility === opt && styles.chipActive]}
                  onPress={() => updateForm('visibility', opt)}>
                  <Text style={[styles.chipText, formData.visibility === opt && styles.chipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.label, { marginTop: 16 }]}>Delay (Mins)</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="timer-outline" size={18} color={COLORS.textSecondary} style={styles.icon} />
                  <TextInput style={styles.input} placeholder="0" keyboardType="numeric"
                    placeholderTextColor={COLORS.textLight} value={formData.broadcastDelayMinutes} onChangeText={(val) => updateForm('broadcastDelayMinutes', val)} />
                </View>
              </View>
              <View style={{ flex: 1, paddingLeft: 8, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={[styles.label, { marginTop: 16 }]}>Live Globe</Text>
                <Switch 
                  value={formData.showOnLiveGlobe} 
                  onValueChange={(val) => updateForm('showOnLiveGlobe', val)} 
                  trackColor={{ false: COLORS.border, true: COLORS.secondary }}
                  thumbColor={COLORS.white}
                  style={{ marginTop: 8 }}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={[styles.createBtn, loading && { opacity: 0.7 }]}
            onPress={handleCreate} disabled={loading} activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.createBtnText}>Start Journey</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary, paddingVertical: 12 },
  emojiWrap: { padding: 10, borderRadius: 12, backgroundColor: COLORS.background, marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  emojiWrapActive: { borderColor: COLORS.secondary, backgroundColor: COLORS.brand50 },
  emojiText: { fontSize: 24 },
  refreshLocBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.brand50, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  refreshLocText: { color: COLORS.secondary, fontSize: FONTS.sizes.xs, fontWeight: '700', marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'capitalize' },
  chipTextActive: { color: COLORS.white },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondary, borderRadius: 16, padding: 16, marginTop: 8, gap: 10, ...SHADOWS.glow },
  createBtnText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '800' },
});
