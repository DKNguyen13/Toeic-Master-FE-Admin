import React, { useState, useEffect, useRef } from "react";
import api, { setAccessToken } from "../../config/axios.js";
import { useSocket } from "../../context/SocketContext.jsx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Users, FileText, Search, Crown, LogOut, PieChart } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  icon: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  data: { senderName?: string; postTitle?: string; replyContent?: string; commentContent?: string; avatarUrl?: string };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalComments: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const AdminHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fullname, setFullname] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("/img/avatar/default_avatar.jpg");
  const [openMenu, setOpenMenu] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useSocket();

  useEffect(() => {
    const avatar = localStorage.getItem("avatarUrl");
    setAvatarUrl(avatar || "/img/avatar/default_avatar.jpg");
    setFullname(localStorage.getItem("fullname"));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setOpenMenu(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setOpenNotifications(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <PieChart className="w-5 h-5" /> },
    { to: "/admin/usermanagement", label: "Người dùng", icon: <Users className="w-5 h-5" /> },
    { to: "/admin/tests", label: "Bài kiểm tra", icon: <FileText className="w-5 h-5" /> },
    { to: "/admin/resources", label: "Tài nguyên", icon: <Search className="w-5 h-5" /> },
    { to: "/admin/vipmanagement", label: "VIP/Premium", icon: <Crown className="w-5 h-5 text-yellow-500" />, premium: true },
  ];

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.clear();
    setAccessToken(null);
    navigate("/login");
  };

  return (
    <header className="bg-gray-800 text-white px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <Link to="/admin/dashboard" className="flex items-center">
        <span className="text-yellow-400 font-extrabold text-xl tracking-wide">TOEIC MASTER</span>
      </Link>

      <nav className="flex items-center space-x-6">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`hidden sm:flex items-center gap-1 transition-colors duration-200 ${location.pathname === link.to ? "text-yellow-400 font-semibold" : "text-gray-300 hover:text-yellow-300"}`}
          >
            {link.icon} {link.label}
          </Link>
        ))}

        {navLinks.map((link) => (
          <Link key={link.to + "-mobile"} to={link.to} className="sm:hidden text-gray-300 hover:text-yellow-300">
            {link.icon}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {fullname && (
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setOpenNotifications(!openNotifications)}
              className="relative p-2 text-gray-300 hover:text-yellow-300 hover:bg-gray-700 rounded-full transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        )}

        <div className="relative" ref={dropdownRef}>
          {fullname ? (
            <div className="relative">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-700 transition"
              >
                <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                <span className="font-medium hidden sm:block">{fullname}</span>
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
                  <Link to="/admin/users" onClick={() => setOpenMenu(false)} className="flex items-center px-4 py-3 gap-2 hover:bg-gray-100 transition font-medium"><Users className="w-4 h-4" /> Quản lý người dùng</Link>
                  <Link to="/admin/tests" onClick={() => setOpenMenu(false)} className="flex items-center px-4 py-3 gap-2 hover:bg-gray-100 transition font-medium"><FileText className="w-4 h-4" /> Quản lý bài kiểm tra</Link>
                  <Link to="/admin/resources" onClick={() => setOpenMenu(false)} className="flex items-center px-4 py-3 gap-2 hover:bg-gray-100 transition font-medium"><Search className="w-4 h-4" /> Quản lý tài nguyên</Link>
                  <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 gap-2 text-red-600 hover:bg-red-50 transition font-medium"><LogOut className="w-4 h-4" /> Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="bg-yellow-400 text-gray-800 font-semibold px-4 py-2 rounded-full hover:bg-yellow-500 transition">Đăng nhập</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
