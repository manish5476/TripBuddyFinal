import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const chatService = {
  getChatRooms: () =>
    baseService.get(ENDPOINTS.CHAT.ROOMS),

  getMessages: (roomId, page = 1) =>
    baseService.get(ENDPOINTS.CHAT.MESSAGES(roomId), { params: { page, limit: 50 } }),

  sendMessage: (roomId, text) =>
    baseService.post(ENDPOINTS.CHAT.SEND(roomId), { text }),
};
