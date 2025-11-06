import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../../config/axios.js";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const recaptchaRef = useRef<InstanceType<typeof ReCAPTCHA> | null>(null);

  // Countdown logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Gửi OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const token = recaptchaRef.current?.getValue();
    if (!token) {
      setError("Vui lòng xác thực CAPTCHA trước khi gửi.");
      return;
    }

    if (!email) {
      setError("Vui lòng nhập email!");
      return;
    }

    try {
      const res = await api.post("/auth/send-otp", { email, token });
      setMessage(res.data.message);
      setCountdown(res.data.data?.cooldown || 60);
      recaptchaRef.current?.reset();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Có lỗi xảy ra!";
      const cooldown = err.response?.data?.errors?.cooldown || 0;

      setError(msg);
      if (cooldown > 0) setCountdown(cooldown);

      recaptchaRef.current?.reset();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="flex max-w-4xl bg-white rounded-lg w-full overflow-hidden items-center">
        {/* Left Side */}
        <div className="flex-1 p-8 max-sm:hidden">
          <h2 className="text-xl font-bold text-gray-800">
            Ups, quay lại nào, bạn ơi!
          </h2>
          <div className="mt-4">
            <img
              src="src/assets/images/forgot_pass_img.jpg"
              alt="illustration"
              className="w-full"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 p-8 bg-blue-100">
          <h2 className="text-3xl font-bold mb-6 text-center">Quên mật khẩu</h2>

          {/* Thông báo */}
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

          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-gray-700 text-sm font-medium">
                Email
              </label>
              <div className="flex gap-2 mt-2">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <button
                  type="submit"
                  disabled={countdown > 0}
                  className={`px-4 rounded-lg text-white font-semibold shadow-lg transition ${
                    countdown > 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                  }`}
                >
                  {countdown > 0 ? `Gửi lại (${countdown}s)` : "Gửi OTP"}
                </button>
              </div>
            </div>

            {/* ReCAPTCHA */}
            <div className="mt-2">
              <ReCAPTCHA
                sitekey="6LcPecArAAAAAOUVjIYmkFx3uaXw-HbomQYjCtqE"
                ref={recaptchaRef}
              />
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm">
              Bạn chưa có tài khoản?{" "}
              <Link
                className="text-blue-500 font-medium hover:underline"
                to={"/register"}
              >
                Đăng ký
              </Link>
            </p>
            <p className="text-sm mt-2">
              Quay lại{" "}
              <Link
                className="text-blue-500 font-medium hover:underline"
                to={"/login"}
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
