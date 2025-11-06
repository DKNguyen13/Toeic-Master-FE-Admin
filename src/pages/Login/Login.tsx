import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import api, { setAccessToken } from "../../config/axios.js";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Background Blur Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95">
            {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Đăng nhập</h1>
            <p className="text-2x1 text-gray-500">Chinh phục TOEIC cùng chúng tôi</p>
          </div>
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
                  className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 w-4 h-4 accent-blue-600 rounded"
                />
                Nhớ mật khẩu
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center group ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">Hoặc</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center mb-4">
            <GoogleLogin
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
                    navigate("/");
                  } else {
                    setErrors({
                      general:
                        res.data.message || "Đăng nhập Google thất bại",
                    });
                  }
                } catch (err: any) {
                  setErrors({
                    general:
                      err.response?.data?.message || "Lỗi kết nối server",
                  });
                }
              }}
              onError={() =>
                setErrors({ general: "Đăng nhập Google thất bại" })
              }
            />
          </div>

          {/* Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 TOEIC Master. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
