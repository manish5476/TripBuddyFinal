// src/screens/Trip/JourneyTimelineScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import Header from '../../components/common/Header';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { stopService } from '../../services';

export default function JourneyTimelineScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { journeyId, journeyTitle } = route.params || {};

  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchStops = useCallback(async (pageNum = 1) => {
    if (!journeyId) return;
    try {
      // Backend paginates: /api/v1/stops/journey/:journeyId
      const res = await stopService.getJourneyStops(journeyId, { page: pageNum, limit: 10 });
      const newStops = res.data || [];
      const isNext = res.pagination?.hasNext || false;

      if (pageNum === 1) {
        setStops(newStops);
      } else {
        setStops(prev => [...prev, ...newStops]);
      }
      setHasMore(isNext);
      setPage(pageNum);
    } catch (err) {
      console.log('Error fetching timeline:', err);
    } finally {
      setLoading(false);
    }
  }, [journeyId]);

  useEffect(() => {
    fetchStops(1);
  }, [fetchStops]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchStops(page + 1);
    }
  };

  const renderStopItem = ({ item, index }) => {
    const isFirst = index === 0;
    const isLast = index === stops.length - 1;

    return (
      <TouchableOpacity 
        style={styles.timelineItem} 
        activeOpacity={0.9} 
        onPress={() => navigation.navigate('StopDetail', { stopId: item._id })}
      >
        {/* Timeline Thread */}
        <View style={styles.threadCol}>
          {!isFirst && <View style={[styles.threadLine, { top: 0, height: '50%' }]} />}
          {!isLast && <View style={[styles.threadLine, { bottom: 0, height: '50%' }]} />}
          <View style={styles.threadDot}>
            <Ionicons name={getModeIcon(item.transportMode)} size={12} color={COLORS.white} />
          </View>
        </View>

        {/* Content Card */}
        <View style={styles.cardContainer}>
          {item.media && item.media.length > 0 && (
            <Image source={{ uri: item.media[0].thumbnailUrl }} style={styles.cardMedia} />
          )}

          <View style={styles.cardInfo}>
            <Text style={styles.timeText}>{moment(item.loggedAt).format('h:mm A · MMM D')}</Text>
            <Text style={styles.locText} numberOfLines={1}>{item.locationName || 'Unknown Stop'}</Text>
            
            {item.caption ? (
               <Text style={styles.capText} numberOfLines={2}>{item.caption}</Text>
            ) : null}

            {item.weather && (
               <View style={styles.weatherBadge}>
                 <Text style={{ fontSize: 10 }}>{getWeatherEmoji(item.weather.condition)}</Text>
                 <Text style={styles.weatherText}>{item.weather.temperatureCelsius}°C</Text>
               </View>
            )}

            {/* Interactions row */}
            <View style={styles.interactRow}>
               <View style={styles.badge}><Ionicons name="heart" size={12} color={COLORS.danger}/><Text style={styles.badgeTxt}>{Object.values(item.reactionCounts || {}).reduce((a,b)=>a+b,0)}</Text></View>
               <View style={styles.badge}><Ionicons name="chatbubble" size={12} color={COLORS.secondary}/><Text style={styles.badgeTxt}>{item.commentCount || 0}</Text></View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && page === 1) return (
    <View style={styles.container}>
      <Header title="Timeline" onBackPress={() => navigation.goBack()} />
      <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.secondary} /></View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title={journeyTitle || 'Journey Timeline'} onBackPress={() => navigation.goBack()} />
      <FlatList
        data={stops}
        keyExtractor={i => i._id}
        contentContainerStyle={styles.listContent}
        renderItem={renderStopItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
           <View style={{alignItems: 'center', marginTop: 60}}>
              <Ionicons name="map-outline" size={60} color={COLORS.textLight} />
              <Text style={{color: COLORS.textSecondary, marginTop: 16}}>No stops logged yet.</Text>
           </View>
        }
      />
    </View>
  );
}

// Helpers
function getModeIcon(mode) {
  switch (mode) {
    case 'driving': return 'car';
    case 'train': return 'train';
    case 'flight': return 'airplane';
    case 'walking': return 'walk';
    case 'bus': return 'bus';
    default: return 'pin';
  }
}

function getWeatherEmoji(condition) {
  switch(condition) {
    case 'clear': return '☀️';
    case 'cloudy': return '☁️';
    case 'rain': return '🌧️';
    case 'thunderstorm': return '⛈️';
    case 'snow': return '❄️';
    default: return '⛅';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingVertical: 20 },
  
  timelineItem: { flexDirection: 'row', paddingHorizontal: SPACING.md, marginBottom: 16 },
  
  threadCol: { width: 40, alignItems: 'center', position: 'relative' },
  threadLine: { position: 'absolute', width: 2, backgroundColor: COLORS.border },
  threadDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', marginTop: 10, borderWidth: 3, borderColor: COLORS.background, zIndex: 2 },
  
  cardContainer: { flex: 1, backgroundColor: COLORS.white, borderRadius: 20, ...SHADOWS.light, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  cardMedia: { width: '100%', height: 160 },
  cardInfo: { padding: 16 },
  
  timeText: { fontSize: 10, fontWeight: '800', color: COLORS.textLight, textTransform: 'uppercase', marginBottom: 4 },
  locText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.slate900, marginBottom: 6 },
  capText: { fontSize: FONTS.sizes.sm, color: COLORS.slate800, lineHeight: 20, marginBottom: 12 },
  
  weatherBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: COLORS.background, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  weatherText: { fontSize: 10, fontWeight: '700', color: COLORS.slate800, marginLeft: 4 },

  interactRow: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, marginTop: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeTxt: { fontSize: 11, fontWeight: '800', color: COLORS.slate800 }
});
