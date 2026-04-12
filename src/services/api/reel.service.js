import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const reelService = {
  getReelFeed: (params) => baseService.get(ENDPOINTS.REELS.FEED, { params }),
  exploreReels: (params) => baseService.get(ENDPOINTS.REELS.EXPLORE, { params }),
  createReel: (data) => baseService.post(ENDPOINTS.REELS.CREATE, data),
  getUserReels: (userId, params) => baseService.get(ENDPOINTS.REELS.BY_USER(userId), { params }),
  getReel: (id) => baseService.get(ENDPOINTS.REELS.DETAIL(id)),
  deleteReel: (id) => baseService.delete(ENDPOINTS.REELS.DETAIL(id)),
  likeReel: (id) => baseService.post(ENDPOINTS.REELS.LIKE(id)),
  reactReel: (id, data) => baseService.post(ENDPOINTS.REELS.REACT(id), data),
  commentReel: (id, data) => baseService.post(ENDPOINTS.REELS.COMMENT(id), data),
  saveReel: (id) => baseService.post(ENDPOINTS.REELS.SAVE(id)),
};
