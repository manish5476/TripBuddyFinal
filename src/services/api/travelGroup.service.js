import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const travelGroupService = {
  getMyGroups: (params) => baseService.get(ENDPOINTS.TRAVEL_GROUPS.MY, { params }),
  createGroup: (data) => baseService.post(ENDPOINTS.TRAVEL_GROUPS.CREATE, data),
  getGroup: (id) => baseService.get(ENDPOINTS.TRAVEL_GROUPS.DETAIL(id)),
  updateGroup: (id, data) => baseService.put(ENDPOINTS.TRAVEL_GROUPS.DETAIL(id), data),
  deleteGroup: (id) => baseService.delete(ENDPOINTS.TRAVEL_GROUPS.DETAIL(id)),

  joinGroup: (id, data) => baseService.post(ENDPOINTS.TRAVEL_GROUPS.JOIN(id), data),
  leaveGroup: (id) => baseService.delete(ENDPOINTS.TRAVEL_GROUPS.LEAVE(id)),
  kickMember: (id, userId) => baseService.delete(ENDPOINTS.TRAVEL_GROUPS.KICK(id, userId)),

  generateInvite: (id) => baseService.post(ENDPOINTS.TRAVEL_GROUPS.INVITE(id)),
  joinByInviteCode: (data) => baseService.post(ENDPOINTS.TRAVEL_GROUPS.JOIN_INVITE, data),

  getGroupExpenses: (id, params) => baseService.get(ENDPOINTS.TRAVEL_GROUPS.EXPENSES(id), { params }),
  linkJourney: (id, data) => baseService.post(ENDPOINTS.TRAVEL_GROUPS.LINK_JOURNEY(id), data),
};
