import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const channelService = {
  getMyChannels: (params) => baseService.get(ENDPOINTS.CHANNELS.MY, { params }),
  createOrGetDM: (data) => baseService.post(ENDPOINTS.CHANNELS.DM, data),
  createGroupChannel: (data) => baseService.post(ENDPOINTS.CHANNELS.GROUP, data),
  getChannel: (id) => baseService.get(ENDPOINTS.CHANNELS.DETAIL(id)),
  updateChannel: (id, data) => baseService.put(ENDPOINTS.CHANNELS.DETAIL(id), data),
  uploadChannelImage: (id, data) => baseService.post(ENDPOINTS.CHANNELS.IMAGE(id), data),
  addMember: (id, data) => baseService.post(ENDPOINTS.CHANNELS.MEMBERS(id), data),
  removeMember: (id, userId) => baseService.delete(ENDPOINTS.CHANNELS.REMOVE_MEMBER(id, userId)),
  leaveChannel: (id) => baseService.delete(ENDPOINTS.CHANNELS.LEAVE(id)),
  muteChannel: (id, data) => baseService.patch(ENDPOINTS.CHANNELS.MUTE(id), data),
  markAllRead: (id, data) => baseService.patch(ENDPOINTS.CHANNELS.READ(id), data),
};
