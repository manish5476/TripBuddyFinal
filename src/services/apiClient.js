// src/services/apiClient.js
// ─────────────────────────────────────────────────
// Central Axios instance — all API calls go through here
// ─────────────────────────────────────────────────
import axios from 'axios';
import curlirize from 'axios-curlirize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// Logs all outgoing requests as cURL commands in the console
curlirize(apiClient);

// ── Request Interceptor ─────────────────────────
// Automatically attaches JWT token to every request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ────────────────────────
// Handles 401 (token expired) globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Navigation to login is handled by AuthContext
    }
    return Promise.reject(error);
  }
);

export default apiClient;
