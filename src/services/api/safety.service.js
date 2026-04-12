import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const safetyService = {
  // SOS
  triggerSOS: (data) => baseService.post(ENDPOINTS.SAFETY.SOS_TRIGGER, data),
  updateSOSLocation: (id, data) => baseService.put(ENDPOINTS.SAFETY.SOS_LOCATION(id), data),
  respondToSOS: (id, data) => baseService.post(ENDPOINTS.SAFETY.SOS_RESPOND(id), data),
  resolveSOS: (id, data) => baseService.put(ENDPOINTS.SAFETY.SOS_RESOLVE(id), data),

  // Compass Session
  updateCompassLocation: (id, data) => baseService.put(ENDPOINTS.SAFETY.COMPASS_LOCATION(id), data),
  endCompassSession: (id) => baseService.put(ENDPOINTS.SAFETY.COMPASS_END(id)),

  // Check-in
  checkIn: (data) => baseService.post(ENDPOINTS.SAFETY.CHECKIN, data),
  updateCheckInTimer: (data) => baseService.put(ENDPOINTS.SAFETY.CHECKIN_TIMER, data),

  // Trusted Contacts
  addTrustedContact: (data) => baseService.post(ENDPOINTS.SAFETY.TRUSTED, data),
  removeTrustedContact: (userId) => baseService.delete(ENDPOINTS.SAFETY.REMOVE_TRUSTED(userId)),

  // Blackout Zones
  addBlackoutZone: (data) => baseService.post(ENDPOINTS.SAFETY.BLACKOUT_ZONES, data),
  removeBlackoutZone: (zoneId) => baseService.delete(ENDPOINTS.SAFETY.REMOVE_BLACKOUT(zoneId)),
};
