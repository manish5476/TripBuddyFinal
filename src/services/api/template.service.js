import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const templateService = {
  listTemplates: (params) => baseService.get(ENDPOINTS.TEMPLATES.ALL, { params }),
  createTemplate: (data) => baseService.post(ENDPOINTS.TEMPLATES.CREATE, data),
  getTemplate: (id) => baseService.get(ENDPOINTS.TEMPLATES.DETAIL(id)),
  publishTemplate: (id, data) => baseService.put(ENDPOINTS.TEMPLATES.PUBLISH(id), data),
  purchaseTemplate: (id, data) => baseService.post(ENDPOINTS.TEMPLATES.PURCHASE(id), data),
  rateTemplate: (id, data) => baseService.post(ENDPOINTS.TEMPLATES.RATE(id), data),
};
