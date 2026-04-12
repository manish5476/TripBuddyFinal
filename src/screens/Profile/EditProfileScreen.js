import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SPACING } from '../../constants';
import Header from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [homeCity, setHomeCity] = useState(user?.homeCity || user?.city || '');
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl || '');
  const [languageCode, setLanguageCode] = useState(user?.languageCode || '');
  const [creatorBio, setCreatorBio] = useState(user?.creatorBio || '');
  const [avatarUri, setAvatarUri] = useState(user?.avatarUrl || null);
  const [coverUri, setCoverUri] = useState(user?.coverImageUrl || null);
  const [saving, setSaving] = useState(false);

  const pickImage = async (type) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'cover' ? [16, 9] : [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      if (type === 'avatar') {
        await uploadImage('avatar', result.assets[0].uri);
      } else {
        await uploadImage('cover', result.assets[0].uri);
      }
    }
  };

  const uploadImage = async (type, uri) => {
    setSaving(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append(type === 'avatar' ? 'avatar' : 'cover', {
        uri,
        name: filename,
        type: mimeType,
      });

      if (type === 'avatar') {
        const res = await authService.uploadUserAvatar(formData);
        setAvatarUri(res.data.avatarUrl);
        await updateUser({ avatarUrl: res.data.avatarUrl });
        Alert.alert('Success', 'Avatar updated!');
      } else {
        const res = await authService.uploadCoverImg(formData);
        setCoverUri(res.data.coverImageUrl);
        await updateUser({ coverImageUrl: res.data.coverImageUrl });
        Alert.alert('Success', 'Cover image updated!');
      }
    } catch (e) {
      Alert.alert('Error', e.message || `Failed to upload ${type}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const data = { displayName, bio, homeCity, websiteUrl, languageCode, creatorBio };
    try {
      await authService.updateProfile(data);
      await updateUser({ ...data, name: displayName, city: homeCity }); // sync local fallback props
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" showBack onBackPress={() => navigation.goBack()} rightIcon="checkmark" onRightPress={handleSave} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.coverWrap} onPress={() => pickImage('cover')} activeOpacity={0.8}>
            {coverUri ? (
              <Image source={{ uri: coverUri }} style={styles.coverImg} />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Ionicons name="image-outline" size={32} color={COLORS.textLight} />
                <Text style={styles.coverText}>Add Cover Photo</Text>
              </View>
            )}
            <View style={styles.editCoverBtn}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </View>
          </TouchableOpacity>

          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{(displayName || 'T').charAt(0).toUpperCase()}</Text>
            )}
            <TouchableOpacity style={styles.editAvatarBtn} onPress={() => pickImage('avatar')} disabled={saving}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {[
          { label: 'Display Name', value: displayName, setter: setDisplayName, icon: 'person-outline' },
          { label: 'Home City', value: homeCity, setter: setHomeCity, icon: 'location-outline' },
          { label: 'Website URL', value: websiteUrl, setter: setWebsiteUrl, icon: 'globe-outline', type: 'url' },
          { label: 'Language Code (e.g. en, fr)', value: languageCode, setter: setLanguageCode, icon: 'language-outline' },
        ].map((f, i) => (
          <View key={i} style={styles.inputGroup}>
            <Text style={styles.label}>{f.label}</Text>
            <View style={styles.inputWrap}>
              <Ionicons name={f.icon} size={20} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
              <TextInput style={styles.input} value={f.value} onChangeText={f.setter} placeholder={`Enter ${f.label.toLowerCase()}`}
                placeholderTextColor={COLORS.textLight} keyboardType={f.type || 'default'} autoCapitalize="none" />
            </View>
          </View>
        ))}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <View style={[styles.inputWrap, styles.multilineWrap]}>
            <TextInput style={[styles.input, styles.multiline]} value={bio} onChangeText={setBio} multiline
              placeholder="A short bio about yourself..." placeholderTextColor={COLORS.textLight} />
          </View>
        </View>

        <View style={[styles.inputGroup, { marginBottom: SPACING.xxl }]}>
          <Text style={styles.label}>Creator Bio (Optional)</Text>
          <View style={[styles.inputWrap, styles.multilineWrap]}>
            <TextInput style={[styles.input, styles.multiline]} value={creatorBio} onChangeText={setCreatorBio} multiline
              placeholder="If you're a creator, add extra details here..." placeholderTextColor={COLORS.textLight} />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: SPACING.xxl },
  imageSection: { alignItems: 'center', marginBottom: SPACING.xl },
  coverWrap: { width: '100%', height: 160, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  coverImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  coverPlaceholder: { alignItems: 'center' },
  coverText: { marginTop: 4, color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  editCoverBtn: { position: 'absolute', bottom: SPACING.sm, right: SPACING.sm, backgroundColor: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 20 },
  avatarWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', elevation: 6, marginTop: -50, borderWidth: 4, borderColor: COLORS.white },
  avatarImg: { width: '100%', height: '100%', borderRadius: 50 },
  avatarText: { fontSize: 36, fontWeight: '800', color: COLORS.white },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: -4, backgroundColor: COLORS.primary, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.white },
  inputGroup: { marginBottom: SPACING.lg, paddingHorizontal: SPACING.lg },
  label: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary, paddingVertical: 12 },
  multilineWrap: { alignItems: 'flex-start', paddingVertical: 8 },
  multiline: { height: 80, textAlignVertical: 'top' },
});
