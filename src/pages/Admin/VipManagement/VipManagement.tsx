import api from "../../../config/axios";
import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import LoadingSkeleton from "../../../components/common/LoadingSpinner/LoadingSkeleton";
import { Package, Save, BadgeDollarSign, Clock, Edit3 } from "lucide-react";
import { showToast } from "../../../utils/toast";

interface Package {
  _id: string;
  name: string;
  type: "basic" | "advanced" | "premium";
  durationMonths: number;
  originalPrice: number;
  discountedPrice: number;
  description?: string;
}

const VipManagementPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get("/vip");
        const order = ["basic", "advanced", "premium"];
        const sorted = res.data.data.sort(
          (a: Package, b: Package) =>
            order.indexOf(a.type) - order.indexOf(b.type)
        );
        setPackages(sorted);
      } catch (err: any) {
        showToast(err.response?.data?.message || "Lỗi khi tải dữ liệu gói VIP", "error");
        console.error("Lỗi lấy gói VIP:", err);
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

      if (field === "discountedPrice" && numValue > updated[index].originalPrice) numValue = updated[index].originalPrice;
      if (field === "originalPrice" && numValue < updated[index].discountedPrice) updated[index].discountedPrice = numValue;

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
      const message = err.response?.data?.message || "Lỗi khi cập nhật gói VIP";
      showToast(message, "error");
    } finally {
      setSavingId(null);
    }
  };

  const getPackageStyle = (type: string) => {
    switch (type) {
      case "basic":
        return "from-blue-500 to-blue-600 border-blue-200";
      case "advanced":
        return "from-purple-500 to-purple-600 border-purple-200";
      case "premium":
        return "from-amber-500 to-amber-600 border-amber-200";
      default:
        return "from-gray-500 to-gray-600 border-gray-200";
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "basic":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "advanced":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "premium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      <LeftSidebarAdmin customHeight="h-auto w-64" />
      <div className="flex-1 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Quản lý gói VIP
            </h1>
            <p className="text-gray-600">Chỉnh sửa giá và mô tả các gói thành viên</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <div
                key={pkg._id}
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
              >
                {/* Gradient Header */}
                <div
                  className={`h-2 bg-gradient-to-r ${getPackageStyle(pkg.type)}`}
                ></div>

                <div className="p-6">
                  {/* Package Name & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {pkg.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(
                        pkg.type
                      )}`}
                    >
                      {pkg.type.toUpperCase()}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 text-gray-600 mb-5">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{pkg.durationMonths} tháng</span>
                  </div>

                  {/* Description */}
                  <div className="mb-5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Edit3 className="w-4 h-4" />
                      Mô tả gói
                    </label>
                    <textarea
                      value={pkg.description || ""}
                      maxLength={300}
                      onChange={(e) =>
                        handleFieldChange(index, "description", e.target.value)
                      }
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                      rows={4}
                      placeholder="Nhập mô tả gói VIP..."
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {pkg.description?.length || 0}/300
                    </p>
                  </div>

                 {/* Price Section - Enhanced */}
                <div className="space-y-5 mb-6">
                  {/* Discount Badge & Percentage */}
                  <div className="flex items-center justify-between bg-red-50 p-3 rounded-xl border border-red-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        -{Math.round(((pkg.originalPrice - pkg.discountedPrice) / pkg.originalPrice) * 100)}%
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Tiết kiệm</p>
                        <p className="text-sm font-bold text-red-700">
                          {(pkg.originalPrice - pkg.discountedPrice).toLocaleString("vi-VN")} VNĐ
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 line-through">
                        {pkg.originalPrice.toLocaleString("vi-VN")} VNĐ
                      </p>
                      <p className="text-lg font-bold text-red-700">
                        {pkg.discountedPrice.toLocaleString("vi-VN")} VNĐ
                      </p>
                    </div>
                  </div>
                  {/* Original Price */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <BadgeDollarSign className="w-4 h-4" />
                      Giá gốc
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={pkg.originalPrice.toLocaleString("vi-VN")}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          handleFieldChange(index, "originalPrice", raw ? Number(raw) : 0);
                        }}
                        className="w-full pl-5 pr-16 py-3.5 text-base font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded-xl transition-all duration-200 placeholder-gray-400"
                        placeholder="0"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                        <span className="text-sm font-medium text-gray-500">VNĐ</span>
                      </div>
                    </div>
                  </div>

                  {/* Discounted Price */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <BadgeDollarSign className="w-4 h-4 text-gray-700" />
                      Giá sau giảm
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={pkg.discountedPrice.toLocaleString("vi-VN")}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          handleFieldChange(index, "discountedPrice", raw ? Number(raw) : 0);
                        }}
                        className="w-full pl-5 pr-16 py-3.5 text-base font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded-xl transition-all duration-200 placeholder-gray-400"
                        placeholder="0"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                        <span className="text-sm font-medium text-gray-500">VNĐ</span>
                      </div>
                    </div>
                  </div>
                </div>
                  {/* Save Button */}
                  <button onClick={() => handleSave(pkg)}
                    disabled={savingId === pkg._id}
                    className={`
                        w-full py-3 px-6 rounded-2xl font-semibold text-white flex items-center justify-center gap-3
                        transition-all duration-300 transform
                        ${
                          savingId === pkg._id
                            ? "bg-gray-500 cursor-not-allowed opacity-80"
                            : "bg-gray-600 hover:bg-gray-700 shadow-md hover:shadow-lg hover:-translate-y-1"
                        }
                      `}
                  >
                    {savingId === pkg._id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VipManagementPage;