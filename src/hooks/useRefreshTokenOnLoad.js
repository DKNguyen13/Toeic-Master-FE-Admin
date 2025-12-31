import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAccessToken } from "../config/axios";

const useRefreshTokenOnLoad = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await api.post("/auth/refresh-token/admin", {}, { withCredentials: true });
        const { newAccessToken } = res.data.data;
        setAccessToken(newAccessToken);
      } catch (err) {
        console.error("Refresh token invalid:", err);
        sessionStorage.clear();
        setAccessToken(null);
        navigate("/login");
      }
    };
    refresh();
  }, [navigate]);
};

export default useRefreshTokenOnLoad;