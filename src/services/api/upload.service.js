import { baseService } from './base.service';
import { ENDPOINTS } from '../../constants';

export const uploadService = {
  uploadSingleImage: (data) => baseService.post(ENDPOINTS.UPLOADS.IMAGE, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadMultipleImages: (data) => baseService.post(ENDPOINTS.UPLOADS.IMAGES, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadVideo: (data) => baseService.post(ENDPOINTS.UPLOADS.VIDEO, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadAudio: (data) => baseService.post(ENDPOINTS.UPLOADS.AUDIO, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadDocument: (data) => baseService.post(ENDPOINTS.UPLOADS.DOCUMENT, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteAsset: (data) => baseService.delete(ENDPOINTS.UPLOADS.DELETE, { data }),
  getUploadSignature: () => baseService.get(ENDPOINTS.UPLOADS.SIGNATURE),
};
