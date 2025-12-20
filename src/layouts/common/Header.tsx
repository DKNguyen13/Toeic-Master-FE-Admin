import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext.jsx";
import { Link, useLocation } from "react-router-dom";
import { Bell, Users, Search, Crown, LogOut, PieChart, Sparkles } from "lucide-react";

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
  const [fullname, setFullname] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("/img/avatar/default_avatar.jpg");
  const [openMenu, setOpenMenu] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      if (mobileMenuOpen && !(event.target as HTMLElement).closest("#mobile-menu")) setMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <PieChart className="w-5 h-5" /> },
    { to: "/admin/usermanagement", label: "Người dùng", icon: <Users className="w-5 h-5" /> },
    { to: "/admin/flashcard", label: "Flashcard", icon: <Sparkles className="w-5 h-5" /> },
    { to: "/admin/lessonmanagement", label: "Tài nguyên", icon: <Search className="w-5 h-5" /> },
    { to: "/admin/vipmanagement", label: "VIP/Premium", icon: <Crown className="w-5 h-5 text-yellow-500" />, premium: true },
  ];

  return (
    <header className="bg-gray-800 text-white px-4 sm:px-8 py-4 flex flex-wrap sm:flex-nowrap items-center justify-between sticky top-0 z-50 shadow-md">
      {/* Logo */}
      <Link to="" className="flex items-center">
        <span className="text-yellow-400 font-extrabold text-xl tracking-wide">TOEIC MASTER</span>
      </Link>

      {/* Desktop Nav */}
      {fullname && (
        <nav className="hidden sm:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1 transition-colors duration-200 ${location.pathname === link.to ? "text-yellow-400 font-semibold" : "text-gray-300 hover:text-yellow-300"}`}>
              {link.icon} {link.label}
            </Link>
          ))}
        </nav>
      )}

      {/* Mobile Hamburger */}
      {fullname && (
        <button className="sm:hidden p-2 rounded-md hover:bg-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && fullname && (
        <div id="mobile-menu" className="sm:hidden absolute top-full left-0 w-full bg-gray-800 flex flex-col z-40">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-4 py-3 hover:bg-gray-700 transition text-gray-300 flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        {fullname && (
          <div className="relative" ref={notificationRef}>
            <button onClick={() => setOpenNotifications(!openNotifications)}
              className="relative p-2 text-gray-300 hover:text-yellow-300 hover:bg-gray-700 rounded-full transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {openNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-h-80 overflow-y-auto bg-white text-gray-800 border border-gray-200 shadow-xl rounded-xl z-50">
                {/* Notification list here */}
                <div className="p-4 text-gray-500">Chưa có thông báo mới</div>
              </div>
            )}
          </div>
        )}

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          {fullname ? (
            <div className="relative">
              <button onClick={() => setOpenMenu(!openMenu)} className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-700 transition">
                <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                <span className="font-medium hidden sm:block">{fullname}</span>
              </button>
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
