import React from "react";
import { Link } from "react-router-dom";

const PaymentFail: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Thanh toán thất bại!</h1>
        <p className="text-gray-700 mb-4">
          Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
        </p>
        <Link to="/payment" className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition">
          Quay lại mua hàng
        </Link>
      </div>
    </div>
  );
};

export default PaymentFail;
