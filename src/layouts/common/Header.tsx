import { showToast } from "../../utils/toast.js";
import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/SocketContext.jsx";
import api, { setAccessToken } from "../../config/axios.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Users, Search, Crown, PieChart, LogOut, Sparkles, Menu } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  icon?: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  data?: {
    senderName?: string;
    senderAvatar?: string;
    senderEmail?: string;
    avatarUrl?: string;
  };
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
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [openNotifications, setOpenNotifications] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const {
    notifications: socketNotifications,
    unreadCount,
    markAsRead,
    clearNotifications
  } = useSocket();

  useEffect(() => {
    setFullname(localStorage.getItem("fullname"));
    const avatar = localStorage.getItem("avatarUrl");
    setAvatarUrl(avatar || "/img/avatar/default_avatar.jpg");
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setOpenNotifications(false);
      }
      if (mobileMenuOpen && !(event.target as HTMLElement).closest("#mobile-menu")) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (socketNotifications?.length > 0) {
      setLocalNotifications(prev => [
        ...socketNotifications.filter(sn => !prev.some(pn => pn._id === sn._id)),
        ...prev
      ]);
    }
  }, [socketNotifications]);

  const fetchNotifications = async (page: number = 1, reset: boolean = true) => {
    if (!fullname) return;

    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await api.get(`/notifications?page=${page}&limit=10`);
      const { data: apiNotifications, pagination: pagi } = response.data;

      if (reset) {
        const merged = [
          ...socketNotifications.filter(sn => !apiNotifications.some(an => an._id === sn._id)),
          ...apiNotifications
        ];
        setLocalNotifications(merged);
      } else {
        const newNotis = apiNotifications.filter(an => !localNotifications.some(ln => ln._id === an._id));
        setLocalNotifications(prev => [...prev, ...newNotis]);
      }

      setPagination(pagi);
    } catch (error) {
      console.error("Lấy thông báo thất bại:", error);
    } finally {
      if (reset) setLoading(false);
      else setLoadingMore(false);
    }
  };

  const handleOpenNotifications = () => {
    setOpenNotifications(prev => {
      const willOpen = !prev;
      if (willOpen && localNotifications.length === 0) {
        fetchNotifications(1, true);
      }
      return willOpen;
    });
  };

  const loadMore = () => {
    if (pagination?.hasNext && !loadingMore) {
      fetchNotifications((pagination.currentPage || 1) + 1, false);
    }
  };

  const handleNotificationClick = async (noti: Notification) => {
    if (!noti.read) {
      try {
        await api.patch(`/notifications/${noti._id}/read`);
        setLocalNotifications(prev =>
          prev.map(n => (n._id === noti._id ? { ...n, read: true } : n))
        );
        markAsRead(noti._id);
      } catch (err) {
        console.error("Đánh dấu đã đọc thất bại:", err);
      }
    }

    window.open("https://mail.google.com/", "_blank", "noopener,noreferrer");
    setOpenNotifications(false);
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
      clearNotifications();
    } catch (err) {
      console.error("Đánh dấu tất cả đã đọc thất bại:", err);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.clear();
      sessionStorage.clear();
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

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <PieChart className="w-5 h-5" /> },
    { to: "/admin/usermanagement", label: "Người dùng", icon: <Users className="w-5 h-5" /> },
    { to: "/admin/flashcard", label: "Flashcard", icon: <Sparkles className="w-5 h-5" /> },
    { to: "/admin/lessonmanagement", label: "Tài nguyên", icon: <Search className="w-5 h-5" /> },
    { to: "/admin/vipmanagement", label: "VIP/Premium", icon: <Crown className="w-5 h-5 text-yellow-500" />, premium: true },
  ];

  return (
    <header className="bg-gray-900 text-white px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <span className="text-yellow-400 font-extrabold text-2xl tracking-wider">TOEIC MASTER</span>
      </Link>

      {/* Desktop Navigation */}
      {fullname && (
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1 transition-colors duration-200 ${location.pathname === link.to ? "text-yellow-400 font-semibold" : "text-gray-300 hover:text-yellow-300"}`}>
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      {/* Mobile Hamburger Button */}
      {fullname && (
        <button
          className="lg:hidden p-2 rounded-md hover:bg-gray-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Menu */}
      {fullname && mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden absolute top-full left-0 w-full bg-gray-800 flex flex-col z-40 shadow-lg"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-6 py-4 hover:bg-gray-700 transition text-gray-300 flex items-center gap-3 text-base"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Khu vực bên phải */}
      <div className="flex items-center gap-5">
        {/* Thông báo */}
        {fullname && (
          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleOpenNotifications}
              className="relative p-2.5 text-gray-300 hover:text-yellow-400 hover:bg-gray-800 rounded-full transition-all duration-200"
              title={`Có ${unreadCount} thông báo chưa đọc`}
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-sm animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown thông báo */}
            {openNotifications && (
              <div className="absolute right-0 mt-3 w-96 bg-white text-gray-900 border border-gray-200 shadow-2xl rounded-2xl overflow-hidden z-50 max-h-[85vh]">
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b flex items-center justify-between">
                  <h3 className="font-bold text-lg text-gray-900">Thông báo</h3>
                  {localNotifications.some(n => !n.read) && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>

                <div className="max-h-[70vh] overflow-y-auto">
                  {loading ? (
                    <div className="py-12 flex justify-center items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-blue-600"></div>
                    </div>
                  ) : localNotifications.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                      <Bell className="mx-auto h-12 w-12 opacity-30 mb-4" />
                      <p className="text-base font-medium">Chưa có thông báo nào</p>
                    </div>
                  ) : (
                    <>
                      {localNotifications.map(noti => (
                        <div
                          key={noti._id}
                          onClick={() => handleNotificationClick(noti)}
                          className={`px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 cursor-pointer ${
                            !noti.read ? "bg-red-50 border-l-4 border-l-red-600" : ""
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <img
                              src={noti.data?.senderAvatar || noti.data?.avatarUrl || "/img/avatar/default_avatar.jpg"}
                              alt="Avatar"
                              className="w-12 h-12 rounded-full object-cover ring-1 ring-gray-200 flex-shrink-0 shadow-sm"
                              onError={e => (e.currentTarget.src = "/img/avatar/default_avatar.jpg")}
                            />
                            <div className="flex-1 min-w-0">
                              <div className={`font-semibold text-base truncate ${
                                !noti.read ? "text-red-700" : "text-gray-900"
                              }`}>
                                {noti.title || "Thông báo hệ thống"}
                              </div>
                              <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                                {noti.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2 font-medium">
                                {formatTimeAgo(noti.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {pagination?.hasNext && (
                        <div className="px-6 py-5 text-center border-t">
                          <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="flex items-center justify-center gap-2 mx-auto text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 transition"
                          >
                            {loadingMore ? (
                              <>
                                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                Đang tải...
                              </>
                            ) : "Xem thêm thông báo"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="relative" ref={dropdownRef}>
          {fullname ? (
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="flex items-center gap-3 p-1.5 rounded-full hover:bg-gray-800 transition-all duration-200"
            >
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-yellow-400/50 shadow-sm"
              />
              <span className="hidden lg:block font-medium text-sm">{fullname}</span>
            </button>
          ) : (
            <Link to="/login" className="bg-yellow-400 text-gray-800 font-semibold px-4 py-2 rounded-full hover:bg-yellow-500 transition">
              Đăng nhập
            </Link>
          )}

          {openMenu && fullname && (
            <div className="absolute right-0 mt-3 w-64 bg-white text-gray-900 rounded-xl shadow-2xl border overflow-hidden z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="w-full text-left px-6 py-4 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition duration-150"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;