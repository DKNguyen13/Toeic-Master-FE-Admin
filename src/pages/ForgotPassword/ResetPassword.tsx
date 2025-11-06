import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { token } = useParams<{ token: string }>(); // Lấy token từ URL
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra sự khớp của mật khẩu và xác nhận mật khẩu
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      if (response.ok) {
        setMessage("Mật khẩu của bạn đã được thay đổi thành công!");
        setTimeout(() => navigate("/login"), 2000); // Redirect đến trang đăng nhập sau 2s
      } else {
        setError("Đã xảy ra lỗi, vui lòng thử lại sau.");
      }
    } catch (error) {
      setError("Lỗi kết nối, vui lòng thử lại.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex max-w-4xl bg-white rounded-lg w-full overflow-hidden items-center">
        {/* Left Side - Welcome message and image */}
        <div className="flex-1 p-8 max-sm:hidden">
          <h2 className="text-xl font-bold text-gray-800">Đặt lại mật khẩu của bạn</h2>
          <div className="mt-4">
            <img
              src="src/assets/images/login-image.png"
              alt="illustration"
              className="w-full"
            />
          </div>
        </div>

        {/* Right Side - Reset Password Form */}
        <div className="flex-1 p-8 bg-blue-100">
          <h2 className="text-3xl font-bold mb-6">Đặt lại mật khẩu</h2>

          {/* Hiển thị thông báo thành công hoặc lỗi */}
          {message && (
            <div className="bg-green-100 text-green-700 p-3 mb-4 rounded">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="text-gray-700 text-sm font-medium">
                Mật khẩu mới
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-gray-700 text-sm font-medium">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu mới"
                className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 mt-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Đặt lại mật khẩu
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm">
              Quay lại{" "}
              <Link className="text-blue-600 hover:underline" to={"/login"}>
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
