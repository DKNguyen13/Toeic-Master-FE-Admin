import api from "../../../config/axios";
import React, { useState, useEffect, useRef } from "react";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import 'react-toastify/dist/ReactToastify.css';
import { showToast } from "../../../utils/toast";

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
  const [dob, setDob] = useState<Date | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load dữ liệu từ localStorage
  useEffect(() => {
    setFullname(localStorage.getItem("fullname") || "");
    setEmail(localStorage.getItem("email") || "");
    setAvatarPreview(localStorage.getItem("avatarUrl") || "");

    const storedDob = localStorage.getItem("dob");
    if (storedDob) {
      const date = new Date(storedDob);
      if (!isNaN(date.getTime())) {
        setDob(date);
      } else {
        setDob(null);
      }
    } else {
      setDob(null);
    }
  }, []);

  // Giải phóng object URL khi component unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Cập nhật thông tin cơ bản
  const handleSubmitBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (dob) {
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();
      let realAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        realAge -= 1;
      }
      if (realAge < 16) {
        showToast("Người dùng phải từ 16 tuổi trở lên để cập nhật thông tin.", "error");
        setLoading(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("fullname", fullname);
      formData.append("dob", dob ? dob.toISOString().split("T")[0] : "");

      if (avatar) formData.append("avatar", avatar);

      const res = await api.patch("/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const user = res.data.data;

        localStorage.setItem("fullname", user.fullname);
        localStorage.setItem("dob", user.dob || "");
        if (user.avatarUrl) localStorage.setItem("avatarUrl", user.avatarUrl);

        window.dispatchEvent(new Event("userUpdated"));

        setAvatar(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (user.avatarUrl) setAvatarPreview(user.avatarUrl);
        setAvatarPreview(user.avatarUrl || "");
        showToast("Cập nhật thông tin thành công!", "success");
      }
      else {
        showToast("Cập nhật thông tin thất bại!", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Lỗi khi cập nhật thông tin", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật quyền riêng tư
  const handlePrivacySubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Đổi mật khẩu
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { oldPassword: "", newPassword: "", confirmPassword: "", success: "" };
    let hasError = false;

    if (!passwords.oldPassword) {
      newErrors.oldPassword = "Vui lòng nhập mật khẩu cũ";
      hasError = true;
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
      hasError = true;
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
      hasError = true;
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      hasError = true;
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      hasError = true;
    }

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
      console.error(err);
      setErrors({ ...newErrors, oldPassword: err.response?.data?.message || "Lỗi khi đổi mật khẩu" });
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <LeftSidebarAdmin customHeight="h-auto w-64" />

      <div className="flex-1 p-6">
        <h1 className="text-3xl font-semibold text-black mb-6 text-center">
          Cập nhật thông tin cá nhân
        </h1>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          {["basic", "privacy", "password"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 -mb-px border-b-2 font-medium ${
                activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab(tab as "basic" | "privacy" | "password")}
            >
              {tab === "basic" ? "Thông tin cơ bản" : tab === "privacy" ? "Quyền riêng tư" : "Thay mật khẩu"}
            </button>
          ))}
        </div>

        {/* Tab Thông tin cơ bản */}
        {activeTab === "basic" && (
          <form className="space-y-4 bg-white p-6 rounded shadow" onSubmit={handleSubmitBasic}>
            <div>
              <label className="block mb-1 font-semibold">Email</label>
              <p className="text-sm text-gray-500">{email}</p>
            </div>

            <div className="flex space-x-4">
              {/* Họ và tên */}
              <div className="flex-1 flex flex-col">
                <label className="mb-1 font-semibold">Họ và tên</label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full p-2 border rounded h-10"
                  disabled={loading}
                />
              </div>

              {/* Ngày sinh */}
              <div className="flex-1 flex flex-col">
                <label className="mb-1 font-semibold">Ngày sinh</label>
                <DatePicker
                  selected={dob}
                  onChange={(date) => setDob(date)}
                  placeholderText="Chọn ngày sinh"
                  className="w-full p-2 border rounded h-10"
                  dateFormat="dd/MM/yyyy"
                />

              </div>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Ảnh đại diện</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={loading}
                ref={fileInputRef}
              />
              {avatarPreview && (
                <img src={avatarPreview} alt="preview" className="mt-2 w-32 h-32 object-cover rounded-full border" />
              )}
            </div>

            <div className="text-right pt-4">
              <button
                type="submit"
                className={`bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                {loading ? "Đang cập nhật..." : "Lưu"}
              </button>
            </div>
          </form>
        )}

        {/* Tab Quyền riêng tư */}
        {activeTab === "privacy" && (
          <form className="space-y-4 bg-white p-6 rounded shadow" onSubmit={handlePrivacySubmit}>
            <h2 className="text-lg font-semibold mb-4">Quyền riêng tư</h2>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={privacySettings.showEmail}
                onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
              />
              <span>Hiển thị email công khai</span>
            </label>
            <div className="text-right pt-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Lưu quyền riêng tư
              </button>
            </div>
          </form>
        )}

        {/* Tab Đổi mật khẩu */}
        {activeTab === "password" && (
          <form className="space-y-4 bg-white p-6 rounded shadow" onSubmit={handlePasswordSubmit}>
            <h2 className="text-lg font-semibold mb-4">Đổi mật khẩu</h2>

            {/* Mật khẩu cũ */}
            <div className="relative">
              <label className="block mb-1 font-semibold">Mật khẩu cũ</label>
              <input
                type={showPassword.old ? "text" : "password"}
                className={`w-full p-2 border rounded pr-10 ${errors.oldPassword ? "border-red-500" : ""}`}
                value={passwords.oldPassword}
                onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
              />
              <span
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
                onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
              >
                {showPassword.old ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
              {errors.oldPassword && <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>}
            </div>

            {/* Mật khẩu mới */}
            <div className="relative">
              <label className="block mb-1 font-semibold">Mật khẩu mới</label>
              <input
                type={showPassword.new ? "text" : "password"}
                className={`w-full p-2 border rounded pr-10 ${errors.newPassword ? "border-red-500" : ""}`}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              />
              <span
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
                onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
              >
                {showPassword.new ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className="relative">
              <label className="block mb-1 font-semibold">Xác nhận mật khẩu mới</label>
              <input
                type={showPassword.confirm ? "text" : "password"}
                className={`w-full p-2 border rounded pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              />
              <span
                className="absolute right-3 top-9 cursor-pointer text-gray-600"
                onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
              >
                {showPassword.confirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {errors.success && <p className="text-green-600 text-sm">{errors.success}</p>}

            <div className="text-right pt-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Đổi mật khẩu
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateProfile;
