import axios from "axios";
import { config } from "./env.config";

const api = axios.create({
  baseURL: `${config.apiBaseUrl}/api`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let accessToken = sessionStorage.getItem("adminAccessToken") || null;
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
    sessionStorage.setItem("adminAccessToken", token);
  } else {
    sessionStorage.removeItem("adminAccessToken");
  }
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
        const res = await api.post("/auth/refresh-token");
        const newAccessToken = res.data.data?.newAccessToken;
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        setAccessToken(null);
        sessionStorage.clear();
        localStorage.clear();
        return Promise.reject({ ...err, redirectToLogin: true });
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

export const isLoggedIn = () => !!sessionStorage.getItem("adminAccessToken");
