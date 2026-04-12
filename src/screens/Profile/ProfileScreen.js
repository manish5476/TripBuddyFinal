// src/screens/Profile/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, Image } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import { COLORS, FONTS, SPACING } from '../../constants';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const renderHeaderContent = () => (
    <>
      <View style={styles.avatarWrap}>
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.displayName || user?.name || 'T').charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <Text style={styles.profileName}>{user?.displayName || user?.name || 'Traveller'}</Text>
      <Text style={styles.profileUsername}>@{user?.username || 'travel_buddy'}</Text>

      <View style={styles.statsRow}>
        {[['12','Trips'],['8','Buddies'],['4.8','Rating']].map(([num,label],i) => (
          <React.Fragment key={label}>
            {i > 0 && <View style={styles.divider}/>}
            <View style={{ alignItems:'center' }}>
              <Text style={styles.statNum}>{num}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="Profile" 
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        rightIcon="settings-outline"
        onRightPress={() => navigation.navigate('Settings')}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeaderWrap}>
          {user?.coverImageUrl ? (
            <ImageBackground source={{ uri: user.coverImageUrl }} style={styles.profileHeader}>
              <View style={styles.darkOverlay} />
              {renderHeaderContent()}
            </ImageBackground>
          ) : (
            <LinearGradient colors={[COLORS.primary, '#0a1628']} style={styles.profileHeader}>
              {renderHeaderContent()}
            </LinearGradient>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Home City</Text>
            <View style={styles.fieldRow}>
              <Ionicons name="location" size={20} color={COLORS.secondary} style={{ marginRight: 10 }} />
              <Text style={styles.fieldValue}>{user?.homeCity || user?.city || 'Not specified'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.bioText}>{user?.bio || 'You haven\'t added a bio yet. Head to Settings to add one!'}</Text>
          </View>

          {user?.websiteUrl && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Website</Text>
              <View style={styles.fieldRow}>
                <Ionicons name="globe-outline" size={20} color={COLORS.accent} style={{ marginRight: 10 }} />
                <Text style={[styles.fieldValue, { color: COLORS.accent }]}>{user.websiteUrl}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  profileHeaderWrap: { borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden', elevation: 5 },
  profileHeader: { alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.xxl, paddingHorizontal: SPACING.lg },
  darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  avatarWrap: { marginBottom: SPACING.md },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.white },
  avatarImg: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: COLORS.white },
  avatarText: { fontSize: 36, fontWeight: '800', color: COLORS.white },
  profileName: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  profileUsername: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2, marginBottom: SPACING.lg },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, gap: 20 },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.4)' },
  statNum: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.white },
  statLabel: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.9)' },
  content: { padding: SPACING.lg, marginTop: -SPACING.sm },
  section: { backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.lg, marginBottom: SPACING.md, elevation: 2 },
  sectionTitle: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldRow: { flexDirection: 'row', alignItems: 'center' },
  fieldValue: { fontSize: FONTS.sizes.md, color: COLORS.textPrimary, fontWeight: '500' },
  bioText: { fontSize: FONTS.sizes.md, color: COLORS.textPrimary, lineHeight: 22 },
});
