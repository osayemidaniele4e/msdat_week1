import axios from 'axios';
import Vue from 'vue';
import VueCookies from 'vue-cookies';
import store from '@/store'; // eslint-disable-line import/no-cycle
import frontendAuthService from '@/modules/auth/services/frontendAuthService';

const apiConfigs = {
  default: process.env.VUE_APP_API_BASE_URL,
  instance1: process.env.VUE_APP_API_BASE_URL1,
  instance3: process.env.VUE_APP_API_BASE_URL3,
  authInstance: process.env.VUE_APP_API_BASE_URL,
};

const createAxiosInstance = (baseURL, withAuth = false, skipHeaders = false) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 60000, // 60s timeout — prevents indefinite hanging on 3G
  });

  if (!skipHeaders) {
    if (withAuth) {
      instance.interceptors.request.use(
        (config) => {
          const newConfig = { ...config };
          // eslint-disable-next-line camelcase
          const storeToken = store.getters['AUTH_STORE/getToken'];
          const cookieUser = VueCookies.get('msdat-user-details');
          const cookieToken = cookieUser?.tokens?.['access_token'];
          const token = storeToken || cookieToken;
          if (token) {
            newConfig.headers = {
              ...newConfig.headers,
              Authorization: `Bearer ${token}`,
            };
          }
          return newConfig;
        },
        (error) => Promise.reject(error),
      );
    }

    instance.interceptors.request.use(
      (config) => {
        const newConfig = { ...config };
        newConfig.headers = {
          ...newConfig.headers,
          // 'X-MSDAT-AUTH': 'e4e@devoP$ysadmin2025',
        };
        return newConfig;
      },
      (error) => Promise.reject(error),
    );

    // Add frontend JWT interceptor to all instances
    instance.interceptors.request.use(
      async (reqConfig) => {
        try {
          const token = await frontendAuthService.getValidToken();
          reqConfig.headers = { // eslint-disable-line no-param-reassign
            ...reqConfig.headers,
            'X-Frontend-JWT': `Token ${token}`,
          };
        } catch (error) {
          console.error('Failed to add frontend JWT header:', error);
        }
        return reqConfig;
      },
      (error) => Promise.reject(error),
    );
  }

  /* eslint-disable no-underscore-dangle, no-param-reassign */
  // Add response interceptor to handle 401 errors, timeouts and retry
  instance.interceptors.response.use(
    (response) => response, // Pass through successful responses
    async (error) => {
      const originalRequest = error.config;

      // Handle timeout errors — retry once with a longer timeout on slow networks
      if (error.code === 'ECONNABORTED' && !originalRequest._timeoutRetry) {
        console.warn(`Request timed out: ${originalRequest.url}`);
        originalRequest._timeoutRetry = true;
        originalRequest.timeout = 120000; // 2 minute retry
        console.log('Retrying timed-out request with extended timeout...');
        return instance(originalRequest);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        const errorCode = error.response?.data?.code;

        if (errorCode === 'token_not_valid') {
          VueCookies.remove('msdat-user-details');
          store.dispatch('AUTH_STORE/logout');
          Vue.swal({
            toast: true,
            position: 'bottom',
            showConfirmButton: false,
            timer: 5000,
            icon: 'warning',
            title: 'Session Expired',
            text: 'Your session has expired. Please log in again.',
          });
          return Promise.reject(error);
        }

        console.log('Received 401 error, attempting to refresh frontend token...');
        originalRequest._retry = true;

        try {
          const newToken = await frontendAuthService.refreshToken();
          originalRequest.headers['X-Frontend-JWT'] = `Token ${newToken}`;
          console.log('Retrying request with new token...');
          return instance(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed, cannot retry request:', refreshError);
          Vue.swal({
            toast: true,
            position: 'bottom',
            showConfirmButton: false,
            timer: 5000,
            icon: 'error',
            title: 'Authentication Error',
            text: 'Failed to refresh authentication. Please reload the page.',
          });
          return Promise.reject(refreshError);
        }
      }

      Vue.swal({
        toast: true,
        position: 'bottom',
        showConfirmButton: false,
        timer: 5000,
        icon: 'error',
        title: 'Error Occurred',
        text: error.message,
      });

      return Promise.reject(error);
    },
  );
  /* eslint-enable no-underscore-dangle, no-param-reassign */

  return instance;
};

const AxiosInstances = {
  default: createAxiosInstance(apiConfigs.default),
  instance1: createAxiosInstance(apiConfigs.instance1),
  instance3: createAxiosInstance(apiConfigs.instance3),
  authInstance: createAxiosInstance(apiConfigs.authInstance, true),
  noHeadersInstance: createAxiosInstance(apiConfigs.instance3, false, true), // <- No headers
};

export const {
  instance1, instance3, authInstance, noHeadersInstance,
} = AxiosInstances;

export default AxiosInstances.default;
