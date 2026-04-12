// src/screens/Buddy/FindBuddiesScreen.js
// Triggering Fast Refresh to clear cache
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Header from '../../components/common/Header';
import UserCard from '../../components/user/UserCard';
import { COLORS, FONTS, SPACING } from '../../constants';
import { userService, channelService } from '../../services';

export default function FindBuddiesScreen() {
  const navigation = useNavigation();

  // State definitions
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [dmingUserId, setDmingUserId] = useState(null); // which user's DM is being created

  // Debounce the input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Main search effect
  useEffect(() => {
    const startSearch = async () => {
      if (!debouncedQuery.trim()) {
        setUsers([]);
        setPage(1);
        setHasMore(false);
        return;
      }

      setLoading(true);
      setPage(1);

      try {
        const res = await userService.searchUsers({ q: debouncedQuery.trim(), limit: 15, page: 1 });
        const { data, pagination } = res;

        setUsers(data || []);
        setHasMore(pagination?.hasNext || false);
      } catch (err) {
        console.error('Search error:', err?.response?.data || err.message);
        setUsers([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    startSearch();
  }, [debouncedQuery]);

  // Load next page function
  const loadMoreUsers = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await userService.searchUsers({ q: debouncedQuery.trim(), limit: 15, page: nextPage });
      const { data, pagination } = res;

      setUsers(prev => [...prev, ...(data || [])]);
      setPage(nextPage);
      setHasMore(pagination?.hasNext || false);
    } catch (err) {
      console.error('Pagination error:', err?.response?.data || err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, loading, debouncedQuery, page]);

  const handleUserPress = (user) => {
    navigation.navigate('BuddyProfile', { username: user.username });
  };

  // Open (or create) a DM channel then jump straight to the chat room
  const handleMessageUser = async (user) => {
    if (dmingUserId) return; // already opening a DM
    setDmingUserId(user._id);
    try {
      const res = await channelService.createOrGetDM({ recipientId: user._id });
      // baseService unwraps response.data → res = { success, message, data: channel }
      const channel = res?.data;
      if (!channel?._id) {
        Alert.alert('Error', 'Could not open chat. Please try again.');
        return;
      }
      navigation.navigate('ChatRoom', {
        channelId: channel._id,
        channelName: user.displayName || user.username,
        channelType: 'dm',
      });
    } catch (err) {
      console.error('DM error:', err?.response?.data || err.message || err);
      Alert.alert('Could not open chat', err?.message || 'Please try again.');
    } finally {
      setDmingUserId(null);
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <View style={styles.container}>
      <Header title="Search Users" onMenuPress={() => navigation.getParent?.('DrawerNav')?.openDrawer?.() || navigation.dispatch(DrawerActions.openDrawer())} />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or @username..."
            placeholderTextColor={COLORS.textLight}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} activeOpacity={0.7} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Searching the globe...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}

          /* Pagination Props */
          onEndReached={loadMoreUsers}
          onEndReachedThreshold={0.5} // Trigger when 50% from the bottom

          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.secondary} />
                <Text style={styles.footerText}>Loading more travelers...</Text>
              </View>
            ) : null
          }

          ListEmptyComponent={
            query.trim() === '' ? (
              <View style={styles.centerContainer}>
                <Ionicons name="compass-outline" size={64} color={COLORS.border} />
                <Text style={styles.emptyTitle}>Find Travelers</Text>
                <Text style={styles.emptySub}>Search for people by their name or handle to see their journeys.</Text>
              </View>
            ) : (
              <View style={styles.centerContainer}>
                <Ionicons name="sad-outline" size={64} color={COLORS.border} />
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySub}>We couldn't find anyone matching "{query}".</Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onPress={handleUserPress}
              onMessage={handleMessageUser}
              msgLoading={dmingUserId === item._id}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchContainer: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: FONTS.sizes.md, color: COLORS.textPrimary },
  clearBtn: { padding: 4 },

  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 120, paddingTop: SPACING.sm },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl, marginTop: 100 },
  loadingText: { marginTop: 16, color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.slate800, marginTop: 16 },
  emptySub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },

  footerLoader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.md, gap: 8 },
  footerText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600' }
});
