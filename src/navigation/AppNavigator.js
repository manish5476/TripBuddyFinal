// src/navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import Sidebar from '../components/common/Sidebar';
import { COLORS } from '../constants';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import CreateJourneyScreen from '../screens/Home/CreateJourneyScreen';
import ExploreMapScreen from '../screens/Home/ExploreMapScreen';
import MyJourneysScreen from '../screens/Trip/MyJourneysScreen';
import JourneyDetailScreen from '../screens/Trip/JourneyDetailScreen';
import CreateStopScreen from '../screens/Trip/CreateStopScreen';
import JourneyTimelineScreen from '../screens/Trip/JourneyTimelineScreen';
import StopDetailScreen from '../screens/Trip/StopDetailScreen';
import MyTripsScreen from '../screens/Trip/MyTripsScreen';
import CreateTripScreen from '../screens/Trip/CreateTripScreen';
import TripDetailScreen from '../screens/Trip/TripDetailScreen';
import FindBuddiesScreen from '../screens/Buddy/FindBuddiesScreen';
import BuddyProfileScreen from '../screens/Buddy/BuddyProfileScreen';
import ChatListScreen from '../screens/Chat/ChatListScreen';
import ChatRoomScreen from '../screens/Chat/ChatRoomScreen';
import ExpensesScreen from '../screens/Expenses/ExpensesScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import SecurityScreen from '../screens/Profile/SecurityScreen';
import SettingsScreen from '../screens/Profile/SettingsScreen';
import PrivacyScreen from '../screens/Profile/PrivacyScreen';
import NotificationsScreen from '../screens/Profile/NotificationsScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import ReelFeedScreen from '../screens/Reels/ReelFeedScreen';
import ExploreReelsScreen from '../screens/Reels/ExploreReelsScreen';
import CreateReelScreen from '../screens/Reels/CreateReelScreen';
import CreateGroupScreen from '../screens/Chat/CreateGroupScreen';
import ChannelInfoScreen from '../screens/Chat/ChannelInfoScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// ── Bottom Tabs ────────────────────────────────
const BottomTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: COLORS.secondary,
      tabBarInactiveTintColor: COLORS.textLight,
      tabBarStyle: { backgroundColor: 'rgba(255,255,255,0.92)', borderTopColor: COLORS.border, height: 65, paddingBottom: 8, paddingTop: 6, elevation: 10, position: 'absolute' },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
      tabBarIcon: ({ focused, color, size }) => {
        if (route.name === 'Log') {
          return (
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.slate900, justifyContent: 'center', alignItems: 'center', marginTop: -20, shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}>
              <Ionicons name="add" size={32} color={COLORS.white} />
            </View>
          );
        }

        const icons = {
          Feed:    focused ? 'home'           : 'home-outline',
          Chats:   focused ? 'chatbubbles'    : 'chatbubbles-outline',
          Buddies: focused ? 'people'         : 'people-outline',
          Profile: focused ? 'person'         : 'person-outline',
        };
        return <Ionicons name={icons[route.name]} size={26} color={color} />;
      },
    })}>
    {/* HomeScreen — journeyService.listPublicJourneys */}
    <Tab.Screen name="Feed" component={HomeScreen} options={{ tabBarLabel: 'Feed' }} />
    {/* CreateJourney FAB — journeyService.createJourney */}
    <Tab.Screen name="Log" component={CreateJourneyScreen} options={{ tabBarLabel: '' }} />
    {/* Chats — chatService */}
    <Tab.Screen name="Chats" component={ChatListScreen} options={{ tabBarLabel: 'Chats' }} />
    {/* FindBuddies — userService */}
    <Tab.Screen name="Buddies" component={FindBuddiesScreen} options={{ tabBarLabel: 'Buddies' }} />
    {/* EditProfile — authService */}
    <Tab.Screen name="Profile" component={EditProfileScreen} options={{ tabBarLabel: 'Profile' }} />
  </Tab.Navigator>
);

// ── Drawer ─────────────────────────────────────
const DrawerNav = () => (
  <Drawer.Navigator
    drawerContent={(props) => <Sidebar {...props} />}
    screenOptions={{ headerShown: false, drawerStyle: { width: '78%' }, swipeEdgeWidth: 60 }}>
    <Drawer.Screen name="MainTabs" component={BottomTabs} />
    {/* Expenses — expenseService */}
    <Drawer.Screen name="Expenses" component={ExpensesScreen} />
  </Drawer.Navigator>
);

// ── Auth Stack ─────────────────────────────────
export const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// ── App Stack ──────────────────────────────────
export const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Drawer" component={DrawerNav} />
    <Stack.Screen name="CreateJourney" component={CreateJourneyScreen} />
    <Stack.Screen name="ExploreMap" component={ExploreMapScreen} />
    <Stack.Screen name="JourneyDetail" component={JourneyDetailScreen} />
    <Stack.Screen name="CreateStop" component={CreateStopScreen} />
    <Stack.Screen name="JourneyTimeline" component={JourneyTimelineScreen} />
    <Stack.Screen name="StopDetail" component={StopDetailScreen} />
    <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
    <Stack.Screen name="TripDetail" component={TripDetailScreen} />
    <Stack.Screen name="BuddyProfile" component={BuddyProfileScreen} />
    <Stack.Screen name="FindBuddies" component={FindBuddiesScreen} />
    <Stack.Screen name="MyJourneys" component={MyJourneysScreen} />
    <Stack.Screen name="MyTrips" component={MyTripsScreen} />
    <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Security" component={SecurityScreen} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="ReelFeed" component={ReelFeedScreen} />
    <Stack.Screen name="ExploreReels" component={ExploreReelsScreen} />
    <Stack.Screen name="CreateReel" component={CreateReelScreen} />
    <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
    <Stack.Screen name="ChannelInfo" component={ChannelInfoScreen} />
  </Stack.Navigator>
);
