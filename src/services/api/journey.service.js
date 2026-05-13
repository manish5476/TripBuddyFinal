import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const journeyService = {
  listPublicJourneys: (params) => baseService.get(ENDPOINTS.JOURNEYS.ALL, { params }),
  createJourney: (data) => baseService.post(ENDPOINTS.JOURNEYS.ALL, data),
  getMyJourneys: (params) => baseService.get(ENDPOINTS.JOURNEYS.MY, { params }),
  getJourney: (id) => baseService.get(ENDPOINTS.JOURNEYS.DETAIL(id)),
  getJourneyMap: (id) => baseService.get(ENDPOINTS.JOURNEYS.MAP(id)),
  updateJourney: (id, data) => baseService.put(ENDPOINTS.JOURNEYS.DETAIL(id), data),
  deleteJourney: (id) => baseService.delete(ENDPOINTS.JOURNEYS.DETAIL(id)),
  
  // Patch endpoints for specific state changes
  endJourney: (id, data) => baseService.patch(ENDPOINTS.JOURNEYS.END(id), data),
  toggleGhostMode: (id) => baseService.patch(ENDPOINTS.JOURNEYS.GHOST(id)),
  updateLiveLocation: (id, data) => baseService.patch(ENDPOINTS.JOURNEYS.LOCATION(id), data),
  
  // Sub-resources
  addTransportSegment: (id, data) => baseService.post(ENDPOINTS.JOURNEYS.SEGMENTS(id), data),
  addCoTraveller: (id, data) => baseService.post(ENDPOINTS.JOURNEYS.CO_TRAVELLERS(id), data),
  removeCoTraveller: (id, userId) => baseService.delete(ENDPOINTS.JOURNEYS.REMOVE_CO_TRAVELLER(id, userId)),
  
  // Future/Additional features
  getWrapCard: (id) => baseService.get(ENDPOINTS.JOURNEYS.WRAP_CARD(id)),
  generateAiNarrative: (id) => baseService.post(ENDPOINTS.JOURNEYS.AI_NARRATIVE(id)),
};
