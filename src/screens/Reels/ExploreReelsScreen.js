// src/screens/Reels/ExploreReelsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/common/Header';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { reelService } from '../../services';

const { width: SCREEN_W } = Dimensions.get('window');
const TILE_SIZE = (SCREEN_W - 4) / 3;

const TRENDING_HASHTAGS = [
  'travel', 'india', 'roadtrip', 'wanderlust', 'mountains',
  'beach', 'backpacking', 'goa', 'himalayas', 'street_food',
];

export default function ExploreReelsScreen() {
  const navigation = useNavigation();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTag, setSearchTag] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchReels = useCallback(async (pageNum = 1, tag = activeTag) => {
    try {
      const params = { page: pageNum, limit: 21 };
      if (tag) params.hashtag = tag;
      const res = await reelService.exploreReels(params);
      const newReels = res.data || [];
      if (pageNum === 1) setReels(newReels);
      else setReels(prev => [...prev, ...newReels]);
      setHasMore(res.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (err) {
      console.log('Explore error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTag]);

  useEffect(() => { fetchReels(1, activeTag); }, [activeTag]);

  const handleTagPress = (tag) => {
    setActiveTag(prev => prev === tag ? null : tag);
    setLoading(true);
  };

  const handleSearch = () => {
    const tag = searchTag.trim().toLowerCase().replace('#', '');
    if (tag) { setActiveTag(tag); setLoading(true); }
  };

  const renderTile = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.tile, index % 3 === 1 && styles.tileMiddle]}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ReelFeed')}
    >
      <Image source={{ uri: item.thumbnailUrl || item.videoUrl }} style={styles.tileImage} />
      <View style={styles.tileOverlay}>
        <Ionicons name="play" size={16} color={COLORS.white} />
        <Text style={styles.tileViews}>{_formatCount(item.viewCount)}</Text>
      </View>
      {item.hashtags?.length > 0 && (
        <View style={styles.tileTag}>
          <Text style={styles.tileTagText}>#{item.hashtags[0]}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Explore Reels" onBackPress={() => navigation.goBack()} />

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by hashtag..."
            value={searchTag}
            onChangeText={setSearchTag}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchTag ? (
            <TouchableOpacity onPress={() => { setSearchTag(''); setActiveTag(null); }}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Trending hashtag chips */}
      <View style={styles.chipsRow}>
        <FlatList
          data={TRENDING_HASHTAGS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={t => t}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, activeTag === item && styles.chipActive]}
              onPress={() => handleTagPress(item)}
            >
              <Text style={[styles.chipText, activeTag === item && styles.chipTextActive]}>#{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading && page === 1 ? (
        <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.secondary} /></View>
      ) : (
        <FlatList
          data={reels}
          keyExtractor={r => r._id}
          numColumns={3}
          renderItem={renderTile}
          onEndReached={() => hasMore && !loading && fetchReels(page + 1)}
          onEndReachedThreshold={0.4}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="videocam-outline" size={60} color={COLORS.textLight} />
              <Text style={{ color: COLORS.textSecondary, marginTop: 12 }}>
                {activeTag ? `No reels for #${activeTag}` : 'No reels found'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function _formatCount(n = 0) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },

  searchRow: { paddingHorizontal: 16, paddingVertical: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, paddingHorizontal: 14, height: 46, gap: 10, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.light },
  searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.slate900 },

  chipsRow: { marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.slate900, borderColor: COLORS.slate900 },
  chipText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white },

  grid: { paddingBottom: 100 },
  tile: { width: TILE_SIZE, height: TILE_SIZE * 1.4, margin: 1, position: 'relative', overflow: 'hidden' },
  tileMiddle: { marginTop: 20 }, // staggered effect on middle column
  tileImage: { width: '100%', height: '100%', backgroundColor: COLORS.slate900 },
  tileOverlay: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  tileViews: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  tileTag: { position: 'absolute', top: 8, right: 6, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  tileTagText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
});
