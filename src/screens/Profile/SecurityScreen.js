// src/screens/Profile/SecurityScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../constants';
import Header from '../../components/common/Header';
import { authService } from '../../services';
import { useAuth } from '../../context/AuthContext';

export default function SecurityScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [loading, setLoading]                 = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) { Alert.alert('Error', 'Please fill all fields'); return; }
    if (newPassword.length < 8) { Alert.alert('Error', 'New password must be at least 8 characters'); return; }
    
    setLoading(true);
    try {
      await authService.updatePassword({ currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword('');
      Alert.alert('Success', 'Password updated successfully');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone and you will lose all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Forever', style: 'destructive', onPress: async () => {
            try {
              await authService.deleteAccount();
              logout();
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete account');
            }
        }},
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Security" showBack onBackPress={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <Text style={styles.sectionDesc}>Ensure your account is using a long, random password to stay secure.</Text>

          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
            <TextInput style={styles.input} placeholder="Current Password" placeholderTextColor={COLORS.textLight}
              value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry={!showCurrent} />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
              <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="key-outline" size={20} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
            <TextInput style={styles.input} placeholder="New Password" placeholderTextColor={COLORS.textLight}
              value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showNew} />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleUpdatePassword} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Updating...' : 'Update Password'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { borderColor: 'rgba(231,76,60,0.3)', borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>Danger Zone</Text>
          <Text style={styles.sectionDesc}>Once you delete your account, there is no going back. Please be certain.</Text>
          
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg },
  section: { backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.lg, marginBottom: SPACING.xl, elevation: 2 },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  sectionDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginBottom: SPACING.lg, lineHeight: 18 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary, paddingVertical: 12 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: SPACING.sm },
  btnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(231,76,60,0.1)', borderRadius: 12, padding: 15, gap: 10 },
  deleteText: { color: COLORS.danger, fontSize: FONTS.sizes.md, fontWeight: '700' },
});
