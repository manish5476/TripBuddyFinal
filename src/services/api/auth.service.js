import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const authService = {
  register: (data) => baseService.post(ENDPOINTS.AUTH.REGISTER, data),
  login: (email, password) => baseService.post(ENDPOINTS.AUTH.LOGIN, { email, password }),
  logout: () => baseService.post(ENDPOINTS.AUTH.LOGOUT),
  getMe: () => baseService.get(ENDPOINTS.AUTH.ME),
  completeOnboarding: (data) => baseService.put(ENDPOINTS.AUTH.ONBOARDING, data),
  updateProfile: (data) => baseService.put(ENDPOINTS.AUTH.UPDATE_PROFILE, data),
  updatePassword: (data) => baseService.put(ENDPOINTS.AUTH.UPDATE_PASSWORD, data),
  uploadUserAvatar: (data) => baseService.post(ENDPOINTS.AUTH.AVATAR, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadCoverImg: (data) => baseService.post(ENDPOINTS.AUTH.COVER, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updatePrivacy: (data) => baseService.put(ENDPOINTS.AUTH.PRIVACY, data),
  updateNotificationPrefs: (data) => baseService.put(ENDPOINTS.AUTH.NOTIFICATIONS, data),
  deleteAccount: () => baseService.delete(ENDPOINTS.AUTH.ACCOUNT),
};
