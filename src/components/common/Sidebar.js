// src/components/common/Sidebar.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const MENU = [
  { label: 'Home',          icon: 'home-outline',        route: 'Feed',        isTab: true  },
  { label: 'My Journeys',   icon: 'compass-outline',     route: 'MyJourneys',  isTab: false },
  { label: 'My Trips',      icon: 'airplane-outline',    route: 'MyTrips',     isTab: false },
  { label: 'Find Buddies',  icon: 'people-outline',      route: 'Buddies',     isTab: true  },
  { label: 'Messages',      icon: 'chatbubbles-outline', route: 'Chats',       isTab: true  },
  { label: 'Expenses',      icon: 'wallet-outline',      route: 'Expenses',    isTab: false },
  { label: 'Profile',       icon: 'person-outline',      route: 'Profile',     isTab: true  },
];

const Sidebar = ({ navigation, state }) => {
  const { user, logout } = useAuth();
  const currentRoute = state?.routes[state.index]?.name;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.profileSection}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.closeDrawer()}>
          <Ionicons name="close" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'T'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Traveller'}</Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
        <View style={styles.statsRow}>
          {[['12','Trips'],['8','Buddies'],['4.8','Rating']].map(([num,label],i) => (
            <React.Fragment key={label}>
              {i > 0 && <View style={styles.statDiv}/>}
              <View style={styles.stat}>
                <Text style={styles.statNum}>{num}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.menu} showsVerticalScrollIndicator={false}>
        {MENU.map(item => {
          const active = currentRoute === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.menuItem, active && styles.menuItemActive]}
              onPress={() => {
                // Tab screens live inside the MainTabs navigator, so jump there
                if (item.isTab) {
                  navigation.navigate('MainTabs', { screen: item.route });
                } else {
                  navigation.navigate(item.route);
                }
                navigation.closeDrawer();
              }}
              activeOpacity={0.7}>
              <Ionicons name={item.icon} size={22} color={active ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>{item.label}</Text>
              {active && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      <Text style={styles.version}>Trip Buddy v1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  profileSection: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 44, right: 16 },
  avatarCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.white, marginBottom: 10 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: COLORS.white },
  userName: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.white },
  userEmail: { fontSize: FONTS.sizes.sm, color: 'rgba(255,255,255,0.8)', marginBottom: 14 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, width: '100%', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNum: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.white },
  statLabel: { fontSize: FONTS.sizes.xs, color: 'rgba(255,255,255,0.8)' },
  statDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  menu: { flex: 1, paddingTop: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, marginHorizontal: 10, borderRadius: 10, marginVertical: 2, position: 'relative' },
  menuItemActive: { backgroundColor: `${COLORS.primary}15` },
  menuLabel: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, marginLeft: 14, fontWeight: '500' },
  menuLabelActive: { color: COLORS.primary, fontWeight: '700' },
  activeDot: { position: 'absolute', right: 0, top: '20%', height: '60%', width: 4, backgroundColor: COLORS.primary, borderRadius: 4 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 30, borderTopWidth: 1, borderTopColor: COLORS.border },
  logoutText: { fontSize: FONTS.sizes.base, color: COLORS.danger, marginLeft: 14, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: FONTS.sizes.xs, color: COLORS.textLight, paddingVertical: 10 },
});

export default Sidebar;
