import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const tripService = {
  getAllTrips: (filters = {}) =>
    baseService.get(ENDPOINTS.TRIPS.ALL, { params: filters }),

  getMyTrips: () =>
    baseService.get(ENDPOINTS.TRIPS.MY),

  getTripById: (id) =>
    baseService.get(ENDPOINTS.TRIPS.DETAIL(id)),

  createTrip: (data) => {
    const mappedData = {
      name:          data.destination,
      description:   data.description || '',
      routeTo:       data.destination,
      departureDate: data.startDate,
      arrivalDate:   data.endDate,
      maxMembers:    data.maxMembers,
      budget:        data.budget,
    };
    return baseService.post(ENDPOINTS.TRIPS.CREATE, mappedData);
  },
  // data = { destination, startDate, endDate, budget, maxMembers, tripType, description, lat, lng }

  updateTrip: (id, data) =>
    baseService.put(ENDPOINTS.TRIPS.UPDATE(id), data),

  deleteTrip: (id) =>
    baseService.delete(ENDPOINTS.TRIPS.DELETE(id)),
};
