// src/screens/Auth/ForgotPasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../constants';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) { Alert.alert('Error', 'Please enter your email address'); return; }
    setLoading(true);
    // TODO: Connect to backend auth.service.js forgotPassword endpoint
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Link Sent', 'If an account exists, a password reset link has been sent to your email.');
      navigation.navigate('Login');
    }, 1500);
  };

  return (
    <LinearGradient colors={[COLORS.primary, '#0a1628']} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Ionicons name="lock-closed" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.appName}>Recover Password</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Forgot Password?</Text>
            <Text style={styles.cardSub}>Enter your registered email address and we'll send you a link to reset your password.</Text>

            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Email address" placeholderTextColor={COLORS.textLight}
                value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <TouchableOpacity style={[styles.loginBtn, loading && { opacity: 0.7 }]} onPress={handleReset} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.loginGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.loginText}>{loading ? 'Sending link...' : 'Send Reset Link'}</Text>
                <Ionicons name="paper-plane" size={20} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  backBtn: { position: 'absolute', top: 50, left: SPACING.lg, zIndex: 10 },
  logoSection: { alignItems: 'center', marginBottom: SPACING.xl },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.sm, elevation: 8 },
  appName: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.white, letterSpacing: 1 },
  card: { backgroundColor: COLORS.white, borderRadius: 24, padding: SPACING.lg, elevation: 10 },
  cardTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary },
  cardSub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.xs, marginBottom: SPACING.lg, lineHeight: 20 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary, paddingVertical: 12 },
  loginBtn: { borderRadius: 14, overflow: 'hidden' },
  loginGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 8 },
  loginText: { color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: '700' },
});
