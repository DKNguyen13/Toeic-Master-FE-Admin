import React from "react";
import { showToast } from "../utils/toast.js";
import { config } from "../config/env.config.js";
import { Link, useNavigate } from "react-router-dom";
import api, { setAccessToken } from "../config/axios.js";
import { LayoutDashboard, Users, FileText, Crown, LogOut, UserCircle, PieChart, Search } from "lucide-react";


interface LeftSidebarAdminProps {
  customHeight?: string;
}

const LeftSidebarAdmin: React.FC<LeftSidebarAdminProps> = ({ customHeight }) => {
  const navigate = useNavigate();
  const [fullname, setFullname] = React.useState(
    localStorage.getItem("fullname") || "Guest User"
  );
  const [avatarUrl, setAvatarUrl] = React.useState(
    localStorage.getItem("avatarUrl") || "/img/avatar/default_avatar.jpg"
  );

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.clear();
      sessionStorage.clear();
      //showToast("Đăng xuất thành công!", "success", { autoClose: 500 });
    } catch (err) {
      console.error("Logout server failed:", err);
      showToast("Đăng xuất thất bại. Vui lòng thử lại.", "error", { autoClose: 1000 });
    } finally {
      setAccessToken(null);
      setFullname("Guest User");
      setAvatarUrl("/img/avatar/default_avatar.jpg");
      navigate("/", { replace: true });
    }
  };

  const menuItems = [
    { to: "/admin/profile", icon: UserCircle, label: "Thông tin cá nhân" },
    { to: "/admin/dashboard", icon: PieChart, label: "Dashboard" },
    { to: "/admin/usermanagement", icon: Users, label: "Người dùng" },
    { to: "/admin/lessonmanagement", icon: Search, label: "Tài nguyên" },
    { to: "/admin/testmanagement", icon: FileText, label: "Đề thi" },
    //{ to: "/admin/flashcard", icon: Sparkles, label: "Flashcard" },
    { to: "/admin/vipmanagement", icon: Crown, label: "VIP/Premium" },
    { to: `${config.userPortalUrl}`, icon: LayoutDashboard, label: "Truy cập User Portal", external: true },
  ];

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col ${
        customHeight || "h-screen"
      } w-64 min-w-[200px] transition-all duration-300`}
    >
      {/* Header - User Info */}
      <div className="p-5 border-b border-gray-300">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 break-words">
              {fullname}
            </h2>
            <div className="flex items-center mt-1 text-xs text-blue-600 font-medium">
              <UserCircle className="w-3 h-3 mr-1" />
              Admin
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          if (item.external) {
            return (
              <a
                key={item.to}
                href={item.to}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 group">
                <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                <span>{item.label}</span>
              </a>
            );
          }
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 group">
              <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-300">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg transition-all duration-200 hover:bg-red-50 group">
          <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default LeftSidebarAdmin;