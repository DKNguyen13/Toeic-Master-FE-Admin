import { motion } from "framer-motion";
import api from "../../../config/axios";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../../utils/toast";
import React, { useEffect, useState } from "react";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import { Crown, Save, BadgeDollarSign, Clock, Edit3 } from "lucide-react";
import LoadingSkeleton from "../../../components/common/LoadingSpinner/LoadingSkeleton";

interface Package {
  _id: string;
  name: string;
  type: "basic" | "advanced" | "premium";
  durationMonths: number;
  originalPrice: number;
  discountedPrice: number;
  description?: string;
}

const TYPE_CONFIG = {
  basic: {
    label: "Basic",
    accent: "bg-blue-50 text-blue-700 border-blue-100",
    bar: "bg-blue-500",
    ring: "focus:ring-blue-300 focus:border-blue-400",
    badge: "bg-blue-600",
    saving: "bg-blue-50 border-blue-100 text-blue-700",
  },
  advanced: {
    label: "Advanced",
    accent: "bg-violet-50 text-violet-700 border-violet-100",
    bar: "bg-violet-500",
    ring: "focus:ring-violet-300 focus:border-violet-400",
    badge: "bg-violet-600",
    saving: "bg-violet-50 border-violet-100 text-violet-700",
  },
  premium: {
    label: "Premium",
    accent: "bg-amber-50 text-amber-700 border-amber-100",
    bar: "bg-amber-500",
    ring: "focus:ring-amber-300 focus:border-amber-400",
    badge: "bg-amber-500",
    saving: "bg-amber-50 border-amber-100 text-amber-700",
  },
};

const VipManagementPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get("/vip");
        const order = ["basic", "advanced", "premium"];
        const sorted = res.data.data.sort((a: Package, b: Package) => order.indexOf(a.type) - order.indexOf(b.type));
        setPackages(sorted);
      } catch (err: any) {
        showToast(err.response?.data?.message || "Lỗi khi tải dữ liệu gói VIP", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleFieldChange = (
    index: number,
    field: "originalPrice" | "discountedPrice" | "description",
    value: string | number
  ) => {
    const updated = [...packages];
    if (field === "originalPrice" || field === "discountedPrice") {
      let numValue = Number(value) || 0;
      if (field === "discountedPrice" && numValue > updated[index].originalPrice)
        numValue = updated[index].originalPrice;
      if (field === "originalPrice" && numValue < updated[index].discountedPrice)
        updated[index].discountedPrice = numValue;
      updated[index][field] = numValue;
    } else {
      updated[index][field] = value as string;
    }
    setPackages(updated);
  };

  const handleSave = async (pkg: Package) => {
    setSavingId(pkg._id);
    try {
      await api.put(`/vip/${pkg._id}`, {
        originalPrice: pkg.originalPrice,
        discountedPrice: pkg.discountedPrice,
        description: pkg.description,
      });
      showToast(`Lưu thành công gói ${pkg.name}`, "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Lỗi khi cập nhật gói VIP", "error");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen flex bg-[#f5f4fb]">
      <LeftSidebarAdmin customHeight="h-auto w-64" />

      <div className="flex-1 p-8 max-w-screen-xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-4 h-4 text-indigo-400" strokeWidth={1.8} />
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">
              Gói thành viên
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Quản lý gói VIP</h1>
          <p className="text-sm text-gray-400 mt-0.5">Chỉnh sửa giá và mô tả cho từng gói thành viên</p>
        </div>

        {/* Package cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, index) => {
            const cfg = TYPE_CONFIG[pkg.type] ?? TYPE_CONFIG.basic;
            const discountPct = pkg.originalPrice > 0 ? Math.round(((pkg.originalPrice - pkg.discountedPrice) / pkg.originalPrice) * 100) : 0;
            const saving = pkg.originalPrice - pkg.discountedPrice;

            return (
              <motion.div
                key={pkg._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: index * 0.08 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                {/* Top accent bar */}
                <div className={`h-1 w-full ${cfg.bar}`} />

                <div className="p-6 flex flex-col flex-1 gap-5">
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                        {pkg.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-gray-400 text-xs">
                        <Clock className="w-3.5 h-3.5" strokeWidth={1.8} />
                        <span>{pkg.durationMonths} tháng</span>
                      </div>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg border ${cfg.accent}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Saving badge */}
                  {discountPct > 0 && (
                    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${cfg.saving}`}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center ${cfg.badge}`}
                        >
                          -{discountPct}%
                        </span>
                        <div>
                          <p className="text-xs opacity-70">Tiết kiệm</p>
                          <p className="text-sm font-semibold">
                            {saving.toLocaleString("vi-VN")} ₫
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs line-through opacity-50">
                          {pkg.originalPrice.toLocaleString("vi-VN")} ₫
                        </p>
                        <p className="text-base font-bold">
                          {pkg.discountedPrice.toLocaleString("vi-VN")} ₫
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <Edit3 className="w-3.5 h-3.5" strokeWidth={1.8} />
                      Mô tả gói
                    </label>
                    <textarea value={pkg.description || ""}
                      maxLength={300}
                      onChange={(e) => handleFieldChange(index, "description", e.target.value)}
                      rows={3}
                      placeholder="Nhập mô tả gói VIP..."
                      className={`w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:bg-white transition ${cfg.ring}`}
                    />
                    <p className="text-xs text-gray-400 text-right">
                      {pkg.description?.length || 0}/300
                    </p>
                  </div>

                  {/* Price fields */}
                  <div className="flex flex-col gap-3">
                    {(
                      [
                        { field: "originalPrice" as const, label: "Giá gốc" },
                        { field: "discountedPrice" as const, label: "Giá sau giảm" },
                      ]
                    ).map(({ field, label }) => (
                      <div key={field} className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          <BadgeDollarSign className="w-3.5 h-3.5" strokeWidth={1.8} />
                          {label}
                        </label>
                        <div className="relative">
                          <input type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={pkg[field].toLocaleString("vi-VN")}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "");
                              handleFieldChange(index, field, raw ? Number(raw) : 0);
                            }}
                            className={`w-full h-10 pl-4 pr-12 text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition ${cfg.ring}`}
                            placeholder="0"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">
                            ₫
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Save button */}
                  <button
                    onClick={() => handleSave(pkg)}
                    disabled={savingId === pkg._id}
                    className={`mt-auto w-full h-10 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors ${
                      savingId === pkg._id ? "bg-gray-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                    {savingId === pkg._id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" strokeWidth={2} />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VipManagementPage;