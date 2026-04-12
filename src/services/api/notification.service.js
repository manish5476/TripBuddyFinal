import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const notificationService = {
  getNotifications: (params) => baseService.get(ENDPOINTS.NOTIFICATIONS.ALL, { params }),
  getUnreadCount: () => baseService.get(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),
  markRead: (data) => baseService.put(ENDPOINTS.NOTIFICATIONS.READ, data),
  deleteNotification: (id) => baseService.delete(ENDPOINTS.NOTIFICATIONS.DELETE(id)),
};
