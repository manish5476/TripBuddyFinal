import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const exploreService = {
  getExploreFeed: (params) => baseService.get(ENDPOINTS.EXPLORE.FEED, { params }),
  getLiveGlobe: (params) => baseService.get(ENDPOINTS.EXPLORE.LIVE_GLOBE, { params }),
  getNearbyStops: (params) => baseService.get(ENDPOINTS.EXPLORE.NEARBY_STOPS, { params }),
  getTrendingHashtags: () => baseService.get(ENDPOINTS.EXPLORE.TRENDING),
};
