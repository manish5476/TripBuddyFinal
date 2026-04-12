import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const buddyService = {
  findBuddies: (filters = {}) =>
    baseService.get(ENDPOINTS.BUDDIES.FIND, { params: filters }),
  // filters = { destination, startDate, endDate }

  sendRequest: (userId) =>
    baseService.post(ENDPOINTS.BUDDIES.REQUEST, { userId }),

  getMatches: () =>
    baseService.get(ENDPOINTS.BUDDIES.MATCHES),

  acceptRequest: (requestId) =>
    baseService.put(ENDPOINTS.BUDDIES.ACCEPT(requestId)),

  rejectRequest: (requestId) =>
    baseService.put(ENDPOINTS.BUDDIES.REJECT(requestId)),
};
