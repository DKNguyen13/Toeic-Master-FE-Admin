import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import api, { setAccessToken } from "../../config/axios";
import { Eye, EyeOff } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    let newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Vui lòng nhập email";
    if (!password) newErrors.password = "Vui lòng nhập mật khẩu";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        const { user, accessToken } = res.data.data;
        setAccessToken(accessToken);
        localStorage.setItem("fullname", user.fullname);
        localStorage.setItem("email", user.email);
        localStorage.setItem("phone", user.phone);
        localStorage.setItem("avatarUrl", user.avatarUrl);
        localStorage.setItem("role", user.role);
        onClose();
        if (user.role === "admin") {
        navigate("/admin/dashboard");
        } else {
        navigate("/");
        }
        window.dispatchEvent(new Event("userUpdated"));

      } else {
        setErrors({ general: res.data.message || "Đăng nhập thất bại" });
        setPassword("");
      }
    } catch (error: any) {
      setPassword("");
      setErrors({ general: error.response?.data?.message || "Lỗi kết nối server" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 relative animate-fadeIn" onClick={(e) => e.stopPropagation()}>

        {/* Nút đóng */}
        <button onClick={onClose} className="absolute right-4 top-3 text-gray-400 hover:text-gray-700 text-2xl font-bold">
          ×
        </button>

        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Đăng nhập</h2>

        {/* Thông báo lỗi */}
        {errors.general && (
          <p className="text-red-500 text-center mb-4 bg-red-50 p-2 rounded-lg border border-red-200">
            {errors.general}
          </p>
        )}

        {/* Form đăng nhập */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-gray-700 text-sm font-medium block mb-2">Email</label>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                errors.email ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="text-gray-700 text-sm font-medium block mb-2">Mật khẩu</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  errors.password ? "border-red-500" : "border-gray-200"
                }`}
                minLength={5}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Submit */}
          <button type="submit" disabled={isLoading}
            className={`w-full py-3 bg-gradient-to-r from-blue-500 to-blue-800 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-all ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}>
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        {/* OR Separator */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">Hoặc</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>

        {/* Google Login */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-full">
            <GoogleLogin
              width="100%"
              onSuccess={async (credentialResponse) => {
                try {
                  const res = await api.post("/auth/google", {
                    tokenId: credentialResponse.credential,
                  });

                  if (res.data.success) {
                    const { user, accessToken } = res.data.data;
                    setAccessToken(accessToken);
                    localStorage.setItem("fullname", user.fullname);
                    localStorage.setItem("email", user.email);
                    localStorage.setItem("avatarUrl", user.avatarUrl);
                    window.dispatchEvent(new Event("userUpdated"));
                    onSuccess?.();
                    onClose();
                    window.location.reload();
                  } else {
                    setErrors({ general: res.data.message || "Đăng nhập Google thất bại" });
                  }
                } catch (err: any) {
                  setErrors({ general: err.response?.data?.message || "Lỗi kết nối server" });
                }
              }}
              onError={() => {
                setErrors({ general: "Đăng nhập Google thất bại" });
              }}
            />
          </div>
        </div>


        {/* Link đăng ký */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Bạn chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-600 font-medium hover:underline" onClick={onClose}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
