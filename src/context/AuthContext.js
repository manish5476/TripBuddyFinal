// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services';
import { socketService } from '../services/socketService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start — restore session
  useEffect(() => { restoreSession(); }, []);

  const restoreSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        const cachedUser = JSON.parse(storedUser);
        setUser(cachedUser);
        socketService.connect(storedToken);
        authService.getMe()
          .then(async (res) => {
            await AsyncStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
          })
          .catch(() => {});
      }
    } catch (e) {
      console.log('Session restore error:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      // Backend sendToken returns { success, message, token, data: user }
      const { token: t, data: u } = res;
      if (!t || !u) throw new Error('Invalid response from server');

      await AsyncStorage.setItem('token', t);
      await AsyncStorage.setItem('user', JSON.stringify(u));
      setToken(t);
      setUser(u);
      socketService.connect(t);
      return { success: true };
    } catch (e) {
      return {
        success: false,
        message: e.message || e.error || 'Login failed'
      };
    }
  };

  const refreshMe = async () => {
    const res = await authService.getMe();
    const freshUser = res.data;
    await AsyncStorage.setItem('user', JSON.stringify(freshUser));
    setUser(freshUser);
    return freshUser;
  };

  const register = async (userData) => {
    try {
      const res = await authService.register(userData);
      const { token: t, data: u } = res;
      if (!t || !u) throw new Error('Registration failed: Missing data');

      await AsyncStorage.setItem('token', t);
      await AsyncStorage.setItem('user', JSON.stringify(u));
      setToken(t);
      setUser(u);
      socketService.connect(t);
      return { success: true };
    } catch (e) {
      return {
        success: false,
        message: e.message || e.error || 'Registration failed'
      };
    }
  };

  const completeOnboarding = async (data) => {
    try {
      if (data.dateOfBirth) {
        await authService.updateProfile({ dateOfBirth: data.dateOfBirth });
      }
      const res = await authService.completeOnboarding(data);
      const updatedUser = {
        ...user,
        ...res.data,
        requiresOnboarding: false,
        requiresAgeVerification: false,
      };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (e) {
      return {
        success: false,
        message: e.message || e.error || 'Onboarding failed'
      };
    }
  };

  const logout = async () => {
    try { await authService.logout(); } catch (_) { }
    await AsyncStorage.multiRemove(['token', 'user']);
    socketService.disconnect();
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data) => {
    const updated = { ...user, ...data };
    await AsyncStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, refreshMe, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
