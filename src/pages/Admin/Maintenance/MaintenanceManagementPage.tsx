import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../config/axios";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import { showToast } from "../../../utils/toast";
import {
  ShieldAlert,
  ShieldCheck,
  Clock3,
  AlarmClock,
  Wrench,
  Settings,
  Power,
  PowerOff,
  MessageSquareText,
  History,
} from "lucide-react";

const MaintenanceManagementPage: React.FC = () => {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  const [form, setForm] = useState({
    startAt: "",
    endAt: "",
    message: "Hệ thống đang được bảo trì, vui lòng quay lại sau.",
  });

  const toLocalInputValue = (dateValue: string) => {
    const date = new Date(dateValue);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  const toISOStringFromLocalInput = (value: string) => {
    return new Date(value).toISOString();
  };

  const fetchData = async () => {
    try {
      const res = await api.get("/admin/maintenance");
      const data = res.data.data;

      setState(data);

      setForm((prev) => ({
        ...prev,
        message: data?.message || prev.message,
        startAt: data?.startAt ? toLocalInputValue(data.startAt) : "",
        endAt: data?.endAt ? toLocalInputValue(data.endAt) : "",
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getMinDateTimeLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const duration = state?.startAt && state?.endAt  ? Math.round((new Date(state.endAt).getTime() - new Date(state.startAt).getTime()) / 60000) : 0;
  const getDurationText = () => {
    if (!state?.startAt || !state?.endAt) return "--";

    const diff = new Date(state.endAt).getTime() - new Date(state.startAt).getTime();
    if (diff <= 0) return "--";
    const totalMinutes = Math.floor(diff / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) return `${hours} giờ ${minutes} phút`;
    if (hours > 0) return `${hours} giờ`;
    return `${minutes} phút`;
  };

  const getRemainingTime = () => {
    if (!state?.startAt || !state?.endAt) return "--";

    const start = new Date(state.startAt).getTime();
    const end = new Date(state.endAt).getTime();

    if (now < start) {
      const diff = start - now;
      return `Bắt đầu sau ${formatTime(diff)}`;
    }

    if (now >= start && now <= end) {
      const diff = end - now;
      return `Còn ${formatTime(diff)}`;
    }
    return "Đã kết thúc";
  };

  const formatTime = (diff: number) => {
    const totalSeconds = Math.floor(diff / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0)
      return `${hours} giờ ${minutes} phút ${seconds} giây`;

    if (minutes > 0)
      return `${minutes} phút ${seconds} giây`;

    return `${seconds} giây`;
  };

  const handleStart = async () => {
    if (!form.endAt) {
      showToast("Chọn thời gian kết thúc", "warn");
      return;
    }

    const startDate = form.startAt ? new Date(form.startAt) : new Date();
    const endDate = new Date(form.endAt);
    
    if (form.startAt && startDate < new Date()) {
      showToast("Thời gian bắt đầu không được nhỏ hơn hiện tại", "warn");
      return;
    }

    if (endDate <= startDate) {
      showToast("Thời gian kết thúc phải lớn hơn thời gian bắt đầu", "warn");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        startAt: form.startAt
          ? toISOStringFromLocalInput(form.startAt)
          : new Date().toISOString(),

        endAt: toISOStringFromLocalInput(form.endAt),

        message: form.message,
      };

      const res = await api.post("/admin/maintenance", payload);
      setState(res.data.data);

      showToast("Đã bật bảo trì", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Lỗi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);

    try {
      const res = await api.delete("/admin/maintenance");
      setState(res.data.data);

      showToast("Đã tắt bảo trì", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Lỗi", "error");
    } finally {
      setLoading(false);
    }
  };

  const active = state?.active;
  const maintenanceInfo = [
    {
      label: "Trạng thái",
      value: state?.active ? "Đang bảo trì" : "Hoạt động",
    },
    {
      label: "Bắt đầu",
      value: state?.startAt
        ? new Date(state.startAt).toLocaleString("vi-VN")
        : "--",
    },
    {
      label: "Kết thúc",
      value: state?.endAt
        ? new Date(state.endAt).toLocaleString("vi-VN")
        : "--",
    },
    {
      label: "Thời gian",
      value: getRemainingTime(),
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#f5f4fb]">
      <LeftSidebarAdmin customHeight="h-auto w-64" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-5 h-5 text-indigo-400" strokeWidth={1.8} />
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">Hệ thống</span>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Maintenance</h1>
          <p className="text-sm text-gray-400 mt-1">Quản lý trạng thái bảo trì và thông báo hệ thống</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Trạng thái</span>
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  active
                    ? "bg-amber-50 text-amber-500"
                    : "bg-emerald-50 text-emerald-500"
                }`}
              >
                {active ? (
                  <ShieldAlert className="w-4.5 h-4.5" />
                ) : (
                  <ShieldCheck className="w-4.5 h-4.5" />
                )}
              </span>
            </div>

            <p className="text-2xl font-semibold text-gray-900 tracking-tight">
              {active ? "Bảo trì" : "Ổn định"}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              {active ? "Người dùng đang bị chặn truy cập" : "Hệ thống hoạt động bình thường"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Bắt đầu</span>
              <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-500">
                <Clock3 className="w-4.5 h-4.5" />
              </span>
            </div>

            <p className="text-lg font-semibold text-gray-900 tracking-tight">
              {state?.startAt
                ? new Date(state.startAt).toLocaleDateString("vi-VN")
                : "--/--/----"}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              {state?.startAt
                ? new Date(state.startAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Chưa có lịch bắt đầu"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Kết thúc</span>
              <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-50 text-violet-500">
                <AlarmClock className="w-4.5 h-4.5" />
              </span>
            </div>

            <p className="text-lg font-semibold text-gray-900 tracking-tight">
              {state?.endAt
                ? new Date(state.endAt).toLocaleDateString("vi-VN")
                : "--/--/----"}
            </p>

            <p className="text-xs text-gray-400 mt-2">
              {state?.endAt
                ? new Date(state.endAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Chưa có lịch kết thúc"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.21 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Thời lượng</span>
              <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-fuchsia-50 text-fuchsia-500">
                <Clock3 className="w-4.5 h-4.5" />
              </span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{getDurationText()}</p>
            <p className="text-xs text-gray-400 mt-2">Khoảng thời gian bảo trì</p>
          </motion.div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Config form */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-0.5">
                  Cấu hình
                </p>
                <h2 className="text-xl font-semibold text-gray-900">
                  Bảo trì hệ thống
                </h2>
              </div>

              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  active
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {active ? "Đang bật" : "Đang tắt"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Thời gian bắt đầu
                </label>
                <input
                  type="datetime-local"
                  min={getMinDateTimeLocal()}
                  value={form.startAt}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startAt: e.target.value }))
                  }
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Thời gian kết thúc
                </label>
                <input
                  type="datetime-local"
                  min={form.startAt || getMinDateTimeLocal()}
                  value={form.endAt}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, endAt: e.target.value }))
                  }
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Thông báo hiển thị cho người dùng</label>
              <div className="relative">
                <MessageSquareText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  rows={4}
                  maxLength={500}
                  value={form.message}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, message: e.target.value }))
                  }
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex-1 h-11 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Power className="w-4 h-4" />
                Bật bảo trì
              </button>

              <button
                onClick={handleStop}
                disabled={loading}
                className="flex-1 h-11 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-black transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <PowerOff className="w-4 h-4" />
                Tắt bảo trì
              </button>
            </div>
          </motion.div>

          {/* Schedule placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-0.5">Thông tin</p>
                <h2 className="text-xl font-semibold text-gray-900">Cấu hình hiện tại</h2>
              </div>

              <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-500">
                <History className="w-4.5 h-4.5" />
              </span>
            </div>

           <div className="space-y-4">
              {maintenanceInfo.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-500">{item.label}</span>

                  <span className="font-medium text-gray-900 text-right max-w-[60%] break-all">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Current message preview */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-indigo-400" />
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
              Preview thông báo
            </p>
          </div>

          <div className="rounded-2xl bg-[#f5f4fb] border border-indigo-50 p-5">
            <p className="text-sm text-gray-600 leading-relaxed">
              {form.message || "Chưa có thông báo bảo trì."}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenanceManagementPage;