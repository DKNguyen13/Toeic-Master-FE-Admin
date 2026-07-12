import { useEffect, useRef } from "react";
import api, { clearAuthData, setAccessToken } from "../config/axios";

const useRefreshTokenOnLoad = () => {
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const refresh = async () => {
      try {
        const res = await api.post("/auth/refresh-token/admin", {}, { withCredentials: true });
        const { newAccessToken } = res.data.data;
        setAccessToken(newAccessToken);
        window.dispatchEvent(new Event("userUpdated"));
      } catch (err) {
        const hadUserSession = !!(
          localStorage.getItem("userId") ||
          localStorage.getItem("fullname") ||
          localStorage.getItem("adminAccessToken")
        );

        if (hadUserSession) {
          console.error("Refresh token invalid:", err);
          clearAuthData();
          window.dispatchEvent(new Event("userUpdated"));
        }
      }
    };
    refresh();
  }, []);
};

export default useRefreshTokenOnLoad;