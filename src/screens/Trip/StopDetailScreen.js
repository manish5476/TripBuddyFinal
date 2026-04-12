// src/screens/Trip/StopDetailScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import Header from '../../components/common/Header';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { stopService } from '../../services';

const REACTIONS = [
  { type: 'fire', emoji: '🔥' },
  { type: 'wanna_go', emoji: '😍' },
  { type: 'amazing', emoji: '🤯' },
  { type: 'been_there', emoji: '🙌' }
];

export default function StopDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { stopId } = route.params || {};

  const [stop, setStop] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [showReactors, setShowReactors] = useState(false);

  const fetchStop = useCallback(async () => {
    if (!stopId) return;
    try {
      const res = await stopService.getStop(stopId, { source: 'detail' });
      setStop(res.data?.data || res.data || null);
    } catch (err) {
      console.log('Error fetching stop:', err);
      Alert.alert('Error', 'Failed to load stop details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [stopId]);

  useEffect(() => { fetchStop(); }, [fetchStop]);

  const handleReact = async (type) => {
    try {
      // Optimistic upate could be done here
      await stopService.reactToStop(stopId, { type });
      fetchStop(); // refresh to get new counts
    } catch (e) {
      console.log('React error', e);
    }
  };

  const handleSave = async () => {
    try {
      await stopService.saveStop(stopId);
      fetchStop();
    } catch (e) {
      console.log('Save error', e);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setAddingComment(true);
    try {
      await stopService.addComment(stopId, { text: commentText });
      setCommentText('');
      fetchStop();
    } catch (e) {
      Alert.alert('Error', 'Failed to post comment.');
    } finally {
      setAddingComment(false);
    }
  };

  const handleBeenHere = async () => {
    try {
      await stopService.attachBeenHere(stopId, { caption: 'I visited this place too!' });
      Alert.alert('Success', 'Attached your memory to this stop!');
      fetchStop();
    } catch (e) {
      Alert.alert('Notice', e.message || 'Could not attach "Been Here".');
    }
  };

  if (loading) return (
    <View style={styles.container}>
       <Header title="Stop Details" onBackPress={() => navigation.goBack()} />
       <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.secondary} /></View>
    </View>
  );

  if (!stop) return null;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Memory" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Media */}
        {stop.media && stop.media.length > 0 && (
           <Image source={{ uri: stop.media[0].url || stop.media[0].thumbnailUrl }} style={styles.mainImage} />
        )}

        <View style={styles.content}>
          <Text style={styles.locationText}>{stop.locationName}</Text>
          <Text style={styles.dateText}>{moment(stop.loggedAt).format('LLLL')}</Text>
          
          {stop.caption ? <Text style={styles.captionText}>{stop.caption}</Text> : null}

          {/* Action Ribbon */}
          <View style={styles.actionRibbon}>
             <View style={styles.reactionPicker}>
                {REACTIONS.map(r => (
                  <TouchableOpacity key={r.type} style={styles.reactBtn} onPress={() => handleReact(r.type)}>
                    <Text style={{ fontSize: 20 }}>{r.emoji}</Text>
                    <Text style={styles.reactCount}>{stop.reactionCounts?.[r.type] || 0}</Text>
                  </TouchableOpacity>
                ))}
             </View>
             
             <View style={{ flexDirection: 'row', gap: 12 }}>
               <TouchableOpacity onPress={handleBeenHere} style={styles.iconBtn}>
                  <Ionicons name="location" size={24} color={COLORS.success} />
               </TouchableOpacity>
               <TouchableOpacity onPress={handleSave} style={styles.iconBtn}>
                  <Ionicons name="bookmark" size={24} color={COLORS.secondary} />
               </TouchableOpacity>
             </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Comments ({stop.commentCount || 0})</Text>
            
            {stop.comments && stop.comments.map(c => (
               <View key={c._id} style={styles.commentRow}>
                  <View style={styles.commentAvatar}>
                    <Ionicons name="person" size={14} color={COLORS.textLight} />
                  </View>
                  <View style={styles.commentBubble}>
                     <Text style={styles.commentText}>{c.text}</Text>
                     <Text style={styles.commentTime}>{moment(c.createdAt).fromNow()}</Text>
                  </View>
               </View>
            ))}
            
            {(stop.comments?.length === 0) && (
              <Text style={{ fontSize: 12, color: COLORS.textLight, marginTop: 10 }}>No comments yet. Be the first!</Text>
            )}
          </View>
        </View>

      </ScrollView>

      {/* Input Footer */}
      <View style={styles.inputFooter}>
        <TextInput 
           style={styles.textInput}
           placeholder="Write a comment..."
           value={commentText}
           onChangeText={setCommentText}
           editable={!addingComment}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleAddComment} disabled={addingComment || !commentText.trim()}>
           {addingComment ? <ActivityIndicator size="small" color={COLORS.white} /> : <Ionicons name="send" size={18} color={COLORS.white} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  mainImage: { width: '100%', height: 350, backgroundColor: COLORS.slate900 },
  
  content: { padding: SPACING.lg },
  locationText: { fontSize: 24, fontWeight: '800', color: COLORS.slate900 },
  dateText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginTop: 4, marginBottom: 16 },
  captionText: { fontSize: FONTS.sizes.md, color: COLORS.slate800, lineHeight: 22, marginBottom: 24 },
  
  actionRibbon: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border, marginBottom: 24 },
  reactionPicker: { flexDirection: 'row', gap: 16 },
  reactBtn: { alignItems: 'center' },
  reactCount: { fontSize: 10, fontWeight: '800', color: COLORS.textSecondary, marginTop: 4 },
  
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.light, borderWidth: 1, borderColor: COLORS.border },

  commentsSection: { marginTop: 8 },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.slate900, marginBottom: 16 },
  
  commentRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  commentBubble: { flex: 1, backgroundColor: COLORS.white, padding: 12, borderRadius: 16, borderTopLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.light },
  commentText: { fontSize: 13, color: COLORS.slate800, lineHeight: 18 },
  commentTime: { fontSize: 10, color: COLORS.textLight, marginTop: 6, fontWeight: '600' },

  inputFooter: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white, alignItems: 'center', gap: 12 },
  textInput: { flex: 1, height: 44, backgroundColor: COLORS.background, borderRadius: 22, paddingHorizontal: 16, fontSize: FONTS.sizes.md, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.glow }
});
