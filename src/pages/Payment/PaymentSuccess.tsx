import React from "react";
import { Link } from "react-router-dom";

const PaymentSuccess: React.FC = () => {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Thanh toán thành công!</h1>
        <Link to="/purchase-history" className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition">
          Xem lịch sử mua hàng
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
