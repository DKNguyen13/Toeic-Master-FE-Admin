import React, { useEffect, useState, ReactNode } from "react";
import { useLocation, Navigate } from "react-router-dom";
import api, { setAccessToken } from "../config/axios";
import NotFound from "../pages/NotFound/NotFound";
import LoadingSkeleton from "../components/common/LoadingSpinner/LoadingSkeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: ("user" | "admin")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true; // Ngăn memory leak

    const fetchRole = async () => {
      const token = sessionStorage.getItem("adminAccessToken");
      if (token) setAccessToken(token);

      try {
        const res = await api.get("/auth/check-role");
        if (isMounted) {
          const userRole = res.data.data?.role?.toLowerCase() as "user" | "admin" | null;
          setRole(userRole);
        }
      } catch (err) {
        console.error("Fetching role error:", err);
        if (isMounted) setRole(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRole();

    return () => {
      isMounted = false; 
    };
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (!role) return <Navigate to="/login" state={{ from: location }} replace />;

  if (!allowedRoles.includes(role)) return <NotFound />;

  return <>{children}</>;
};

export default ProtectedRoute;