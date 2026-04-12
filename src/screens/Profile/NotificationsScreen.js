// src/screens/Profile/NotificationsScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../../constants';
import Header from '../../components/common/Header';
import { authService } from '../../services';
import { useAuth } from '../../context/AuthContext';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const notifOpts = user?.notificationPrefs || {};

  const [settings, setSettings] = useState({
    pushEnabled:  notifOpts.pushEnabled !== false,
    emailEnabled: notifOpts.emailEnabled !== false,
    inAppEnabled: notifOpts.inAppEnabled !== false,
  });

  const toggleSwitch = async (key) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
    try {
      await authService.updateNotificationPrefs({ [key]: newValue });
      await updateUser({ notificationPrefs: { ...notifOpts, [key]: newValue } });
    } catch (e) {
      setSettings(prev => ({ ...prev, [key]: !newValue })); // revert on fail
      Alert.alert('Error', 'Failed to update notification setting');
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
      <Header title="Notifications" showBack onBackPress={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Alert Methods</Text>
          {renderToggle('pushEnabled', 'Push Notifications', 'Receive push alerts on your device for messages and companion updates.')}
          {renderToggle('inAppEnabled', 'In-App Notifications', 'Show badge counts and toast alerts while you are actively using the app.')}
          {renderToggle('emailEnabled', 'Email Notifications', 'Receive daily digests, trip summary, and important security updates via email.')}
        </View>

        <Text style={styles.footerNote}>
          To change specific notification sounds or system-level permissions, please visit your device's global settings.
        </Text>

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
  footerNote: { fontSize: FONTS.sizes.xs, color: COLORS.textLight, textAlign: 'center', lineHeight: 18, marginHorizontal: SPACING.md },
});
