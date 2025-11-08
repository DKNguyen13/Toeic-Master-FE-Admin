import api from "../../config/axios";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import LeftSidebarAdmin from "../../components/LeftSidebarAdmin";

interface VipInfo {
  isActive: boolean;
  endDate: string | null;
  type: "basic" | "advanced" | "premium" | null;
}

interface UserInfo {
  fullname: string;
  email: string;
  phone: string;
  dob: Date | null;
  vip: VipInfo;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserInfo>({
    fullname: "",
    email: "",
    phone: "",
    dob: null,
    vip: { isActive: false, endDate: null, type: null },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("vi-VN");
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const res = await api.get("/auth/profile");
        const data = res.data.data;
        const dobDate = data.dob ? new Date(data.dob) : null;
        setUser({ ...data, dob: dobDate});
        localStorage.setItem("dob", res.data.data.dob || "");
      } catch (err: any) {
        console.error(err);
        setError("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  if (loading) return <div className="min-h-screen flex justify-center items-center">Đang tải...</div>;
  if (error) return <div className="min-h-screen flex justify-center items-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <LeftSidebarAdmin customHeight="h-auto w-64" />

      {/* Form Cài đặt */}
      <div className="flex-1 flex justify-center items-start py-12 px-6">
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Thông tin tài khoản
          </h1>
          <form className="space-y-6">
            {/* Fullname */}
            <div>
              <label className="block text-gray-600 font-medium mb-2">Fullname</label>
              <input
                type="text"
                value={user.fullname}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 cursor-not-allowed"
                readOnly
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-600 font-medium mb-2">Email</label>
              <input
                type="email"
                value={user.email}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 cursor-not-allowed"
                readOnly
              />
            </div>

            {/* Phone & DOB */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <label className="block text-gray-600 font-medium mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={user.phone}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 cursor-not-allowed"
                  readOnly
                />
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block text-gray-600 font-medium mb-2">Ngày sinh</label>
                <input type="text"
                  value={formatDate(user.dob as Date | null)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-100 cursor-not-allowed"
                  readOnly
                />
              </div>
            </div>

            {/* VIP */}
            <div>
              <label className="block text-gray-600 font-medium mb-2">VIP Account</label>
              {user.vip.isActive ? (
                <div className={`inline-flex items-center px-4 py-2 rounded-full font-semibold text-white ${
                  user.vip.type === "basic"
                    ? "bg-gray-400"
                    : user.vip.type === "advanced"
                    ? "bg-blue-500"
                    : "bg-yellow-500 text-gray-900"
                } shadow-md`}>
                  <span className="mr-2">
                    {user.vip.type === "basic" ? "★" : user.vip.type === "advanced" ? "★★" : "★★★"}
                  </span>
                  <span>
                    {"Gói "+ user.vip.type?.toUpperCase()} - đến {formatDate(user.vip.endDate ? new Date(user.vip.endDate) : null)}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center px-4 py-2 rounded-full font-semibold bg-gray-200 text-gray-600 shadow-sm">
                  Chưa kích hoạt
                </div>
              )}
            </div>

            {/* Nút chỉnh sửa */}
            <div className="flex justify-end pt-4">
              <Link to="/admin/profile/update-info"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold shadow-sm">
                Chỉnh sửa
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
