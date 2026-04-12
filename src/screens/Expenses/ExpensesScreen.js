// src/screens/Expenses/ExpensesScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Header from '../../components/common/Header';
import { COLORS, FONTS } from '../../constants';
import { expenseService } from '../../services';

const CATEGORIES = [
  { label: 'Food',     icon: 'restaurant-outline',        color: '#E74C3C' },
  { label: 'Stay',     icon: 'bed-outline',               color: '#3498DB' },
  { label: 'Travel',   icon: 'car-outline',               color: '#2ECC71' },
  { label: 'Activity', icon: 'bicycle-outline',           color: '#F39C12' },
  { label: 'Shopping', icon: 'bag-outline',               color: '#9B59B6' },
  { label: 'Other',    icon: 'ellipsis-horizontal-outline', color: '#95A5A6' },
];

const SAMPLE = [
  { _id: '1', description: 'Hotel – 3 nights',     amount: 6000, category: 'Stay',     paidBy: { name: 'You' },   splitAmong: [1,2,3], date: '2025-02-10' },
  { _id: '2', description: 'Lunch at Café 1947',   amount: 1200, category: 'Food',     paidBy: { name: 'Priya' }, splitAmong: [1,2,3], date: '2025-02-11' },
  { _id: '3', description: 'Taxi to Solang Valley', amount: 800, category: 'Travel',   paidBy: { name: 'You' },   splitAmong: [1,2,3], date: '2025-02-11' },
  { _id: '4', description: 'Skiing equipment',     amount: 2400, category: 'Activity', paidBy: { name: 'Rahul' }, splitAmong: [1,2,3], date: '2025-02-12' },
];

const catColor = (cat) => CATEGORIES.find(c => c.label === cat)?.color || COLORS.primary;
const catIcon  = (cat) => CATEGORIES.find(c => c.label === cat)?.icon  || 'cash-outline';

export default function ExpensesScreen() {
  const navigation = useNavigation();
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [desc, setDesc]           = useState('');
  const [amount, setAmount]       = useState('');
  const [category, setCategory]   = useState('Food');
  const [adding, setAdding]       = useState(false);

  useEffect(() => { loadExpenses(); }, []);

  const loadExpenses = async () => {
    try {
      const res = await expenseService.getTripExpenses('general');
      setExpenses(res.data?.expenses || []);
    } catch {
      setExpenses(SAMPLE);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!desc || !amount) { Alert.alert('Error', 'Please fill in all fields'); return; }
    setAdding(true);
    try {
      await expenseService.addExpense({ description: desc, amount: Number(amount), category });
      Alert.alert('Added!', `₹${amount} for "${desc}" added.`);
      setShowModal(false); setDesc(''); setAmount(''); setCategory('Food');
      loadExpenses();
    } catch {
      // Demo mode
      setExpenses(prev => [...prev, { _id: Date.now().toString(), description: desc, amount: Number(amount), category, paidBy: { name: 'You' }, splitAmong: [1,2,3], date: new Date().toISOString().slice(0,10) }]);
      setShowModal(false); setDesc(''); setAmount(''); setCategory('Food');
    } finally {
      setAdding(false);
    }
  };

  const total   = expenses.reduce((s, e) => s + e.amount, 0);
  const myShare = expenses.reduce((s, e) => s + e.amount / (e.splitAmong?.length || 1), 0);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="Expenses" onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        rightIcon="add" onRightPress={() => setShowModal(true)} />

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryAmt}>₹{total.toLocaleString('en-IN')}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: COLORS.accent }]}>
          <Text style={styles.summaryLabel}>Your Share</Text>
          <Text style={styles.summaryAmt}>₹{Math.round(myShare).toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {loading
        ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        : <FlatList data={expenses} keyExtractor={i => i._id} contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={[styles.catIcon, { backgroundColor: `${catColor(item.category)}20` }]}>
                  <Ionicons name={catIcon(item.category)} size={22} color={catColor(item.category)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expDesc}>{item.description}</Text>
                  <Text style={styles.expMeta}>Paid by {item.paidBy?.name}  •  Split {item.splitAmong?.length || 1} ways  •  {item.date?.slice(0,10)}</Text>
                </View>
                <View>
                  <Text style={styles.expAmt}>₹{item.amount?.toLocaleString('en-IN')}</Text>
                  <Text style={styles.expShare}>₹{Math.round(item.amount / (item.splitAmong?.length || 1))}/person</Text>
                </View>
              </View>
            )}
          />
      }

      {/* Add Expense Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={{ flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => setShowModal(false)}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Expense</Text>

            <Text style={styles.inputLabel}>Description</Text>
            <View style={styles.inputWrap}>
              <TextInput style={styles.input} placeholder="e.g. Dinner at café" placeholderTextColor={COLORS.textLight} value={desc} onChangeText={setDesc} />
            </View>

            <Text style={styles.inputLabel}>Amount (₹)</Text>
            <View style={styles.inputWrap}>
              <TextInput style={styles.input} placeholder="0" placeholderTextColor={COLORS.textLight} value={amount} onChangeText={setAmount} keyboardType="numeric" />
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c.label}
                  style={[{ flexDirection:'row', alignItems:'center', paddingHorizontal:12, paddingVertical:8, borderRadius:20, borderWidth:1, borderColor:COLORS.border, backgroundColor:COLORS.white },
                    category === c.label && { backgroundColor:c.color, borderColor:c.color }]}
                  onPress={() => setCategory(c.label)}>
                  <Ionicons name={c.icon} size={14} color={category === c.label ? COLORS.white : COLORS.textSecondary} />
                  <Text style={{ marginLeft:4, fontSize:FONTS.sizes.xs, color:category === c.label ? COLORS.white : COLORS.textSecondary, fontWeight:'600' }}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.addBtn, adding && { opacity:0.7 }]} onPress={handleAdd} disabled={adding}>
              <Text style={{ color:COLORS.white, fontSize:FONTS.sizes.base, fontWeight:'800' }}>
                {adding ? 'Adding...' : 'Add Expense'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection:'row', padding:16, gap:12 },
  summaryCard: { flex:1, borderRadius:16, padding:16 },
  summaryLabel: { color:'rgba(255,255,255,0.8)', fontSize:FONTS.sizes.xs, fontWeight:'600' },
  summaryAmt: { color:COLORS.white, fontSize:FONTS.sizes.xl, fontWeight:'800', marginTop:4 },
  card: { flexDirection:'row', alignItems:'center', backgroundColor:COLORS.white, borderRadius:14, padding:14, marginBottom:10, elevation:1, gap:12 },
  catIcon: { width:44, height:44, borderRadius:12, justifyContent:'center', alignItems:'center' },
  expDesc: { fontSize:FONTS.sizes.md, fontWeight:'700', color:COLORS.textPrimary },
  expMeta: { fontSize:FONTS.sizes.xs, color:COLORS.textSecondary, marginTop:3 },
  expAmt: { fontSize:FONTS.sizes.md, fontWeight:'800', color:COLORS.textPrimary, textAlign:'right' },
  expShare: { fontSize:FONTS.sizes.xs, color:COLORS.textSecondary, textAlign:'right', marginTop:2 },
  modalCard: { backgroundColor:COLORS.white, borderTopLeftRadius:24, borderTopRightRadius:24, padding:24, paddingBottom:40 },
  modalHandle: { width:40, height:4, backgroundColor:COLORS.border, borderRadius:2, alignSelf:'center', marginBottom:16 },
  modalTitle: { fontSize:FONTS.sizes.xl, fontWeight:'800', color:COLORS.textPrimary, marginBottom:16 },
  inputLabel: { fontSize:FONTS.sizes.sm, fontWeight:'700', color:COLORS.textPrimary, marginBottom:6, marginTop:12 },
  inputWrap: { backgroundColor:COLORS.background, borderRadius:12, borderWidth:1, borderColor:COLORS.border, paddingHorizontal:14 },
  input: { fontSize:FONTS.sizes.md, color:COLORS.textPrimary, paddingVertical:12 },
  addBtn: { backgroundColor:COLORS.primary, borderRadius:14, padding:16, alignItems:'center', marginTop:20 },
});
