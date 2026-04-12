// src/screens/Trip/CreateTripScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import { COLORS, FONTS } from '../../constants';
import { tripService } from '../../services';

const TRIP_TYPES = ['Backpacking', 'Adventure', 'Beach', 'Cultural', 'Road Trip', 'Luxury'];

export default function CreateTripScreen({ navigation, route }) {
  const prefill = route?.params?.destination || '';
  const [destination, setDestination] = useState(prefill);
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [budget, setBudget]           = useState('');
  const [maxMembers, setMaxMembers]   = useState('4');
  const [tripType, setTripType]       = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading]         = useState(false);

  const handleCreate = async () => {
    if (!destination || !startDate || !endDate || !budget) {
      Alert.alert('Missing Fields', 'Please fill in destination, dates, and budget.');
      return;
    }
    setLoading(true);
    try {
      await tripService.createTrip({
        destination,
        startDate,
        endDate,
        budget: Number(budget),
        maxMembers: Number(maxMembers),
        tripType,
        description,
      });
      Alert.alert('Trip Created! 🎉', 'Your trip has been created successfully.', [
        { text: 'View Trips', onPress: () => navigation.navigate('MyTrips') },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create trip. Check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="Create Trip" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <Text style={styles.label}>Destination *</Text>
        <View style={styles.inputWrap}>
          <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} style={styles.icon} />
          <TextInput style={styles.input} placeholder="e.g. Manali, Himachal Pradesh"
            placeholderTextColor={COLORS.textLight} value={destination} onChangeText={setDestination} />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Start Date *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} style={styles.icon} />
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textLight}
                value={startDate} onChangeText={setStartDate} />
            </View>
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>End Date *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} style={styles.icon} />
              <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textLight}
                value={endDate} onChangeText={setEndDate} />
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Budget (₹) *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="wallet-outline" size={18} color={COLORS.textSecondary} style={styles.icon} />
              <TextInput style={styles.input} placeholder="e.g. 15000" placeholderTextColor={COLORS.textLight}
                value={budget} onChangeText={setBudget} keyboardType="numeric" />
            </View>
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Max Members</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="people-outline" size={18} color={COLORS.textSecondary} style={styles.icon} />
              <TextInput style={styles.input} placeholder="4" placeholderTextColor={COLORS.textLight}
                value={maxMembers} onChangeText={setMaxMembers} keyboardType="numeric" />
            </View>
          </View>
        </View>

        <Text style={styles.label}>Trip Type</Text>
        <View style={styles.chips}>
          {TRIP_TYPES.map(type => (
            <TouchableOpacity key={type} style={[styles.chip, tripType === type && styles.chipActive]}
              onPress={() => setTripType(type === tripType ? '' : type)}>
              <Text style={[styles.chipText, tripType === type && styles.chipTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <View style={[styles.inputWrap, { alignItems: 'flex-start', paddingTop: 10 }]}>
          <TextInput style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
            placeholder="Tell potential buddies about this trip..." placeholderTextColor={COLORS.textLight}
            value={description} onChangeText={setDescription} multiline />
        </View>

        <TouchableOpacity style={[styles.createBtn, loading && { opacity: 0.7 }]}
          onPress={handleCreate} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <><Ionicons name="airplane" size={20} color={COLORS.white} /><Text style={styles.createBtnText}>Create Trip</Text></>
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6, marginTop: 14 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary, paddingVertical: 12 },
  row: { flexDirection: 'row' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },
  chipTextActive: { color: COLORS.white },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, marginTop: 24, gap: 10 },
  createBtnText: { color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: '800' },
});
