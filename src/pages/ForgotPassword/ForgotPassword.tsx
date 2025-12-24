import api from "../../config/axios.js";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { AlertCircle, Shield, Mail } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";

const ForgotPassword: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const recaptchaRef = useRef<InstanceType<typeof ReCAPTCHA> | null>(null);

  // Countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const token = recaptchaRef.current?.getValue();
    if (!token) {
      setError("Vui lòng xác thực CAPTCHA trước khi tiếp tục.");
      return;
    }

    try {
      const res = await api.post("/admin/forgot-password", {token});
      setMessage(res.data.data?.message || "Email khôi phục đã được gửi thành công.");
      setCountdown(res.data?.data?.cooldown || 60);
      recaptchaRef.current?.reset();
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể gửi yêu cầu, vui lòng thử lại.");
      recaptchaRef.current?.reset();
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
              ADMIN RECOVERY
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="text-center bg-gray-900 px-8 pt-8 pb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Quên mật khẩu
            </h1>
            <p className="text-blue-100 text-sm">
              Mật khẩu khôi phục sẽ được gửi đến email quản trị
            </p>
          </div>

          <form onSubmit={handleSendReset} className="px-8 py-8 space-y-5">
            {/* Success */}
            {message && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg text-green-700 text-sm">
                {message}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Info */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700">
              <Mail className="w-5 h-5 text-yellow-500 mt-0.5" />
              <p>
                Hệ thống chỉ có <b>1 tài khoản admin</b>.  
                Link đặt lại mật khẩu sẽ được gửi tới email quản trị mặc định.
              </p>
            </div>

            {/* CAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA sitekey="6LcPecArAAAAAOUVjIYmkFx3uaXw-HbomQYjCtqE"
                ref={recaptchaRef}
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={countdown > 0}
              className={`w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold rounded-xl shadow-lg transition ${
                countdown > 0 ? "opacity-70 cursor-not-allowed" : ""
              }`}>
              {countdown > 0
                ? `Gửi lại (${countdown}s)`
                : "Gửi link đặt lại mật khẩu"}
            </button>

            {/* Back */}
            <div className="text-center text-sm text-gray-600">
              Quay lại{" "}
              <Link to="/login"
                className="text-blue-500 font-semibold hover:underline">
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

export default ForgotPassword;