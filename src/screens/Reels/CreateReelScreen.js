// src/screens/Reels/CreateReelScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../components/common/Header';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { reelService } from '../../services';

const VISIBILITY_OPTIONS = [
  { value: 'public',  label: 'Public',  icon: 'globe-outline',    desc: 'Anyone can see this reel' },
  { value: 'friends', label: 'Friends', icon: 'people-outline',   desc: 'Only your followers' },
  { value: 'private', label: 'Private', icon: 'lock-closed-outline', desc: 'Only you' },
];

export default function CreateReelScreen() {
  const navigation = useNavigation();

  const [videoUri, setVideoUri] = useState(null);
  const [thumbnailUri, setThumbnailUri] = useState(null);
  const [caption, setCaption] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [visibility, setVisibility] = useState('public');
  const [isOriginalAudio, setIsOriginalAudio] = useState(true);
  const [audioName, setAudioName] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your gallery to pick a video!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.85,
      videoMaxDuration: 180,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handlePickThumbnail = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setThumbnailUri(result.assets[0].uri);
    }
  };

  const handleAddHashtag = () => {
    const tag = hashtagInput.trim().toLowerCase().replace(/^#/, '');
    if (!tag) return;
    if (hashtags.includes(tag)) { setHashtagInput(''); return; }
    if (hashtags.length >= 10) { Alert.alert('Limit', 'Max 10 hashtags.'); return; }
    setHashtags(prev => [...prev, tag]);
    setHashtagInput('');
  };

  const handleRemoveHashtag = (tag) => setHashtags(prev => prev.filter(h => h !== tag));

  const handleSubmit = async () => {
    if (!videoUri) { Alert.alert('Required', 'Please pick a video first!'); return; }

    setLoading(true);
    try {
      const formData = new FormData();

      // Video file
      const videoFilename = videoUri.split('/').pop();
      formData.append('video', { uri: videoUri, name: videoFilename, type: 'video/mp4' });

      // Optional thumbnail
      if (thumbnailUri) {
        const thumbFilename = thumbnailUri.split('/').pop();
        const ext = /\.(\w+)$/.exec(thumbFilename)?.[1] || 'jpg';
        formData.append('thumbnail', { uri: thumbnailUri, name: thumbFilename, type: `image/${ext}` });
      }

      formData.append('caption', caption);
      formData.append('hashtags', hashtags.join(','));
      formData.append('visibility', visibility);
      formData.append('isOriginalAudio', String(isOriginalAudio));
      if (!isOriginalAudio && audioName) formData.append('audioName', audioName);

      await reelService.createReel(formData);
      Alert.alert('🎉 Published!', 'Your reel is live!', [
        { text: 'View Feed', onPress: () => navigation.navigate('ReelFeed') },
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.log('Reel upload error:', err);
      Alert.alert('Error', 'Failed to publish reel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="New Reel" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Video Picker */}
        <TouchableOpacity style={styles.videoBox} activeOpacity={0.8} onPress={handlePickVideo}>
          {videoUri ? (
            <View style={styles.videoPreview}>
              <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
              <Text style={styles.videoPickedText}>Video selected ✓</Text>
              <Text style={styles.videoSubText}>Tap to change</Text>
            </View>
          ) : (
            <LinearGradient colors={['#1e1e2e', '#2d1b69']} style={styles.videoPickerContent}>
              <View style={styles.uploadCircle}>
                <Ionicons name="videocam" size={36} color={COLORS.white} />
              </View>
              <Text style={styles.uploadTitle}>Pick a Video</Text>
              <Text style={styles.uploadSub}>Max 3 minutes · MP4 / MOV</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>

        {/* Thumbnail (optional) */}
        {videoUri && (
          <TouchableOpacity style={styles.thumbnailRow} onPress={handlePickThumbnail}>
            {thumbnailUri
              ? <Image source={{ uri: thumbnailUri }} style={styles.thumbnailPreview} />
              : <View style={styles.thumbnailPlaceholder}><Ionicons name="image-outline" size={22} color={COLORS.textSecondary} /></View>
            }
            <View>
              <Text style={styles.thumbnailLabel}>Custom Thumbnail</Text>
              <Text style={styles.thumbnailSub}>{thumbnailUri ? 'Tap to change' : 'Optional — we auto-generate one'}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Caption */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>CAPTION</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Tell your story... 🗺️"
            placeholderTextColor={COLORS.textLight}
            multiline
            maxLength={500}
            value={caption}
            onChangeText={setCaption}
          />
          <Text style={styles.charCount}>{caption.length}/500</Text>
        </View>

        {/* Hashtags */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>HASHTAGS</Text>
          <View style={styles.hashtagInputRow}>
            <TextInput
              style={styles.hashtagInput}
              placeholder="#travel"
              placeholderTextColor={COLORS.textLight}
              value={hashtagInput}
              onChangeText={setHashtagInput}
              onSubmitEditing={handleAddHashtag}
              returnKeyType="done"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.addTagBtn} onPress={handleAddHashtag}>
              <Ionicons name="add" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          {hashtags.length > 0 && (
            <View style={styles.tagChips}>
              {hashtags.map(tag => (
                <TouchableOpacity key={tag} style={styles.tagChip} onPress={() => handleRemoveHashtag(tag)}>
                  <Text style={styles.tagChipText}>#{tag}</Text>
                  <Ionicons name="close" size={12} color={COLORS.secondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Audio */}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View>
              <Text style={styles.fieldLabel}>ORIGINAL AUDIO</Text>
              <Text style={styles.fieldSub}>Toggle off to add audio credit</Text>
            </View>
            <Switch
              value={isOriginalAudio}
              onValueChange={setIsOriginalAudio}
              trackColor={{ false: COLORS.border, true: COLORS.secondary }}
              thumbColor={COLORS.white}
            />
          </View>
          {!isOriginalAudio && (
            <TextInput
              style={[styles.hashtagInput, { marginTop: 12 }]}
              placeholder="Song / audio name..."
              value={audioName}
              onChangeText={setAudioName}
              placeholderTextColor={COLORS.textLight}
            />
          )}
        </View>

        {/* Visibility */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>VISIBILITY</Text>
          {VISIBILITY_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.visibilityOption, visibility === opt.value && styles.visibilityOptionActive]}
              onPress={() => setVisibility(opt.value)}
            >
              <Ionicons name={opt.icon} size={22} color={visibility === opt.value ? COLORS.secondary : COLORS.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.visLabel, visibility === opt.value && { color: COLORS.secondary }]}>{opt.label}</Text>
                <Text style={styles.visDesc}>{opt.desc}</Text>
              </View>
              {visibility === opt.value && <Ionicons name="checkmark-circle" size={22} color={COLORS.secondary} />}
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Publish Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.publishBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.9}>
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <>
                <Ionicons name="rocket" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.publishText}>Publish Reel</Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.lg, paddingBottom: 120 },

  videoBox: { height: 220, borderRadius: 24, overflow: 'hidden', marginBottom: 16, ...SHADOWS.light },
  videoPickerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  uploadCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.12)', justifyContent: 'center', alignItems: 'center' },
  uploadTitle: { color: COLORS.white, fontWeight: '800', fontSize: FONTS.sizes.lg },
  uploadSub: { color: 'rgba(255,255,255,0.6)', fontSize: FONTS.sizes.sm },
  videoPreview: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  videoPickedText: { color: COLORS.white, fontWeight: '800', fontSize: 16, marginTop: 8 },
  videoSubText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },

  thumbnailRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.white, borderRadius: 20, padding: 14, marginBottom: 16, ...SHADOWS.light, borderWidth: 1, borderColor: COLORS.border },
  thumbnailPreview: { width: 52, height: 72, borderRadius: 12 },
  thumbnailPlaceholder: { width: 52, height: 72, borderRadius: 12, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  thumbnailLabel: { fontWeight: '800', color: COLORS.slate900, fontSize: FONTS.sizes.md },
  thumbnailSub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },

  card: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20, marginBottom: 16, ...SHADOWS.light, borderWidth: 1, borderColor: COLORS.border },
  fieldLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 10 },
  fieldSub: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },

  captionInput: { fontSize: FONTS.sizes.md, color: COLORS.slate900, minHeight: 80, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: COLORS.textLight, textAlign: 'right', marginTop: 4 },

  hashtagInputRow: { flexDirection: 'row', gap: 10 },
  hashtagInput: { flex: 1, height: 44, backgroundColor: COLORS.background, borderRadius: 22, paddingHorizontal: 16, fontSize: FONTS.sizes.md, borderWidth: 1, borderColor: COLORS.border },
  addTagBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center' },
  tagChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.secondary },
  tagChipText: { color: COLORS.secondary, fontSize: 12, fontWeight: '700' },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  visibilityOption: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 16, marginTop: 10, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  visibilityOptionActive: { borderColor: COLORS.secondary, backgroundColor: `${COLORS.secondary}10` },
  visLabel: { fontWeight: '700', fontSize: FONTS.sizes.md, color: COLORS.slate900 },
  visDesc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  publishBtn: { flexDirection: 'row', backgroundColor: '#7c3aed', height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', ...SHADOWS.glow },
  publishText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '800' },
});
