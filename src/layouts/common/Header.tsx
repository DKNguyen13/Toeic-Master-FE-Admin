import React, { useState, useEffect, useRef } from "react";
import api, { setAccessToken } from "../../config/axios.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBell, FaUsers, FaHome, FaClipboardList, FaFileAlt, FaSearch, FaCrown, FaSignOutAlt, FaHistory, FaUser } from "react-icons/fa";
import { useSocket } from "../../context/SocketContext.jsx";

interface Notification {
  _id: string;
  title: string;
  message: string;
  icon: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  data: {
    senderName?: string;
    postTitle?: string;
    replyContent?: string;
    commentContent?: string;
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
const Header: React.FC = () => {
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

  const updateUser = () => {
    setFullname(localStorage.getItem("fullname"));
    const avatar = localStorage.getItem("avatarUrl");
    setAvatarUrl(avatar || "/img/avatar/default_avatar.jpg");
  };

  useEffect(() => {
    // Set initial user
    updateUser();

    const handleUserUpdated = () => updateUser();
    window.addEventListener("userUpdated", handleUserUpdated);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdated);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setOpenNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async (page: number = 1, reset: boolean = true) => {
    if (!fullname) return;
    
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await api.get(`/notifications?page=${page}&limit=10`);
      if (response.data && response.data.data) {
        if (reset) {
          setNotifications(response.data.data);
        } else {
          setNotifications(prev => [...prev, ...response.data.data]);
        }
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  // Load more notifications
  const loadMoreNotifications = () => {
    if (pagination && pagination.hasNext && !loadingMore) {
      fetchNotifications(pagination.currentPage + 1, false);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      try {
        await api.patch(`/notifications/${notification._id}/read`);
        // Update local state
        setNotifications(prev => 
          prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // Navigate to action URL if exists
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    
    setOpenNotifications(false);
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout server failed:", err);
    } finally {
      localStorage.clear();
      setAccessToken(null);
      setFullname(null);
      window.dispatchEvent(new Event("userUpdated"));
      setAvatarUrl("/img/avatar/default_avatar.jpg");
      setOpenMenu(false);
      navigate("/");
    }
  };

  const navLinks = [
    { to: "/", label: "Trang chủ", icon: <FaHome className="text-xl" /> },
    { to: "/tests", label: "Thi thử", icon: <FaFileAlt className="text-xl" /> },
    { to: "/resource", label: "Tài nguyên", icon: <FaSearch className="text-xl" /> },
    { to: "/flashcard", label: "Flashcards", icon: <FaClipboardList className="text-xl" /> },
    { to: "/payment", label: "Premium", icon: <FaCrown className="text-xl text-yellow-500" />, premium: true },
  ];

  const filteredNavLinks = navLinks;

  return (
    <header className="bg-white shadow-md px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <span className="text-blue-600 font-extrabold text-xl tracking-wide">TOEIC MASTER</span>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center space-x-6">
        {filteredNavLinks.map((link) => (
          <Link key={link.to} to={link.to}
            className={`hidden sm:block relative transition-colors duration-200 ${
              location.pathname === link.to
                ? link.premium ? "text-yellow-600 font-semibold" : "text-blue-600 font-semibold"
                : link.premium ? "text-yellow-500 hover:text-yellow-600" : "text-gray-600 hover:text-blue-500"
            }`}>
            {link.label}
            {location.pathname === link.to && (
              <span
                className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                  link.premium ? "bg-yellow-600" : "bg-blue-600"
                }`}
              ></span>
            )}
          </Link>
        ))}

        {/* Mobile icons */}
        {navLinks.map((link) => (
          <Link key={link.to + "-mobile"} to={link.to}
            className={`sm:hidden transition-colors duration-200 ${
              location.pathname === link.to ? "text-blue-600" : "text-gray-500 hover:text-blue-500"
            }`}>
            {link.icon}
          </Link>
        ))}
      </nav>

      {/* Notifications and User Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        {fullname && (
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => {
                setOpenNotifications(!openNotifications);
                if (!openNotifications) {
                  fetchNotifications(1, true);
                }
              }}
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full transition"
            >
              <FaBell className="text-xl" />
              {/* Notification badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {openNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50 max-h-96">
                {/* Header */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Thông báo</h3>
                  {notifications.some(n => !n.read) && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <FaBell className="text-3xl mb-2 opacity-50" />
                      <p className="text-sm">Không có thông báo mới</p>
                    </div>
                  ) : (
                    <>
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-25' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            {/* <div className="flex-shrink-0 mt-1">
                              {notification.icon === "💬" ? (

                                <div className="w-10 h-10 flex items-center justify-center">
                                
                                </div>
                              ) : (
                                <span className="text-lg">{notification.data.avatarUrl}</span>
                              )}
                            </div> */}
                            <img className="w-8 h-8 rounded-full object-cover" src={notification.data.avatarUrl}></img>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium text-gray-800 truncate">
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              {notification.data.postTitle && (
                                <p className="text-xs text-blue-600 mt-1 font-medium">
                                  📝 {notification.data.postTitle}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Load More Section */}
                      {pagination && pagination.hasNext && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                          <button
                            onClick={loadMoreNotifications}
                            disabled={loadingMore}
                            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {loadingMore ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                Đang tải...
                              </>
                            ) : (
                              `Xem thêm (${pagination.totalComments - notifications.length} còn lại)`
                            )}
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

        {/* User Section */}
        <div className="relative" ref={dropdownRef}>
          {fullname ? (
            <div className="relative">
              <button onClick={() => setOpenMenu(!openMenu)}
                className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition">
                <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                <span className="font-medium text-gray-700 hidden sm:block">{fullname}</span>
              </button>

              {/* User Dropdown */}
              {openMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50 transition transform duration-200 ease-out scale-100 opacity-100">
                  <Link to="/settings" onClick={() => setOpenMenu(false)}
                    className="flex items-center px-4 py-3 gap-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium">
                    <FaUser className="text-lg" />
                    Thông tin cá nhân
                  </Link>
                  <Link to="/history" onClick={() => setOpenMenu(false)}
                    className="flex items-center px-4 py-3 gap-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium">
                    <FaClipboardList className="text-lg" />
                    <span>Lịch sử làm bài</span>
                  </Link>
                  <Link to="/purchase-history" onClick={() => setOpenMenu(false)}
                    className="flex items-center px-4 py-3 gap-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium">
                    <FaHistory className="text-lg" />
                    Lịch sử mua hàng
                  </Link>
                  <button onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 gap-2 text-gray-700 hover:bg-red-50 hover:text-red-500 transition font-medium">
                    <FaSignOutAlt className="text-lg" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;