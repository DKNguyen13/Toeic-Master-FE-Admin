import React from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { setAccessToken } from "../config/axios.js";
import { FaTachometerAlt, FaUsers, FaFileAlt, FaGift, FaSignOutAlt, FaBook, FaAdjust } from "react-icons/fa";

interface LeftSidebarAdminProps {
  customHeight?: string;
}

const LeftSidebarAdmin: React.FC<LeftSidebarAdminProps> = ({ customHeight }) => {
  const navigate = useNavigate();
  const [fullname, setFullname] = React.useState(localStorage.getItem("fullname") || "Guest User");
  const [avatarUrl, setAvatarUrl] = React.useState(localStorage.getItem("avatarUrl") || "/img/avatar/default_avatar.jpg");

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.clear();
    } catch (err) {
      console.error("Logout server failed:", err);
    } finally {
      setAccessToken(null);
      setFullname("Guest User");
      setAvatarUrl("/img/avatar/default_avatar.jpg");
      navigate("/", { replace: true });
    }
  };

  return (
    <div className={`bg-white flex flex-col p-4 ${customHeight ? customHeight : "h-screen w-64 min-w-44"}`}>
      {/* Phần thông tin người dùng */}
      <div className="flex items-center mb-6">
        <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full mr-3 object-cover" />
        <div>
          <h2 className="text-lg font-semibold">{fullname}</h2>
          <p className="text-sm text-gray-500 flex items-center">Admin</p>
        </div>
      </div>

      {/* Phần menu */}
      <nav className="flex-1">
        <ul>
          <li className="mb-2">
            <Link to="/admin/dashboard" className="flex items-center p-2 text-gray-700 hover:bg-blue-100 rounded">
              <FaTachometerAlt className="mr-3" />
              Thống kê
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/admin/usermanagement" className="flex items-center p-2 text-gray-700 hover:bg-blue-100 rounded">
              <FaUsers className="mr-3" />
              Người dùng
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/admin/lessonmanagement" className="flex items-center p-2 text-gray-700 hover:bg-blue-100 rounded">
              <FaBook className="mr-3" />
              Bài học
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/admin/testmanagement" className="flex items-center p-2 text-gray-700 hover:bg-blue-100 rounded">
              <FaFileAlt className="mr-3" />
              Đề thi
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/flashcard" className="flex items-center p-2 text-gray-700 hover:bg-blue-100 rounded">
              <FaAdjust className="mr-3" />
              Flashcard
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/admin/vipmanagement" className="flex items-center p-2 text-gray-700 hover:bg-blue-100 rounded">
              <FaGift className="mr-3" />
              Quản lý gói VIP
            </Link>
          </li>
          <li className="mb-2">
            <button onClick={handleLogout} className="flex items-center w-full p-2 text-red-500 hover:bg-blue-100 rounded">
              <FaSignOutAlt className="mr-3" />
              Đăng xuất
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default LeftSidebarAdmin;
