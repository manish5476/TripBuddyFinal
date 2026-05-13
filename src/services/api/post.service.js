import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

// Backend stores journey posts as Stop documents. This service gives the app
// the product-facing "post" vocabulary while preserving the existing API shape.
export const postService = {
  offlineSync: (data) => baseService.post(ENDPOINTS.POSTS.SYNC, data),
  createPost: (data, config = { headers: { 'Content-Type': 'multipart/form-data' } }) =>
    baseService.post(ENDPOINTS.POSTS.CREATE, data, config),
  getJourneyPosts: (journeyId, params) => baseService.get(ENDPOINTS.POSTS.BY_JOURNEY(journeyId), { params }),
  getPost: (id, params) => baseService.get(ENDPOINTS.POSTS.DETAIL(id), { params }),
  updatePost: (id, data) => baseService.put(ENDPOINTS.POSTS.DETAIL(id), data),
  deletePost: (id) => baseService.delete(ENDPOINTS.POSTS.DETAIL(id)),
  reactToPost: (id, data) => baseService.post(ENDPOINTS.POSTS.REACT(id), data),
  addComment: (id, data) => baseService.post(ENDPOINTS.POSTS.COMMENTS(id), data),
  deleteComment: (postId, commentId) => baseService.delete(ENDPOINTS.POSTS.DELETE_COMMENT(postId, commentId)),
  savePost: (id) => baseService.post(ENDPOINTS.POSTS.SAVE(id)),
  attachBeenHere: (id, data) => baseService.post(ENDPOINTS.POSTS.BEEN_HERE(id), data),
};
