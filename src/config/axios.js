import axios from "axios";
import { config } from "./env.config";

const api = axios.create({
  baseURL: `${config.apiBaseUrl}/api`,
  withCredentials: true,
});

const AUTH_STORAGE_KEYS = [
  "adminAccessToken",
  "fullname",
  "email",
  "phone",
  "avatarUrl",
  "role",
  "userId",
  "dob",
];

const getStoredAccessToken = () => localStorage.getItem("adminAccessToken") || sessionStorage.getItem("adminAccessToken") || null;

const clearAuthStorage = () => {
  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

let accessToken = getStoredAccessToken();
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem("adminAccessToken", token);
    // Backward-compatible cleanup if older sessions used sessionStorage.
    sessionStorage.removeItem("adminAccessToken");
  } else {
    localStorage.removeItem("adminAccessToken");
    sessionStorage.removeItem("adminAccessToken");
  }
};

export const clearAuthData = () => {
  accessToken = null;
  clearAuthStorage();
};

api.interceptors.request.use((req) => {
  if (accessToken && req.headers) {
    req.headers.Authorization = `Bearer ${accessToken}`;
  }
  return req;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url && originalRequest.url.includes("/auth/refresh-token/admin")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post("/auth/refresh-token/admin");
        const newAccessToken = res.data.data?.newAccessToken;
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearAuthData();
        window.dispatchEvent(new Event("userUpdated"));
        return Promise.reject({ ...err, redirectToLogin: true });
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

export const isLoggedIn = () => !!localStorage.getItem("adminAccessToken");