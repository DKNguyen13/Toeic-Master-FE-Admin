import { format } from "date-fns";
import api from "../../config/axios.js";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Mail, Lock, Eye, EyeOff, User, Calendar, Phone, Send, CheckCircle2, XCircle } from "lucide-react";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [phone, setPhone] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpMessage, setOtpMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [serverError, setServerError] = useState("");

  const isValidAge = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
    return age >= 16;
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    setOtpMessage(null);
    if (!email) {
      setOtpMessage({ type: "error", text: "Vui lòng nhập email trước khi gửi OTP" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setOtpMessage({ type: "error", text: "Email không hợp lệ" });
      return;
    }

    try {
      const res = await api.post("/auth/send-register-otp", { email });
      setOtpMessage({ type: "success", text: res.data.message || "OTP đã gửi" });
      setCountdown(res.data.cooldown || 60);
    } catch (err: any) {
      setOtpMessage({ type: "error", text: err.response?.data?.message || "Lỗi hệ thống!" });
      setCountdown(err.response?.data?.errors?.cooldown || 0);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setOtpMessage(null);
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Email không hợp lệ";

    if (!/^[\p{L}\s]+$/u.test(fullname.trim())) newErrors.fullname = "Tên chỉ được chứa chữ cái và khoảng trắng";
    if (password.length < 6) newErrors.password = "Mật khẩu phải ít nhất 6 ký tự";
    if (password !== confirmPassword) newErrors.confirmPassword = "Mật khẩu không khớp";
    if (!isValidAge(dob)) newErrors.dob = "Bạn phải từ 16 tuổi trở lên";
    if (phone.length < 10 || phone.length > 11) newErrors.phone = "Số điện thoại không hợp lệ";
    if (!otp || otp.length < 6) newErrors.otp = "Vui lòng nhập mã OTP hợp lệ";
    if (!agreeTerms) newErrors.agreeTerms = "Bạn phải đồng ý với điều khoản để tiếp tục";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await api.post("/auth/register", {
        fullname,
        email,
        password,
        phone,
        dob: dob ? format(dob, "dd/MM/yyyy") : null,
        otp,
      });

      if (res.data.success) {
        setOtpMessage({ type: "success", text: "Đăng ký thành công!" });
        setTimeout(() => (window.location.href = "/login"), 1000);
      } else {
        setServerError(res.data.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Lỗi hệ thống! Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <XCircle size={16} />
              {serverError}
            </div>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
            {/* Header */}
            <div className="text-center mb-6">  
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Tạo tài khoản</h1>
              <p className="text-2x1 text-gray-500">Điền thông tin để bắt đầu</p>
            </div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 bg-white/50 focus:bg-white transition-all outline-none ${
                    errors.fullname
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
              </div>
              {errors.fullname && <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 bg-white/50 focus:bg-white transition-all outline-none ${
                    errors.email
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* SĐT + Ngày sinh */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Số điện thoại"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 bg-white/50 focus:bg-white transition-all outline-none ${
                      errors.phone
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                    maxLength={11}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Ngày sinh
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" size={18} />
                  <DatePicker
                    selected={dob}
                    onChange={(date) => setDob(date)}
                    dateFormat="dd/MM/yyyy"
                    maxDate={new Date()}
                    showMonthDropdown
                    showYearDropdown
                    placeholderText="Chọn ngày sinh"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 bg-white/50 focus:bg-white transition-all outline-none ${
                      errors.dob
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                  />
                </div>
                {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border-2 bg-white/50 focus:bg-white transition-all outline-none ${
                    errors.password
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border-2 bg-white/50 focus:bg-white transition-all outline-none ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* OTP */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Mã xác thực OTP
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Send className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Nhập mã OTP"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 bg-white/50 focus:bg-white transition-all outline-none ${
                      errors.otp
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                    maxLength={6}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={countdown > 0}
                  className={`min-w-[90px] px-5 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                    countdown > 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:scale-105"
                  }`}
                >
                  {countdown > 0 ? `${countdown}s` : "Gửi"}
                </button>
              </div>
              {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
              {otpMessage && (
                <div
                  className={`text-xs mt-2 flex items-center gap-1.5 ${
                    otpMessage.type === "error" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {otpMessage.type === "error" ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                  {otpMessage.text}
                </div>
              )}
            </div>
            {/* Điều khoản & Chính sách */}
            <div className="flex flex-col gap-1 mt-3">
              <label className="flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 accent-blue-600"
                />
                <span>
                  Tôi đồng ý với{" "}
                  <Link to="/terms" className="text-blue-600 font-medium hover:underline">
                    Điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link to="/privacy" className="text-blue-600 font-medium hover:underline">
                    Chính sách bảo mật
                  </Link>.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-red-500 text-xs mt-0.5">{errors.agreeTerms}</p>
              )}
            </div>
            {/* Submit Button */}
            <button type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 mt-6"
            >
              Đăng ký ngay
            </button>
            
          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Đăng nhập
            </Link>
          </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;