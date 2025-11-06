import React from "react";
import { Link } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
        <h1 className="text-9xl font-extrabold text-blue-600">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">
          Trang không tồn tại
        </h2>
        <p className="mt-2 text-gray-600">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>

        <Link
          to="/"
          className="inline-flex items-center mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          <AiOutlineHome className="mr-2" size={20} />
          Quay về Trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
