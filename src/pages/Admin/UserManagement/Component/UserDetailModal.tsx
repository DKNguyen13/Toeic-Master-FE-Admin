import React from "react";
import { Calendar, Mail, Phone, User, Sparkles, Trophy, Clock, Star, X } from "lucide-react";

interface FullUser {
  _id: string;
  fullname: string;
  email: string;
  phone: string;
  authType: "google" | "normal";
  createdAt: string;
  isActive: boolean;
  dob?: string | null;
  avatarUrl?: string;
  vip?: {
    isActive: boolean;
    type: "basic" | "advanced" | "premium" | null;
    endDate: string | null;
  };
  statistics?: {
    totalTests: number;
    avgScore: number;
    bestScore: number;
  };
}

interface UserDetailModalProps {
  user: FullUser | null;
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean; // Thêm loading để hiển thị khi đang fetch
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  loading = false,
}) => {
  if (!isOpen) return null;

  // Tính toán giá trị an toàn để tránh lỗi undefined
  const registerDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
    : "Không xác định";

  const bestScore = user?.statistics?.bestScore ?? 0;
  const hasHighScore = bestScore >= 90;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chi tiết người dùng</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-6 text-lg text-gray-600">Đang tải thông tin người dùng...</p>
            </div>
          ) : !user ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Không thể tải thông tin người dùng</p>
            </div>
          ) : (
            <>
              {/* Avatar + Tên + Email/Phone */}
              <div className="flex items-center gap-6">
                <div className="w-28 h-28 bg-gray-200 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="w-14 h-14 text-gray-400" />
                  )}
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-gray-900">{user.fullname}</h3>
                  <div className="mt-3 space-y-2">
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      {user.email}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      {user.phone || "Chưa cung cấp số điện thoại"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid 2 cột */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cột trái: Thông tin cơ bản */}
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Loại tài khoản
                    </p>
                    <p className="font-semibold text-lg mt-1">
                      {user.authType === "google" ? "Đăng nhập bằng Google" : "Tài khoản thường"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Ngày đăng ký
                    </p>
                    <p className="font-semibold text-lg mt-1">{registerDate}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Trạng thái tài khoản
                    </p>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mt-2 ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.isActive ? "Đang hoạt động" : "Bị vô hiệu hóa"}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Ngày sinh</p>
                    <p className="font-semibold text-lg mt-1">
                      {user.dob
                        ? new Date(user.dob).toLocaleDateString("vi-VN")
                        : "Chưa cung cấp"}
                    </p>
                  </div>
                </div>

                {/* Cột phải: VIP & Thống kê */}
                <div className="space-y-6">
                  {/* VIP */}
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Gói VIP
                    </p>
                    {user.vip?.isActive ? (
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-5 border border-purple-300">
                        <p className="font-bold text-xl text-purple-800 flex items-center gap-2">
                          <Star className="w-6 h-6" />
                          {user.vip.type === "premium"
                            ? "Premium ⭐"
                            : user.vip.type === "advanced"
                            ? "Advanced 🔥"
                            : "Basic 💎"}
                        </p>
                        <p className="text-purple-700 mt-2">
                          Hết hạn:{" "}
                          {user.vip.endDate
                            ? new Date(user.vip.endDate).toLocaleDateString("vi-VN")
                            : "Vĩnh viễn"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic text-lg">Không có gói VIP</p>
                    )}
                  </div>

                  {/* Thống kê làm bài */}
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-sm text-gray-600 font-medium mb-4">
                      Thống kê làm bài
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-3xl font-bold text-blue-600">
                          {user.statistics?.totalTests ?? 0}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Tổng bài thi</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-green-600">
                          {user.statistics?.avgScore ?? 0}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Điểm trung bình</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-purple-600 flex items-center justify-center gap-2">
                          <span>{bestScore}</span>
                          {hasHighScore && (
                            <Trophy className="w-6 h-6 text-yellow-500 animate-bounce" />
                          )}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Điểm cao nhất</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nút đóng */}
              <div className="flex justify-end pt-6 border-t border-gray-100">
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
                >
                  Đóng
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;