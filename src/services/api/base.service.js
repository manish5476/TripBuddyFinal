import apiClient from '../apiClient';

/**
 * Base service wrapper that standardizes API calls.
 * Automatically unpacks the Axios `data` property and centralizes error throwing.
 */
class BaseService {
  async get(url, config = {}) {
    try {
      const response = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async post(url, data = {}, config = {}) {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async patch(url, data = {}, config = {}) {
    try {
      const response = await apiClient.patch(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async put(url, data = {}, config = {}) {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`API Error [${error.response.status}]:`, error.response.data);
      throw error.response.data; // Makes it easy for the UI to catch error.message
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error: No response received');
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
      throw error;
    }
  }
}

export const baseService = new BaseService();
