// src/components/common/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants';

const Header = ({
  title = 'Trip Buddy',
  onMenuPress,
  onBackPress,
  rightIcon,
  onRightPress,
  showNotification = false,
  notificationCount = 0,
}) => (
  <>
    <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconBtn} onPress={onBackPress || onMenuPress} activeOpacity={0.7}>
        <Ionicons name={onBackPress ? 'arrow-back' : 'menu'} size={24} color={COLORS.white} />
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      <View style={styles.right}>
        {showNotification && (
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity style={styles.iconBtn} onPress={onRightPress}>
            <Ionicons name={rightIcon} size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  </>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12, paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 52,
    elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  title: { flex: 1, color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700', textAlign: 'center' },
  right: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: COLORS.secondary, borderRadius: 8,
    minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2,
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: 'bold' },
});

export default Header;
