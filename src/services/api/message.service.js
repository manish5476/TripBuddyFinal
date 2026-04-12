// src/services/api/message.service.js
import apiClient from '../apiClient';
import { ENDPOINTS } from '../../constants';

/**
 * Direct apiClient calls (not via baseService) so we can:
 *   1. Set multipart/form-data for media/voice uploads
 *   2. Propagate the full Axios error (with .response.data) to callers
 */

// Helper: wrap apiClient and rethrow full Axios error
const call = async (fn) => {
  const res = await fn();
  return res.data;
};

export const messageService = {
  // GET /:channelId?before=<seq>&limit=<n>
  getMessages: (channelId, params) =>
    call(() => apiClient.get(ENDPOINTS.MESSAGES.CHANNEL(channelId), { params })),

  // POST /:channelId  – text/location/stop_share/journey_share/reel_share/expense_share
  sendMessage: (channelId, data) =>
    call(() => apiClient.post(ENDPOINTS.MESSAGES.CHANNEL(channelId), data)),

  // POST /:channelId/media – multipart FormData with media[] files
  sendMediaMessage: (channelId, formData) =>
    call(() =>
      apiClient.post(ENDPOINTS.MESSAGES.MEDIA(channelId), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // media uploads can take longer
      })
    ),

  // POST /:channelId/voice – multipart FormData with single audio file
  sendVoiceNote: (channelId, formData) =>
    call(() =>
      apiClient.post(ENDPOINTS.MESSAGES.VOICE(channelId), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      })
    ),

  // POST /:channelId/poll – { question, options[], isMultiChoice, expiresInHours }
  sendPoll: (channelId, data) =>
    call(() => apiClient.post(ENDPOINTS.MESSAGES.POLL(channelId), data)),

  // PUT /:messageId – edit text (15-min window)
  editMessage: (messageId, data) =>
    call(() => apiClient.put(ENDPOINTS.MESSAGES.DETAIL(messageId), data)),

  // DELETE /:messageId – soft delete
  deleteMessage: (messageId) =>
    call(() => apiClient.delete(ENDPOINTS.MESSAGES.DETAIL(messageId))),

  // POST /:messageId/react – { emoji } toggles reaction
  reactToMessage: (messageId, data) =>
    call(() => apiClient.post(ENDPOINTS.MESSAGES.REACT(messageId), data)),

  // POST /:messageId/vote – { optionIndexes: [0] } vote on poll
  votePoll: (messageId, data) =>
    call(() => apiClient.post(ENDPOINTS.MESSAGES.VOTE(messageId), data)),
};
