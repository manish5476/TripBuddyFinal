import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const reviewService = {
  addReview: (userId, rating, comment) =>
    baseService.post(ENDPOINTS.REVIEWS.ADD, { userId, rating, comment }),

  getUserReviews: (userId) =>
    baseService.get(ENDPOINTS.REVIEWS.BY_USER(userId)),
};
