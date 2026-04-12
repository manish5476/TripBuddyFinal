// src/screens/Profile/SettingsScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../../constants';
import Header from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';

const SETTINGS_OPTIONS = [
  { id: 'edit_profile', icon: 'person-outline', title: 'Edit Profile', desc: 'Update your display name, bio, city', route: 'EditProfile' },
  { id: 'security', icon: 'shield-checkmark-outline', title: 'Security', desc: 'Password and account management', route: 'Security' },
  { id: 'privacy', icon: 'eye-off-outline', title: 'Privacy', desc: 'Manage who can see your journey', route: 'Privacy' },
  { id: 'notifications', icon: 'notifications-outline', title: 'Notifications', desc: 'Manage push and email alerts', route: 'Notifications' },
];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Header title="Settings" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          {SETTINGS_OPTIONS.map((item, index) => (
            <TouchableOpacity key={item.id} style={styles.optionRow} activeOpacity={0.7}
              onPress={() => navigation.navigate(item.route)}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={22} color={COLORS.primary} />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Trip Buddy v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg },
  section: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', elevation: 2, marginBottom: SPACING.xl },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.background },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(30,58,95,0.08)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  textWrap: { flex: 1 },
  optionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  optionDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(231,76,60,0.1)', borderRadius: 14, padding: SPACING.md, gap: 10, borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)', marginBottom: SPACING.xl },
  logoutText: { color: COLORS.danger, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  versionText: { textAlign: 'center', color: COLORS.textLight, fontSize: FONTS.sizes.xs },
});
