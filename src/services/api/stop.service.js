import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const stopService = {
  offlineSync: (data) => baseService.post(ENDPOINTS.STOPS.SYNC, data),
  // createStop expects FormData because of 'multipart/form-data'
  createStop: (data, config = { headers: { 'Content-Type': 'multipart/form-data' } }) => baseService.post(ENDPOINTS.STOPS.CREATE, data, config),
  getJourneyStops: (journeyId, params) => baseService.get(ENDPOINTS.STOPS.BY_JOURNEY(journeyId), { params }),
  getStop: (id, params) => baseService.get(ENDPOINTS.STOPS.DETAIL(id), { params }), // accepts source query
  updateStop: (id, data) => baseService.put(ENDPOINTS.STOPS.DETAIL(id), data),
  deleteStop: (id) => baseService.delete(ENDPOINTS.STOPS.DETAIL(id)),
  reactToStop: (id, data) => baseService.post(ENDPOINTS.STOPS.REACT(id), data),
  addComment: (id, data) => baseService.post(ENDPOINTS.STOPS.COMMENTS(id), data),
  deleteComment: (stopId, commentId) => baseService.delete(ENDPOINTS.STOPS.DELETE_COMMENT(stopId, commentId)),
  saveStop: (id) => baseService.post(ENDPOINTS.STOPS.SAVE(id)),
  attachBeenHere: (id, data) => baseService.post(ENDPOINTS.STOPS.BEEN_HERE(id), data),
};
