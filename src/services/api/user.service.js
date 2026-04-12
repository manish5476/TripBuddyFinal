import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const userService = {
  searchUsers: (params) => baseService.get(ENDPOINTS.USERS.SEARCH, { params }),
  getUser: (username) => baseService.get(ENDPOINTS.USERS.PROFILE(username)),
  follow: (userId) => baseService.post(ENDPOINTS.USERS.FOLLOW(userId)),
  unfollow: (userId) => baseService.delete(ENDPOINTS.USERS.FOLLOW(userId)),
  getFollowers: (userId, params) => baseService.get(ENDPOINTS.USERS.FOLLOWERS(userId), { params }),
  getFollowing: (userId, params) => baseService.get(ENDPOINTS.USERS.FOLLOWING(userId), { params }),
  blockUser: (userId) => baseService.post(ENDPOINTS.USERS.BLOCK(userId)),
  unblockUser: (userId) => baseService.delete(ENDPOINTS.USERS.BLOCK(userId)),
};
