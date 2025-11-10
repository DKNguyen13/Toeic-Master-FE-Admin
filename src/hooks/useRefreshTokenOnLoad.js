import { useEffect } from "react";
import api, { setAccessToken } from "../config/axios";

const useRefreshTokenOnLoad = () => {
  useEffect(() => {
    const refresh = async () => {
      try {
        localStorage.clear();
        const res = await api.post("/auth/refresh-token", {}, { withCredentials: true });
        const { newAccessToken } = res.data.data;
        setAccessToken(newAccessToken);
      } catch (err) {
        console.error("Refresh token invalid:", err);
        sessionStorage.clear();
        setAccessToken(null);
        window.location.href = "/login";
      }
    };
    refresh();
  }, []);
};

export default useRefreshTokenOnLoad;
