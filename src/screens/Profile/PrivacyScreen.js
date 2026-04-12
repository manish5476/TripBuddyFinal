// src/screens/Profile/PrivacyScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../../constants';
import Header from '../../components/common/Header';
import { authService } from '../../services';
import { useAuth } from '../../context/AuthContext';

export default function PrivacyScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const privacyOpts = user?.privacySettings || {};

  const [settings, setSettings] = useState({
    ghostModeEnabled:       privacyOpts.ghostModeEnabled || false,
    locationSharingEnabled: privacyOpts.locationSharingEnabled !== false,
    showOnLiveGlobe:        privacyOpts.showOnLiveGlobe !== false,
    showOnCompanionRadar:   privacyOpts.showOnCompanionRadar !== false,
    allowCompanionRequests: privacyOpts.allowCompanionRequests !== false,
    allowDirectMessages:    privacyOpts.allowDirectMessages !== false,
    showOnlineStatus:       privacyOpts.showOnlineStatus !== false,
  });

  const toggleSwitch = async (key) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
    try {
      await authService.updatePrivacy({ [key]: newValue });
      await updateUser({ privacySettings: { ...privacyOpts, [key]: newValue } });
    } catch (e) {
      setSettings(prev => ({ ...prev, [key]: !newValue })); // revert on fail
      Alert.alert('Error', 'Failed to update privacy setting');
    }
  };

  const renderToggle = (key, title, desc) => (
    <View style={styles.toggleRow} key={key}>
      <View style={styles.textWrap}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <Switch
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={COLORS.white}
        onValueChange={() => toggleSwitch(key)}
        value={settings[key]}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Privacy" showBack onBackPress={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Journey & Location</Text>
          {renderToggle('ghostModeEnabled', 'Ghost Mode', 'Hide entirely from the map and other users near you.')}
          {renderToggle('locationSharingEnabled', 'Location Sharing', 'Allow your approximate location to be collected.')}
          {renderToggle('showOnLiveGlobe', 'Show on Live Globe', 'Let others see your active journeys on the explore feed.')}
          {renderToggle('showOnCompanionRadar', 'Companion Radar', 'Allow nearby travellers to see you on their radar.')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Interactions</Text>
          {renderToggle('allowCompanionRequests', 'Companion Requests', 'Allow other users to send you companion requests.')}
          {renderToggle('allowDirectMessages', 'Direct Messages', 'Allow direct messages from anyone (if disabled, only friends can message you).')}
          {renderToggle('showOnlineStatus', 'Online Status', 'Show when you are currently active on Trip Buddy.')}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg },
  section: { backgroundColor: COLORS.white, borderRadius: 16, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl, elevation: 2 },
  sectionHeader: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.primary, marginVertical: SPACING.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.background },
  textWrap: { flex: 1, paddingRight: SPACING.md },
  toggleTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  toggleDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, lineHeight: 18 },
});
