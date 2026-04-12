// src/screens/Trip/CreateStopScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../components/common/Header';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { stopService } from '../../services';

// ── Canonical Transport Modes — MUST match backend TRANSPORT_MODES enum ──
const MODES = [
  // Road
  { id: 'car', icon: 'car', label: 'Car' },
  { id: 'motorcycle', icon: 'bicycle', label: 'Bike' },
  { id: 'auto_rickshaw', icon: 'car-sport', label: 'Auto' },
  { id: 'taxi_rideshare', icon: 'car-outline', label: 'Cab' },
  { id: 'bus', icon: 'bus', label: 'Bus' },
  { id: 'ev_scooter', icon: 'flash', label: 'EV Scooter' },
  { id: 'bicycle', icon: 'bicycle-outline', label: 'Cycle' },
  // Rail
  { id: 'train', icon: 'train', label: 'Train' },
  { id: 'metro', icon: 'subway', label: 'Metro' },
  { id: 'tram', icon: 'train-outline', label: 'Tram' },
  { id: 'monorail', icon: 'options', label: 'Monorail' },
  // Air
  { id: 'flight', icon: 'airplane', label: 'Flight' },
  { id: 'helicopter', icon: 'hardware-chip', label: 'Helicopter' },
  // Water
  { id: 'ferry', icon: 'boat', label: 'Ferry' },
  { id: 'cruise', icon: 'business', label: 'Cruise' },
  // Foot / Specialty
  { id: 'walk', icon: 'walk', label: 'Walk' },
  { id: 'horse', icon: 'paw', label: 'Horse' },
  { id: 'cable_car', icon: 'radio-button-on', label: 'Cable Car' },
  { id: 'ev_car', icon: 'battery-charging', label: 'EV Car' },
  { id: 'shared_cab', icon: 'people', label: 'Shared Cab' },
  { id: 'other', icon: 'flag', label: 'Other' },
];

export default function CreateStopScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { journeyId } = route.params || {};

  const [caption, setCaption] = useState('');
  const [transportMode, setTransportMode] = useState('car');
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('Fetching location...');

  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(true);

  // Auto-fetch location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationName('Location permission denied');
          setGpsLoading(false);
          return;
        }

        const currentLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({ lat: currentLoc.coords.latitude, lng: currentLoc.coords.longitude });

        const [address] = await Location.reverseGeocodeAsync({
          latitude: currentLoc.coords.latitude,
          longitude: currentLoc.coords.longitude,
        });

        if (address) {
          setLocationName(`${address.city || address.subregion || ''}, ${address.region || ''}`.replace(/^, /, ''));
        } else {
          setLocationName('Unknown Location');
        }
      } catch (err) {
        setLocationName('Could not fetch location');
      } finally {
        setGpsLoading(false);
      }
    })();
  }, []);

  const handlePickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your gallery to add photos!');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreateStop = async () => {
    if (!journeyId) {
      Alert.alert('Error', 'No active journey ID found.');
      return;
    }
    if (!location?.lat || !location?.lng) {
      Alert.alert('Error', 'Valid location coordinates are required.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('journeyId', journeyId);
      formData.append('transportMode', transportMode);
      formData.append('lat', String(location.lat));
      formData.append('lng', String(location.lng));
      formData.append('caption', caption);
      formData.append('locationName', locationName);

      // Add optional media
      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // Append as a file to the media array (Multer syntax: media)
        formData.append('media', { uri: imageUri, name: filename, type });
      }

      await stopService.createStop(formData);
      Alert.alert('Success', 'Stop logged successfully on your journey map!');
      navigation.goBack();
    } catch (err) {
      console.log('Stop create error:', err);
      Alert.alert('Error', 'Failed to log the stop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Log New Stop" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Memory Media Upload */}
        <TouchableOpacity style={styles.imageBox} activeOpacity={0.8} onPress={handlePickMedia}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <LinearGradient colors={[COLORS.brand50, '#ffedd5']} style={styles.imagePlaceholder}>
              <View style={styles.iconCircle}>
                <Ionicons name="camera" size={32} color={COLORS.secondary} />
              </View>
              <Text style={styles.imageMsg}>Tap to add a photo or video</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <View style={styles.iconBox}><Ionicons name="location" size={20} color={COLORS.secondary} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>CURRENT LOCATION</Text>
              {gpsLoading ? <ActivityIndicator size="small" color={COLORS.secondary} style={{ alignSelf: 'flex-start' }} />
                : <Text style={styles.locationText}>{locationName}</Text>}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldRow}>
            <View style={styles.iconBox}><Ionicons name="bicycle" size={20} color={COLORS.success} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>HOW ARRIVED</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.modesRow}>
                  {MODES.map((m) => (
                    <TouchableOpacity key={m.id} style={[styles.modeBtn, transportMode === m.id && styles.modeBtnActive]} onPress={() => setTransportMode(m.id)}>
                      <Ionicons name={m.icon} size={16} color={transportMode === m.id ? COLORS.white : COLORS.textSecondary} />
                      <Text style={[styles.modeBtnLabel, transportMode === m.id && styles.modeBtnLabelActive]}>{m.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={[styles.fieldRow, { alignItems: 'flex-start' }]}>
            <View style={styles.iconBox}><Ionicons name="chatbubble-ellipses" size={20} color={COLORS.blue500} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>CAPTION</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Write something memorable..."
                placeholderTextColor={COLORS.textLight}
                multiline
                value={caption}
                onChangeText={setCaption}
              />
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleCreateStop} disabled={loading || gpsLoading} activeOpacity={0.9}>
          {loading ? <ActivityIndicator color={COLORS.white} /> : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
              <Text style={styles.submitText}>Save Stop</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, paddingBottom: 100 },

  imageBox: { height: 220, borderRadius: 24, overflow: 'hidden', marginBottom: 24, ...SHADOWS.light, borderWidth: 1, borderColor: COLORS.border },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: 12, ...SHADOWS.glow },
  imageMsg: { color: COLORS.secondary, fontWeight: '700', fontSize: FONTS.sizes.sm },

  card: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20, ...SHADOWS.light, borderWidth: 1, borderColor: COLORS.border },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 10, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 4 },
  locationText: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.slate900 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },

  modesRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  modeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  modeBtnActive: { backgroundColor: COLORS.slate900, borderColor: COLORS.slate900 },
  modeBtnLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  modeBtnLabelActive: { color: COLORS.white },

  textArea: { fontSize: FONTS.sizes.md, color: COLORS.slate900, minHeight: 80, textAlignVertical: 'top' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  submitBtn: { flexDirection: 'row', backgroundColor: COLORS.secondary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', ...SHADOWS.glow },
  submitText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '800' }
});
