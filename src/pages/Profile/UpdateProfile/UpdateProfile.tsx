import React, { useState, useEffect, useRef } from "react";
import api from "../../../config/axios";
import { showToast } from "../../../utils/toast";
import { Eye, EyeOff, User, Lock, Shield, Camera, Calendar, Mail, Check } from "lucide-react";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UpdateProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"basic" | "privacy" | "password">("basic");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
  const [privacySettings, setPrivacySettings] = useState({ showEmail: true });
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ oldPassword: "", newPassword: "", confirmPassword: "", success: "" });
  const [dob, setDob] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load dữ liệu từ localStorage khi mount
  useEffect(() => {
    setFullname(localStorage.getItem("fullname") || "/img/avatar/default_avatar.jpg");
    setEmail(localStorage.getItem("email") || "");
    setAvatarPreview(localStorage.getItem("avatarUrl") || "/img/avatar/default_avatar.jpg");

    const storedDob = localStorage.getItem("dob");
    setDob(storedDob || null);
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview && avatar) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatar, avatarPreview]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate tuổi
    if (dob) {
      const birth = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      const d = today.getDate() - birth.getDate();
      if (m < 0 || (m === 0 && d < 0)) age--;
      if (age < 16) {
        showToast("Người dùng phải từ 16 tuổi trở lên để cập nhật thông tin.", "error");
        setLoading(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("fullname", fullname);
      formData.append("dob", dob || "");
      if (avatar) formData.append("avatar", avatar);

      const res = await api.patch("/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const user = res.data.data;
        localStorage.setItem("fullname", user.fullname);
        localStorage.setItem("dob", user.dob || "");
        if (user.avatar) localStorage.setItem("avatarUrl", user.avatar);

        const event = new Event("user-updated");
        window.dispatchEvent(event);

        setAvatar(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setAvatarPreview(user.avatarUrl || "");
        showToast("Cập nhật thông tin thành công!", "success", { autoClose: 800 });
        setTimeout(() => {
          window.location.reload();
        }, 1300);
      } else {
        showToast("Cập nhật thông tin thất bại!", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Lỗi khi cập nhật thông tin", "error");
    } finally {
      setLoading(false);
    }
  };

  // Submit Quyền riêng tư
  const handlePrivacySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Cập nhật quyền riêng tư thành công!", "success");
  };

  // Submit Đổi mật khẩu
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { oldPassword: "", newPassword: "", confirmPassword: "", success: "" };
    let hasError = false;

    if (!passwords.oldPassword) { newErrors.oldPassword = "Vui lòng nhập mật khẩu cũ"; hasError = true; }
    if (!passwords.newPassword) { newErrors.newPassword = "Vui lòng nhập mật khẩu mới"; hasError = true; }
    else if (passwords.newPassword.length < 6) { newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự"; hasError = true; }
    if (!passwords.confirmPassword) { newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"; hasError = true; }
    else if (passwords.newPassword !== passwords.confirmPassword) { newErrors.confirmPassword = "Mật khẩu xác nhận không khớp"; hasError = true; }

    setErrors(newErrors);
    if (hasError) return;

    try {
      const res = await api.patch("/auth/change-password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });

      if (res.data.success) {
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setErrors({ oldPassword: "", newPassword: "", confirmPassword: "", success: "Đổi mật khẩu thành công!" });
      } else {
        setErrors({ ...newErrors, oldPassword: res.data.message || "Mật khẩu cũ không đúng" });
      }
    } catch (err: any) {
      setErrors({ ...newErrors, oldPassword: err.response?.data?.message || "Lỗi khi đổi mật khẩu" });
    }
  };

  const tabs = [
    { id: "basic", label: "Chỉnh sửa thông tin", icon: User },
    { id: "privacy", label: "Quyền riêng tư", icon: Shield },
    { id: "password", label: "Bảo mật", icon: Lock }
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
       {/* Sidebar */}
      <LeftSidebarAdmin customHeight="h-auto w-64" />
      <div className="flex-1 max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Thông tin cá nhân</h1>
          <p className="text-gray-500">Quản lý thông tin và cài đặt tài khoản của bạn</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Basic Tab */}
        {activeTab === "basic" && (
          <div className="p-8 space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center py-6 border-b border-gray-100">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <User size={48} className="text-white" />
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors">
                  <Camera size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={loading}
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">Nhấn vào biểu tượng để thay đổi ảnh đại diện</p>
            </div>

            {/* Form Fields in 1 row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Email (read-only) */}
              <div className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Fullname */}
              <div className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} /> Họ và tên
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>

              {/* DOB */}
              <div className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} /> Ngày sinh
                </label>
                <DatePicker
                  selected={dob ? new Date(dob) : null}
                  onChange={(date: Date | null) => setDob(date ? date.toISOString().split("T")[0] : null)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-transparent transition-all text-gray-700"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Chọn ngày sinh"
                  maxDate={new Date()}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmitBasic}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        )}

          {/* Privacy */}
          {activeTab === "privacy" && (
            <div className="p-8 space-y-6">
              <div className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={20} />
                    <div>
                      <p className="font-medium text-gray-700">Hiển thị email công khai</p>
                      <p className="text-sm text-gray-500">Cho phép người khác xem địa chỉ email của bạn</p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={privacySettings.showEmail}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handlePrivacySubmit}
                  className="px-8 py-3 bg-green-600 text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <Check size={18} />
                  Lưu cài đặt
                </button>
              </div>
            </div>
          )}

          {/* Password */}
          {activeTab === "password" && (
            <div className="p-8 space-y-6">
              {["old", "new", "confirm"].map((type) => {
                const labelMap: any = {
                  old: "Mật khẩu hiện tại",
                  new: "Mật khẩu mới",
                  confirm: "Xác nhận mật khẩu mới"
                };
                const valueMap: any = {
                  old: passwords.oldPassword,
                  new: passwords.newPassword,
                  confirm: passwords.confirmPassword
                };
                const errorMap: any = {
                  old: errors.oldPassword,
                  new: errors.newPassword,
                  confirm: errors.confirmPassword
                };
                return (
                  <div key={type}>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Lock size={16} />
                      {labelMap[type]}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword[type as keyof typeof showPassword] ? "text" : "password"}
                        value={valueMap[type]}
                        onChange={(e) =>
                          setPasswords({ ...passwords, [type + "Password"]: e.target.value } as any)
                        }
                        className={`w-full px-4 py-3 pr-12 border rounded-xl focus:border-transparent transition-all ${
                          errorMap[type] ? "border-red-400 bg-red-50" : "border-gray-200"
                        }`}
                        maxLength={50}
                        placeholder={labelMap[type]}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword({ ...showPassword, [type]: !showPassword[type as keyof typeof showPassword] })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword[type as keyof typeof showPassword] ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errorMap[type] && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">{errorMap[type]}</p>}
                  </div>
                );
              })}

              {errors.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 text-sm flex items-center gap-2">
                    <Check size={16} />
                    {errors.success}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button onClick={handlePasswordSubmit} className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2">
                  <Lock size={18} />
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
