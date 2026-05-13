// src/screens/Auth/OnboardingScreen.js
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS } from '../../constants';

const PERSONALITIES = [
  { id: 'adventurer', label: 'Adventurer', icon: 'compass' },
  { id: 'planner', label: 'Planner', icon: 'calendar' },
  { id: 'foodie', label: 'Foodie', icon: 'restaurant' },
  { id: 'culture_seeker', label: 'Culture', icon: 'library' },
  { id: 'budget_backpacker', label: 'Backpacker', icon: 'trail-sign' },
  { id: 'relaxed_explorer', label: 'Relaxed', icon: 'sunny' },
];

const BUDGETS = [
  { id: 'budget', label: 'Budget' },
  { id: 'mid_range', label: 'Mid Range' },
  { id: 'premium', label: 'Premium' },
  { id: 'luxury', label: 'Luxury' },
];

export default function OnboardingScreen() {
  const { completeOnboarding, logout, user } = useAuth();
  const [travelPersonality, setTravelPersonality] = useState('adventurer');
  const [budgetStyle, setBudgetStyle] = useState('mid_range');
  const [homeCity, setHomeCity] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [interests, setInterests] = useState('beaches, food, hidden gems');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    if (user?.requiresAgeVerification) {
      if (!dateOfBirth.trim()) {
        Alert.alert('Age required', 'Please enter your date of birth as YYYY-MM-DD.');
        setLoading(false);
        return;
      }
    }

    const result = await completeOnboarding({
      travelPersonality,
      budgetStyle,
      homeCity: homeCity.trim(),
      dateOfBirth: dateOfBirth.trim() || undefined,
      travelInterests: interests.split(',').map((item) => item.trim()).filter(Boolean),
    });
    setLoading(false);
    if (!result.success) Alert.alert('Setup failed', result.message);
  };

  return (
    <LinearGradient colors={[COLORS.primary, '#0a1628']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="map" size={34} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Build your travel identity</Text>
          <Text style={styles.subtitle}>These choices power journey suggestions, local picks, and group recommendations.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Travel personality</Text>
          <View style={styles.grid}>
            {PERSONALITIES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.option, travelPersonality === item.id && styles.optionActive]}
                onPress={() => setTravelPersonality(item.id)}
                activeOpacity={0.85}
              >
                <Ionicons name={item.icon} size={18} color={travelPersonality === item.id ? COLORS.white : COLORS.secondary} />
                <Text style={[styles.optionText, travelPersonality === item.id && styles.optionTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Budget style</Text>
          <View style={styles.chips}>
            {BUDGETS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.chip, budgetStyle === item.id && styles.chipActive]}
                onPress={() => setBudgetStyle(item.id)}
              >
                <Text style={[styles.chipText, budgetStyle === item.id && styles.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {user?.requiresAgeVerification && (
            <>
              <Text style={styles.label}>Date of birth</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.textLight}
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </>
          )}

          <Text style={styles.label}>Home city</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="home-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Delhi, Mumbai, Bengaluru..."
              placeholderTextColor={COLORS.textLight}
              value={homeCity}
              onChangeText={setHomeCity}
            />
          </View>

          <Text style={styles.label}>Interests</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="sparkles-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="beaches, cafes, treks"
              placeholderTextColor={COLORS.textLight}
              value={interests}
              onChangeText={setInterests}
            />
          </View>

          <TouchableOpacity style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleContinue} disabled={loading}>
            <Text style={styles.primaryText}>{loading ? 'Saving...' : 'Enter Trip Buddy'}</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  title: { color: COLORS.white, fontSize: FONTS.sizes.xxl, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.72)', fontSize: FONTS.sizes.sm, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  card: { backgroundColor: COLORS.white, borderRadius: 24, padding: 22 },
  sectionTitle: { fontSize: FONTS.sizes.md, color: COLORS.slate900, fontWeight: '800', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 },
  option: { width: '47%', borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  optionActive: { backgroundColor: COLORS.slate900, borderColor: COLORS.slate900 },
  optionText: { color: COLORS.slate800, fontWeight: '700', fontSize: FONTS.sizes.xs },
  optionTextActive: { color: COLORS.white },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  chipText: { color: COLORS.textSecondary, fontWeight: '700', fontSize: FONTS.sizes.xs },
  chipTextActive: { color: COLORS.white },
  label: { color: COLORS.textSecondary, fontWeight: '700', fontSize: FONTS.sizes.xs, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary, paddingVertical: 12 },
  primaryBtn: { marginTop: 8, height: 54, borderRadius: 16, backgroundColor: COLORS.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '800' },
  logoutBtn: { alignItems: 'center', paddingTop: 16 },
  logoutText: { color: COLORS.textSecondary, fontWeight: '700' },
});
