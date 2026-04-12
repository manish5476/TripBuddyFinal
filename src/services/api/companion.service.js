import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const companionService = {
  sendRequest: (data) => baseService.post(ENDPOINTS.COMPANIONS.REQUEST, data),
  respondRequest: (id, data) => baseService.put(ENDPOINTS.COMPANIONS.RESPOND(id), data),
  getPendingRequests: () => baseService.get(ENDPOINTS.COMPANIONS.PENDING),
  getMyCompanions: () => baseService.get(ENDPOINTS.COMPANIONS.MY),
  getNearbyTravelers: (params) => baseService.get(ENDPOINTS.COMPANIONS.NEARBY, { params }),
  removeCompanion: (companionId) => baseService.delete(ENDPOINTS.COMPANIONS.REMOVE(companionId)),
  createTravelGroup: (data) => baseService.post(ENDPOINTS.COMPANIONS.GROUPS, data),
  getTravelGroup: (id) => baseService.get(ENDPOINTS.COMPANIONS.GROUP_DETAIL(id)),
};
