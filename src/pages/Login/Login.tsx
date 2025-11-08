import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { setAccessToken } from "../../config/axios.js";
import { Eye, EyeOff, Mail, Lock, Shield, AlertCircle } from "lucide-react";

type LoginErrors = {
  email?: string;
  password?: string;
  general?: string;
};

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    setErrors({});

    const newErrors: LoginErrors = {};
    if (!email) newErrors.email = "Vui lòng nhập email";
    if (!password) newErrors.password = "Vui lòng nhập mật khẩu";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/admin-login", { email, password });
      if (res.data.success) {
        const { user, accessToken } = res.data.data;
        setAccessToken(accessToken);

        localStorage.setItem("fullname", user.fullname);
        localStorage.setItem("email", user.email);
        localStorage.setItem("phone", user.phone);
        localStorage.setItem("avatarUrl", user.avatarUrl);
        localStorage.setItem("role", user.role);
        localStorage.setItem("userId", user.id);
        window.dispatchEvent(new Event("userUpdated"));

        if (user.role === "admin") navigate("/admin/dashboard");
      } else {
        setErrors({ general: res.data.message || "Đăng nhập thất bại" });
        setPassword("");
      }
    } catch (error: any) {
      setPassword("");
      setErrors({
        general: error.response?.data?.message || "Lỗi kết nối server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md z-10">
        {/* Admin Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-600 rounded-full shadow-lg">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-600 tracking-wide">ADMIN PORTAL</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="text-center bg-gray-900 px-8 pt-8 pb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Đăng nhập</h1>
            <p className="text-blue-100 text-sm">Truy cập bảng điều khiển hệ thống</p>
          </div>

          <form onSubmit={handleLogin} className="px-8 py-8">
            {/* Error Alert */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm font-medium">{errors.general}</p>
              </div>
            )}

            <div className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email quản trị viên
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all ${
                      errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-200"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
                    className={`w-full pl-12 pr-14 py-3.5 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all ${
                      errors.password ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-gray-800 transition">
                  <input
                    type="checkbox"
                    className="mr-2 w-4 h-4 accent-blue-600 rounded border-gray-300"
                  />
                  Duy trì đăng nhập
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition">
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Login Button */}
              <button type="submit" disabled={isLoading} className={`w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group mt-6 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Đăng nhập Admin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            © 2025 TOEIC Master. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;