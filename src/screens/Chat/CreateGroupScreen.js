// src/screens/Chat/CreateGroupScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../../components/common/Header';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { channelService, userService } from '../../services';

export default function CreateGroupScreen() {
  const navigation = useNavigation();

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
    const t = setTimeout(doSearch, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const doSearch = async () => {
    setSearching(true);
    try {
      const res = await userService.searchUsers({ q: searchQuery, limit: 15 });
      setSearchResults(res?.data || []);
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  const toggleMember = (user) => {
    const already = selectedMembers.find(m => m._id === user._id);
    if (already) {
      setSelectedMembers(prev => prev.filter(m => m._id !== user._id));
    } else {
      setSelectedMembers(prev => [...prev, user]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) { Alert.alert('Required', 'Please enter a group name!'); return; }
    if (selectedMembers.length < 1) { Alert.alert('Required', 'Add at least 1 member!'); return; }

    setCreating(true);
    try {
      const res = await channelService.createGroupChannel({
        name: groupName.trim(),
        description: description.trim(),
        memberIds: selectedMembers.map(m => m._id),
      });
      Alert.alert('✅ Group Created!', `"${groupName}" is ready.`);
      navigation.replace('ChatRoom', {
        channelId: res?.data?._id,
        channelName: groupName,
        channelType: 'group',
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="New Group" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Group identity */}
        <LinearGradient colors={['#7c3aed', '#4f46e5']} style={styles.groupIdentity}>
          <View style={styles.groupAvatarBox}>
            <Ionicons name="people" size={36} color={COLORS.white} />
          </View>
          <View style={styles.nameInputWrap}>
            <TextInput
              style={styles.groupNameInput}
              placeholder="Group name..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={groupName}
              onChangeText={setGroupName}
              maxLength={60}
            />
          </View>
        </LinearGradient>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>DESCRIPTION (OPTIONAL)</Text>
          <TextInput
            style={styles.descInput}
            placeholder="What's this group about?"
            placeholderTextColor={COLORS.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
          />
        </View>

        {/* Selected members chips */}
        {selectedMembers.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.fieldLabel}>ADDED ({selectedMembers.length})</Text>
            <View style={styles.selectedChips}>
              {selectedMembers.map(u => (
                <TouchableOpacity key={u._id} style={styles.memberChip} onPress={() => toggleMember(u)}>
                  <View style={styles.chipAvatar}>
                    <Text style={styles.chipAvatarText}>{u.displayName?.charAt(0)?.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.chipName}>{u.displayName?.split(' ')[0]}</Text>
                  <Ionicons name="close" size={12} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search users */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>ADD MEMBERS</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by username or name..."
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searching && <ActivityIndicator size="small" color={COLORS.secondary} />}
          </View>

          {searchResults.length > 0 && (
            <View style={{ marginTop: 8 }}>
              {searchResults.map(user => {
                const isSelected = selectedMembers.some(m => m._id === user._id);
                return (
                  <TouchableOpacity
                    key={user._id}
                    style={[styles.userRow, isSelected && styles.userRowSelected]}
                    onPress={() => toggleMember(user)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>{user.displayName?.charAt(0)?.toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName}>{user.displayName}</Text>
                      <Text style={styles.userHandle}>@{user.username}</Text>
                    </View>
                    <View style={[styles.checkBox, isSelected && styles.checkBoxActive]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
            <Text style={styles.noResults}>No users found for "{searchQuery}"</Text>
          )}
        </View>

      </ScrollView>

      {/* Create button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={creating} activeOpacity={0.9}>
          {creating
            ? <ActivityIndicator color={COLORS.white} />
            : <>
                <Ionicons name="people" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.createBtnText}>Create Group ({selectedMembers.length + 1} members)</Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 120 },

  groupIdentity: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 24 },
  groupAvatarBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  nameInputWrap: { flex: 1 },
  groupNameInput: { fontSize: 22, fontWeight: '800', color: COLORS.white, borderBottomWidth: 2, borderBottomColor: 'rgba(255,255,255,0.4)', paddingBottom: 6 },

  card: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 16, borderRadius: 24, padding: 20, ...SHADOWS.light, borderWidth: 1, borderColor: COLORS.border },
  fieldLabel: { fontSize: 10, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 10 },
  descInput: { fontSize: FONTS.sizes.md, color: COLORS.slate900, minHeight: 60, textAlignVertical: 'top' },

  selectedSection: { padding: 16 },
  selectedChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  memberChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.white, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.light },
  chipAvatar: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center' },
  chipAvatarText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  chipName: { fontSize: 12, fontWeight: '700', color: COLORS.slate900 },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 16, paddingHorizontal: 12, height: 44, gap: 10, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.slate900 },

  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 16 },
  userRowSelected: { backgroundColor: `${COLORS.secondary}10` },
  userAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  userName: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.slate900 },
  userHandle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  checkBox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  checkBoxActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },

  noResults: { textAlign: 'center', color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 12 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 40, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  createBtn: { flexDirection: 'row', backgroundColor: '#7c3aed', height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', ...SHADOWS.glow },
  createBtnText: { color: COLORS.white, fontWeight: '800', fontSize: FONTS.sizes.md },
});
