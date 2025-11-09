import api from "../../config/axios";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import LeftSidebarAdmin from "../../components/LeftSidebarAdmin";
import { User, Mail, Phone, Calendar, Crown, Edit, CheckCircle, XCircle } from "lucide-react";

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
  avatarUrl?: string | null;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserInfo>({
    fullname: "",
    email: "",
    phone: "",
    dob: null,
    vip: { isActive: false, endDate: null, type: null },
    avatarUrl: localStorage.getItem("avatarUrl") || "/img/avatar/default_avatar.jpg",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const formatDate = (date: Date | null) => (date ? date.toLocaleDateString("vi-VN") : "");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const res = await api.get("/auth/profile");
        const data = res.data.data;
        const dobDate = data.dob ? new Date(data.dob) : null;
        setUser({
          ...data,
          dob: dobDate,
          avatarUrl: data.avatarUrl || localStorage.getItem("avatarUrl") || "/img/avatar/default_avatar.jpg"
        });
      } catch (err: any) {
        console.error(err);
        setError("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  const getVipConfig = (type: string | null) => {
    switch (type) {
      case "basic":
        return { bg: "bg-gradient-to-r from-gray-300 to-gray-400", icon: "★", label: "BASIC" };
      case "advanced":
        return { bg: "bg-gradient-to-r from-blue-400 to-blue-500", icon: "★★", label: "ADVANCED" };
      case "premium":
        return { bg: "bg-gradient-to-r from-yellow-400 to-yellow-500", icon: "★★★", label: "PREMIUM", textColor: "text-gray-900" };
      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-semibold text-lg">{error}</p>
        </div>
      </div>
    );

  const vipConfig = user.vip.isActive ? getVipConfig(user.vip.type) : null;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <LeftSidebarAdmin customHeight="h-auto w-64" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col py-12 px-6 lg:px-12">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100 opacity-20 rounded-full -mr-24 -mt-24"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-100 opacity-20 rounded-full -ml-24 -mb-24"></div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Thông tin tài khoản</h1>
          <p className="text-gray-500">Quản lý thông tin cá nhân của bạn</p>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Avatar */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center">
              <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center shadow-lg mb-4">
                <img src={user.avatarUrl || "/img/avatar/default_avatar.jpg"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/img/avatar/default_avatar.jpg"; }}
                />
              </div>
              <h2 className="text-xl font-bold break-words text-gray-800">{user.fullname || "Chưa có tên"}</h2>
              <p className="text-gray-500 text-sm">{user.email || "Chưa có email"}</p>
            </div>

            {/* VIP Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className="font-semibold text-gray-800">Trạng thái tài khoản</h3>
              </div>
              {user.vip.isActive && vipConfig ? (
                <div className="space-y-3">
                  <div className={`${vipConfig.bg} ${vipConfig.textColor || "text-white"} rounded-xl p-4 text-center shadow-md`}>
                    <div className="flex items-center justify-center mb-2 space-x-2">
                      <span className="text-2xl">{vipConfig.icon}</span>
                      <span className="font-bold text-lg">{vipConfig.label}</span>
                    </div>
                    <div className="text-sm opacity-90 flex items-center justify-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Đến {formatDate(user.vip.endDate ? new Date(user.vip.endDate) : null)}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-green-600 bg-green-50 rounded-lg p-2 justify-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Tài khoản VIP đang hoạt động</span>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-gray-400 mr-2" />
                    <span className="text-gray-600 font-medium">Chưa kích hoạt</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Nâng cấp VIP để trải nghiệm nhiều tính năng hơn
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Thông tin chi tiết</h2>
                <Link
                  to="/admin/profile/update-info"
                  className="inline-flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-transform duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/** Common function for field box */}
                {[
                  { label: "Họ và tên", value: user.fullname, icon: <User className="w-4 h-4 mr-2 text-blue-600" /> },
                  { label: "Email", value: user.email, icon: <Mail className="w-4 h-4 mr-2 text-blue-600" /> },
                  { label: "Số điện thoại", value: user.phone, icon: <Phone className="w-4 h-4 mr-2 text-blue-600" /> },
                  { label: "Ngày sinh", value: formatDate(user.dob), icon: <Calendar className="w-4 h-4 mr-2 text-blue-600" /> },
                ].map((field) => (
                  <div className="flex flex-col" key={field.label}>
                    <label className="flex items-center text-sm font-semibold text-gray-600 mb-1">
                      {field.icon}
                      {field.label}
                    </label>
                    <div className="w-full p-3 min-h-[48px] bg-gray-50 rounded-lg border border-gray-200 break-words">
                      {field.value || "Chưa có dữ liệu"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
