import api, { isLoggedIn } from "../../config/axios.js";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginModal from "../../layouts/common/LoginModal";
import { 
  Crown, 
  Check, 
  Sparkles, 
  BookOpen, 
  Target, 
  MessageCircle,
  Zap,
  Star,
  AlertCircle,
  X
} from "lucide-react";

interface Package {
  _id: string;
  name: string;
  durationMonths: number;
  originalPrice: number;
  discountedPrice: number;
  description?: string;
  type: "basic" | "advanced" | "premium";
}

const PaymentPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get("/vip");
        setPackages(res.data.data);
      } catch (err) {
        console.error("Error fetching packages", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleBuy = async (pkgId: string) => {
    if (!isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }
    try {
      const res = await api.post("/payment/create", { packageId: pkgId });
      if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    } catch (err: any) {
      console.error("Payment error", err);
      const message =
        err.response?.data?.message || "Lỗi khi tạo đơn thanh toán";
      setPopupMessage(message);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code === "00") {
      navigate("/payment/success");
    } else if (code) {
      navigate("/payment/fail");
    }
  }, [navigate]);

  const getDiscountPercent = (original: number, discounted: number) => {
    if (original <= discounted) return null;
    return Math.round(((original - discounted) / original) * 100);
  };

  // Tìm gói phổ biến nhất (2 tháng)
  const isPopular = (months: number) => months === 2;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full mb-4 shadow-lg">
              <Crown size={18} fill="white" />
              <span className="font-semibold text-sm">Nâng cấp Premium</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trải nghiệm học tập{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                không giới hạn
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Chọn gói phù hợp với mục tiêu học tập của bạn
            </p>
          </div>

          {/* Pricing Cards */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-600 mt-4">Đang tải gói dịch vụ...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {packages.map((pkg) => {
                const discountPercent = getDiscountPercent(
                  pkg.originalPrice,
                  pkg.discountedPrice
                );
                const popular = isPopular(pkg.durationMonths);

                return (
                  <div
                    key={pkg._id}
                    className={`relative bg-white rounded-2xl transition-all duration-300 ${
                      popular
                        ? "shadow-2xl scale-105 border-2 border-blue-500"
                        : "shadow-lg hover:shadow-xl hover:scale-105 border border-gray-200"
                    }`}
                  >
                    {/* Popular Badge */}
                    {popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                          <Star size={14} fill="white" />
                          Phổ biến nhất
                        </div>
                      </div>
                    )}

                    <div className="p-8">
                      {/* Name */}
                      <h2 className="text-center text-3xl font-bold text-gray-900 mb-4">{pkg.name}</h2>
                      {/* Duration */}
                      <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-400"></div>
                        <span className="text-lg font-semibold text-blue-600 mb-4">
                          {pkg.durationMonths} tháng
                        </span>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-400"></div>
                      </div>
                        {pkg.description && (
                          <p className="text-sm text-gray-600">
                            {pkg.description.split(".")[0].trim()}.
                          </p>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="text-center mb-6 pb-6 border-b border-gray-200">
                        {discountPercent && (
                          <div className="inline-block bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full mb-3">
                            Tiết kiệm {discountPercent}%
                          </div>
                        )}

                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-gray-900">
                            {pkg.discountedPrice.toLocaleString()}
                          </span>
                          <span className="text-gray-600">đ/tháng</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <span className="text-gray-400 line-through text-lg">
                            {pkg.originalPrice.toLocaleString()}đ
                          </span>
                        </div>
                      {/* CTA Button */}
                      <button onClick={() => handleBuy(pkg._id)}
                        className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                          popular
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
                            : "bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg"
                        }`}>Đăng ký ngay</button>
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-8">
                        {pkg.description &&
                          pkg.description
                            .split(".") // tách theo dấu chấm
                            .map((line) => line.trim()) // bỏ khoảng trắng đầu/cuối
                            .filter((line) => line.length > 0) // loại bỏ dòng rỗng
                            .map((line, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                  <Check className="text-blue-600" size={14} strokeWidth={3} />
                                </div>
                                <span className="text-gray-700 text-sm">{line}</span>
                              </div>
                            ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Error Popup */}
        {popupMessage && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Thông báo</h3>
                  <p className="text-gray-600 text-sm">{popupMessage}</p>
                </div>
                <button
                  onClick={() => setPopupMessage(null)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <button
                onClick={() => setPopupMessage(null)}
                className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
};

export default PaymentPage;