// src/screens/Reels/ReelFeedScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, ActivityIndicator, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { reelService } from '../../services';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const REACTIONS = [
  { type: 'fire', emoji: '🔥' },
  { type: 'wanna_go', emoji: '😍' },
  { type: 'amazing', emoji: '🤯' },
  { type: 'been_there', emoji: '🙌' },
  { type: 'laughing', emoji: '😂' },
];

// ── Single Reel Card ─────────────────────────────
const ReelCard = ({ item, isActive }) => {
  const videoRef = useRef(null);
  const [liked, setLiked] = useState(item.isLiked || false);
  const [likeCount, setLikeCount] = useState(item.likeCount || 0);
  const [saved, setSaved] = useState(item.isSaved || false);
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [paused, setPaused] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isActive && videoRef.current) {
      videoRef.current.pauseAsync().catch(() => {});
    } else if (isActive && videoRef.current && !paused) {
      videoRef.current.playAsync().catch(() => {});
    }
  }, [isActive]);

  const handleLike = async () => {
    setLiked(p => !p);
    setLikeCount(p => liked ? p - 1 : p + 1);
    try { await reelService.likeReel(item._id); } catch { setLiked(p => !p); }
  };

  const handleSave = async () => {
    setSaved(p => !p);
    try { await reelService.saveReel(item._id); } catch { setSaved(p => !p); }
  };

  const handleReact = async (type) => {
    setShowReactions(false);
    try { await reelService.reactReel(item._id, { type }); } catch {}
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setActionLoading(true);
    try {
      await reelService.commentReel(item._id, { text: comment });
      setComment('');
    } catch (e) { Alert.alert('Error', 'Failed to post comment'); }
    finally { setActionLoading(false); }
  };

  const author = item.authorId;

  return (
    <View style={styles.reelCard}>
      {/* Video */}
      <TouchableOpacity activeOpacity={1} style={StyleSheet.absoluteFill} onPress={() => setPaused(p => !p)}>
        <Video
          ref={videoRef}
          source={{ uri: item.videoUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          isLooping
          shouldPlay={isActive && !paused}
          isMuted={false}
        />
        {paused && (
          <View style={styles.pauseOverlay}>
            <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.85)" />
          </View>
        )}
      </TouchableOpacity>

      {/* Gradient overlay */}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.gradient} />

      {/* Author info (bottom-left) */}
      <View style={styles.authorInfo}>
        <View style={styles.authorRow}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{author?.displayName?.charAt(0)?.toUpperCase() || 'T'}</Text>
          </View>
          <View>
            <Text style={styles.authorName}>@{author?.username}</Text>
            {author?.isVerified && <Text style={styles.verifiedBadge}>✓ Verified</Text>}
          </View>
        </View>
        {item.caption ? <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text> : null}
        {item.hashtags?.length > 0 && (
          <Text style={styles.hashtags}>{item.hashtags.slice(0, 4).map(h => `#${h}`).join(' ')}</Text>
        )}
        {item.locationTag?.name ? (
          <View style={styles.locationTag}>
            <Ionicons name="location" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.locationTagText}>{item.locationTag.name}</Text>
          </View>
        ) : null}
      </View>

      {/* Action bar (right side) */}
      <View style={styles.actionBar}>
        {/* Like */}
        <View style={styles.actionItem}>
          <TouchableOpacity style={[styles.actionBtn, liked && styles.actionBtnActive]} onPress={handleLike}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={28} color={liked ? '#ef4444' : COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.actionCount}>{likeCount}</Text>
        </View>

        {/* Comment */}
        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowComments(p => !p)}>
            <Ionicons name="chatbubble-outline" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.actionCount}>{item.commentCount || 0}</Text>
        </View>

        {/* React */}
        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowReactions(p => !p)}>
            <Text style={{ fontSize: 26 }}>😍</Text>
          </TouchableOpacity>
        </View>

        {/* Save */}
        <View style={styles.actionItem}>
          <TouchableOpacity style={[styles.actionBtn, saved && styles.actionBtnActive]} onPress={handleSave}>
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={26} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Views */}
        <View style={styles.actionItem}>
          <View style={styles.actionBtn}>
            <Ionicons name="eye-outline" size={22} color="rgba(255,255,255,0.7)" />
          </View>
          <Text style={styles.actionCount}>{item.viewCount || 0}</Text>
        </View>
      </View>

      {/* Reaction Picker */}
      {showReactions && (
        <View style={styles.reactionPicker}>
          {REACTIONS.map(r => (
            <TouchableOpacity key={r.type} style={styles.reactBtn} onPress={() => handleReact(r.type)}>
              <Text style={{ fontSize: 28 }}>{r.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Comment Sheet */}
      {showComments && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.commentSheet}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentTitle}>Comments</Text>
            <TouchableOpacity onPress={() => setShowComments(false)}>
              <Ionicons name="close" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.commentInput}>
            <TextInput
              style={styles.commentTextInput}
              placeholder="Write a comment..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleComment} disabled={actionLoading || !comment.trim()}>
              {actionLoading
                ? <ActivityIndicator size="small" color={COLORS.white} />
                : <Ionicons name="send" size={18} color={COLORS.white} />}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

// ── Main Screen ─────────────────────────────────
export default function ReelFeedScreen() {
  const navigation = useNavigation();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async (pageNum = 1) => {
    try {
      const res = await reelService.getReelFeed({ page: pageNum, limit: 10 });
      const newReels = res.data || [];
      if (pageNum === 1) setReels(newReels);
      else setReels(prev => [...prev, ...newReels]);
      setHasMore(res.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (err) {
      console.log('Feed error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFeed(1); }, [fetchFeed]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }, []);

  if (loading) return (
    <View style={[styles.container, styles.center]}>
      <ActivityIndicator size="large" color={COLORS.secondary} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header buttons */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={() => navigation.navigate('ExploreReels')}>
          <Ionicons name="compass-outline" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topBtn} onPress={() => navigation.navigate('CreateReel')}>
          <Ionicons name="add-circle-outline" size={26} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={reels}
        keyExtractor={r => r._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_H}
        decelerationRate="fast"
        renderItem={({ item, index }) => (
          <ReelCard item={item} isActive={index === activeIndex} />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
        onEndReached={() => hasMore && fetchFeed(page + 1)}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={[styles.center, { height: SCREEN_H }]}>
            <Ionicons name="videocam-outline" size={72} color="rgba(255,255,255,0.2)" />
            <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 16, fontSize: 16 }}>No reels yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { justifyContent: 'center', alignItems: 'center' },

  topBar: { position: 'absolute', top: 52, right: 16, zIndex: 99, flexDirection: 'row', gap: 12 },
  topBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },

  reelCard: { width: SCREEN_W, height: SCREEN_H, position: 'relative', overflow: 'hidden' },
  gradient: { ...StyleSheet.absoluteFillObject, top: '40%' },
  pauseOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },

  authorInfo: { position: 'absolute', bottom: 100, left: 16, right: 80 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.white },
  avatarSmallText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  authorName: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  verifiedBadge: { color: COLORS.secondary, fontSize: 10, fontWeight: '700' },
  caption: { color: COLORS.white, fontSize: 13, lineHeight: 18, marginBottom: 6 },
  hashtags: { color: COLORS.secondary, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  locationTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationTagText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },

  actionBar: { position: 'absolute', bottom: 90, right: 12, alignItems: 'center', gap: 20 },
  actionItem: { alignItems: 'center', gap: 4 },
  actionBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  actionBtnActive: { backgroundColor: 'rgba(239,68,68,0.2)' },
  actionCount: { color: COLORS.white, fontSize: 11, fontWeight: '800' },

  reactionPicker: { position: 'absolute', bottom: 200, right: 64, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 32, padding: 8, flexDirection: 'row', gap: 8 },
  reactBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },

  commentSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.9)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  commentTitle: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  commentInput: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  commentTextInput: { flex: 1, height: 44, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 22, paddingHorizontal: 16, color: COLORS.white, fontSize: 14 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center' },
});
