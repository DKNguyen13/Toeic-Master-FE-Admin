import { FaSave } from "react-icons/fa";
import api from "../../../config/axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import LoadingSkeleton from "../../../components/common/LoadingSpinner/LoadingSkeleton";

interface Package {
  _id: string;
  name: string;
  type: "basic" | "pro" | "premium";
  durationMonths: number;
  originalPrice: number;
  discountedPrice: number;
  description?: string;
}

const VipManagementPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

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
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value as string;
    }
    setPackages(updated);
  };

  const handleSave = async (pkg: Package) => {
    try {
      await api.put(`/vip/${pkg._id}`, { originalPrice: pkg.originalPrice, discountedPrice: pkg.discountedPrice, description: pkg.description });
      toast.success(`Lưu thành công gói ${pkg.name}`);
    } catch (err: any) {
      const message = err.response?.data?.message || "Lỗi khi cập nhật gói VIP";
      toast.error(`${message}`);
    }
  };

  if (loading) return <LoadingSkeleton/>;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <LeftSidebarAdmin customHeight="h-auto w-64" />

      <ToastContainer position="top-right" autoClose={1500} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản lý gói VIP</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <div key={pkg._id} className="bg-white p-5 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2">{pkg.name}</h3>
              <p className="mb-2">Thời hạn: {pkg.durationMonths} tháng</p>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả:
                </label>
                <textarea value={pkg.description || ""}
                  maxLength={300}
                  onChange={(e) => handleFieldChange(index, "description", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                  rows={7}
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Giá gốc:</label>
                <div className="mt-1 relative">
                  <input type="number" max={999999999}  
                    value={pkg.originalPrice}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "originalPrice",
                        Number(e.target.value)
                      )
                    }
                    className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.value.length > 9) {
                        target.value = target.value.slice(0, 9);
                      }
                    }}
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">VNĐ</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Giá giảm:</label>
                <div className="mt-1 relative">
                  <input max={999999999} type="number"
                    value={pkg.discountedPrice}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "discountedPrice",
                        Number(e.target.value)
                      )
                    }
                    className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.value.length > 9) {
                        target.value = target.value.slice(0, 9);
                      }
                    }}
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">VNĐ</span>
                </div>
              </div>

              <button onClick={() => handleSave(pkg)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2">
                <FaSave /> Lưu
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VipManagementPage;
