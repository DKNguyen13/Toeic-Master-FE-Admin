import { useState } from "react";
import api from "../../config/axios";
import { Shield, AlertCircle, Lock } from "lucide-react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) return setError("Link không hợp lệ hoặc đã hết hạn.");
    if (password.length < 6)
      return setError("Mật khẩu phải có ít nhất 6 ký tự.");
    if (password !== confirm)
      return setError("Mật khẩu xác nhận không khớp.");

    try {
      setLoading(true);
      await api.post("/admin/reset-password", {
        token,
        newPassword: password,
      });
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || "Link đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>

      <div className="relative w-full max-w-md z-10">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-600 rounded-full shadow-lg">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-bold text-blue-600 tracking-wide">
              ADMIN SECURITY
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="text-center bg-gray-900 px-8 pt-8 pb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Đặt lại mật khẩu
            </h1>
            <p className="text-blue-100 text-sm">
              Thiết lập mật khẩu mới cho tài khoản Admin
            </p>
          </div>

          <form onSubmit={submit} className="px-8 py-8 space-y-5">
            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                  placeholder="Nhập mật khẩu mới"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Confirm */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                  placeholder="Nhập lại mật khẩu"
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold rounded-xl shadow-lg transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}>
              {loading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
            </button>

            {/* Back */}
            <div className="text-center text-sm text-gray-600">
              Quay lại{" "}
              <Link
                to="/login"
                className="text-blue-500 font-semibold hover:underline"
              >
                Đăng nhập
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          © 2025 TOEIC Master. Admin System.
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;