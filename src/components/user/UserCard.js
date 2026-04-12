// src/components/user/UserCard.js
/**
 * UserCard
 * Props:
 *   user       - user object from search API
 *   onPress    - tap row → go to profile
 *   onMessage  - tap chat button → open DM  (optional)
 *
 * IMPORTANT: The chat button must NOT be nested inside the row's
 * TouchableOpacity, otherwise React Native swallows the inner press
 * on Android. We use a wrapper View + separate Pressable for the button.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../constants';

export default function UserCard({ user, onPress, onMessage, msgLoading = false }) {
  if (!user) return null;

  const initial = user.displayName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <View style={styles.cardWrapper}>
      {/* Main tappable row → navigate to profile */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => onPress?.(user)}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {user.isCreator ? (
            <LinearGradient colors={[COLORS.secondary, '#ec4899']} style={styles.creatorRing}>
              <View style={styles.avatarInner}>
                {user.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarInitial}>{initial}</Text>
                )}
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.standardAvatar}>
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarInitial}>{initial}</Text>
              )}
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName} numberOfLines={1}>{user.displayName}</Text>
            {user.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color={COLORS.accent} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.statLine}>
            <Text style={styles.statNum}>{user.followerCount || 0}</Text> followers
          </Text>
        </View>

        {/* "View" label (non-interactive – tapping card handles it) */}
        <View style={styles.viewBtn}>
          <Text style={styles.viewBtnText}>View</Text>
        </View>
      </TouchableOpacity>

      {/* Message button — OUTSIDE the card TouchableOpacity so it gets its own press zone */}
      {onMessage && (
        <Pressable
          style={({ pressed }) => [styles.msgBtn, pressed && { opacity: 0.7 }, msgLoading && { opacity: 0.6 }]}
          onPress={() => !msgLoading && onMessage(user)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {msgLoading
            ? <ActivityIndicator size="small" color={COLORS.white} />
            : <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.white} />
          }
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: 8,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.light,
  },
  avatarContainer: { marginRight: 14 },
  creatorRing: { padding: 3, borderRadius: 28 },
  avatarInner: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.white,
  },
  standardAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.slate800, justifyContent: 'center', alignItems: 'center',
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 100 },
  avatarInitial: { color: COLORS.white, fontSize: 18, fontWeight: '800' },

  infoCol: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  displayName: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  username: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statLine: { fontSize: 11, color: COLORS.textSecondary, marginTop: 3 },
  statNum: { fontWeight: '700', color: COLORS.textPrimary },

  viewBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: COLORS.brand50, borderRadius: 20,
  },
  viewBtnText: { color: COLORS.secondary, fontSize: 12, fontWeight: '700' },

  // Standalone chat button to the right of the card
  msgBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.light,
  },
});
