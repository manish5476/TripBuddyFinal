// App.js
import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthNavigator, AppNavigator } from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/Auth/OnboardingScreen';
import { COLORS } from './src/constants';

const RootNavigator = () => {
  const { user, loading } = useAuth();
  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
      <ActivityIndicator size="large" color={COLORS.white} />
    </View>
  );
  if (!user) return <AuthNavigator />;
  if (user.requiresOnboarding || user.requiresAgeVerification) return <OnboardingScreen />;
  return <AppNavigator />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <Toast />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
