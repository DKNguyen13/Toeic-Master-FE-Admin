import { useEffect, useState } from "react";
import { userService } from "../services/userService";
import { formatDateDDMMYY } from "../utils/formatDateDDMMYY";

const pageSize = 8;

export const useUsers = (currentPage: number) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const res = await userService.getUsers(page, pageSize);
      const data = res.data.data;

      setUsers(
        data.users.map((user: any, index: number) => ({
          id: (page - 1) * pageSize + index + 1,
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          role: user.role,
          authType: user.authType || "normal",
          registerDate: user.createdAt
            ? formatDateDDMMYY(user.createdAt)
            : "",
          status: user.isActive ? "Active" : "Inactive",
        }))
      );

      setTotalUsers(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  return {
    users,
    setUsers,
    loading,
    totalUsers,
    fetchUsers,
  };
};