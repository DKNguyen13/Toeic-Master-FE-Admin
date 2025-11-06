import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import LeftSidebarUser from "../../components/LeftSidebarUser";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

interface PurchaseOrder {
  _id: string;
  orderId: string;
  packageName: string;
  startDate?: string | null;
  endDate?: string | null;
  pricePaid: number;
  status: "pending" | "success" | "fail";
}

const PAGE_SIZE = 5;

const PurchaseHistory: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/auth/purchase-history");
        setOrders(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return format(date, "dd/MM/yyyy", { locale: vi });
  };

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + " ₫";

  const renderStatus = (status: "pending" | "success" | "fail") => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-600 font-medium">
            <FaCheckCircle /> Thành công
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-600 font-medium">
            <FaClock /> Đang chờ
          </span>
        );
      case "fail":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-500 font-medium">
            <FaTimesCircle /> Thất bại
          </span>
        );
      default:
        return null;
    }
  };

  // Pagination
  const totalPages = Math.ceil(orders.length / PAGE_SIZE);
  const currentOrders = orders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Sidebar */}
      <LeftSidebarUser customHeight="h-auto w-64" />
      <div className="flex-1 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Lịch sử mua hàng
          </h1>

          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            {loading ? (
              <p className="text-center text-gray-500 py-10">Đang tải...</p>
            ) : orders.length === 0 ? (
              <p className="text-center text-gray-500 py-10">Chưa có đơn hàng nào.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-700 font-medium">Order ID</th>
                        <th className="px-4 py-3 text-left text-gray-700 font-medium">Gói</th>
                        <th className="px-4 py-3 text-left text-gray-700 font-medium">Ngày bắt đầu</th>
                        <th className="px-4 py-3 text-left text-gray-700 font-medium">Ngày kết thúc</th>
                        <th className="px-4 py-3 text-left text-gray-700 font-medium">Giá</th>
                        <th className="px-4 py-3 text-left text-gray-700 font-medium">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3">{order.orderId}</td>
                          <td className="px-4 py-3 font-medium">{order.packageName}</td>
                          <td className="px-4 py-3">{formatDate(order.startDate)}</td>
                          <td className="px-4 py-3">{formatDate(order.endDate)}</td>
                          <td className="px-4 py-3">{formatPrice(order.pricePaid)}</td>
                          <td className="px-4 py-3">{renderStatus(order.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4 gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded ${
                          currentPage === i + 1
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseHistory;
