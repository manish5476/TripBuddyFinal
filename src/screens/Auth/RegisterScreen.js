// src/screens/Auth/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS } from '../../constants';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!username || !displayName || !email || !password) { Alert.alert('Error', 'Please fill all required fields'); return; }
    if (password.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters'); return; }
    setLoading(true);
    
    const userData = {
      username: username.trim().toLowerCase(),
      displayName: displayName.trim(),
      email: email.trim().toLowerCase(),
      password,
      phoneNumber: phoneNumber.trim() || undefined,
    };

    const result = await register(userData);
    setLoading(false);
    if (!result.success) Alert.alert('Registration Failed', result.message);
  };

  return (
    <LinearGradient colors={[COLORS.primary, '#0a1628']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.logoSection}>
            <View style={styles.logoCircle}><Ionicons name="airplane" size={40} color={COLORS.primary} /></View>
            <Text style={styles.appName}>Trip Buddy</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSub}>Join thousands of travellers</Text>

            {[
              { icon: 'at-circle-outline', placeholder: 'Username', value: username, setter: setUsername, type: 'default' },
              { icon: 'person-outline', placeholder: 'Display Name', value: displayName, setter: setDisplayName, type: 'default' },
              { icon: 'mail-outline', placeholder: 'Email address', value: email, setter: setEmail, type: 'email-address' },
              { icon: 'call-outline', placeholder: 'Phone Number (optional)', value: phoneNumber, setter: setPhoneNumber, type: 'phone-pad' },
              { icon: 'lock-closed-outline', placeholder: 'Password (min 8 chars)', value: password, setter: setPassword, secure: true },
            ].map((f, i) => (
              <View key={i} style={styles.inputWrap}>
                <Ionicons name={f.icon} size={20} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                <TextInput style={styles.input} placeholder={f.placeholder} placeholderTextColor={COLORS.textLight}
                  value={f.value} onChangeText={f.setter} keyboardType={f.type || 'default'}
                  autoCapitalize="none" secureTextEntry={f.secure} />
              </View>
            ))}

            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
              <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.btnText}>{loading ? 'Creating...' : 'Create Account'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: FONTS.sizes.sm }}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.sm }}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  appName: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.white },
  card: { backgroundColor: COLORS.white, borderRadius: 24, padding: 28, elevation: 10 },
  cardTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary },
  cardSub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 4, marginBottom: 24 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary, paddingVertical: 12 },
  btn: { borderRadius: 14, overflow: 'hidden', marginBottom: 20, marginTop: 6 },
  btnGradient: { justifyContent: 'center', alignItems: 'center', paddingVertical: 15 },
  btnText: { color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: '700' },
});
