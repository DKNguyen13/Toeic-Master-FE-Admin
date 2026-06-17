import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React, { useRef, useState } from "react";
import { FaTimes, FaUpload } from "react-icons/fa";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import Pagination from "../../../components/common/Pagination/Pagination";
import { getAllTest, getAllTestForAdmin, modifyTest } from "../../../service/testService";
import { MoreHorizontal, Plus, Trash2, CheckCircle, Edit2 } from "lucide-react";

interface Test {
  title: string;
  slug: string;
  testCode: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  statistics: {
    totalAttempts: number;
    averageScore: number;
  };
  limit?: number; // Giới hạn số test mỗi trang
  showPagination?: boolean; // Ẩn/hiện phân trang
}

const TestManagementPage: React.FC<Test> = ({
  limit = 8,
  showPagination = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tests, setTests] = useState<Test[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalTests, setTotalTests] = useState<number>(0);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const totalPages = Math.ceil(totalTests / limit);

  const fetchTests = async () => {
    const response = await getAllTestForAdmin(currentPage, 10);
    setTests(response.tests || []);
    setTotalTests(response.pagination?.totalTests || 0);
  };

  useEffect(() => {
    fetchTests();
  }, [currentPage]);

  const toggleMenu = (testCode: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setMenuOpenId(menuOpenId === testCode ? null : testCode);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpenId && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpenId]);

  const navigate = useNavigate();
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <LeftSidebarAdmin customHeight="h-auto w-64" />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý đề thi</h1>
          <button onClick={() => handleNavigate("/admin/import-test")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl 
                     hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 
                     font-semibold flex items-center gap-2">
            <Plus size={16} />
            Tạo đề thi mới
          </button>
        </div>

        {/* Bảng danh sách đề thi */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-visible">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Tên đề thi</th>
                <th className="py-3 px-4 text-center">Lượt làm</th>
                {/* <th className="py-3 px-4 text-center">Điểm trung bình</th> */}
                <th className="py-3 px-4 text-center">Ngày tạo</th>
                <th className="py-3 px-4 text-center">Ngày cập nhật</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {tests.map((test, index) => (
                <tr key={test.testCode}
                  className={`border-b hover:bg-gray-100 transition ${
                    index % 2 === 0 ? "bg-gray-50" : ""
                  }`}>
                  <td className="py-4 px-4">
                    <span className="font-mono text-blue-600 font-semibold">
                      {test.testCode}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-800">
                      {test.title}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {test.statistics.totalAttempts.toLocaleString()}
                    </span>
                  </td>
                  {/* <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {test.statistics.averageScore}
                    </span>
                  </td> */}
                  <td className="py-4 px-4 text-center">
                    {new Date(test.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {new Date(test.updatedAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
                      ${test.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {test.isActive === true ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center relative">
                    <button onClick={(e) => toggleMenu(test.testCode, e)} className="text-gray-500 hover:text-blue-600 transition p-1.5 rounded-lg hover:bg-gray-100">
                      <MoreHorizontal size={20} />
                    </button>

                    {/* Dropdown menu */}
                    {menuOpenId === test.testCode && (
                      <div
                        ref={menuRef}
                        className={`absolute right-4 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden ${
                          [tests.length - 1, tests.length - 2, tests.length - 3]
                            .includes(tests.findIndex(t => t.testCode === test.testCode))
                            ? "bottom-full mb-2"
                            : "top-full mt-2"
                        }`}
                        onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => {
                            handleNavigate(`/admin/edit-test/${test.slug}`);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-yellow-50 text-gray-700 hover:text-yellow-600 transition">
                          <Edit2 className="w-5 h-5 text-yellow-600" />
                          <span className="font-medium">Chỉnh sửa đề thi</span>
                        </button>

                        <button onClick={async () => {
                            if (confirm(`Bạn có chắc muốn ${test.isActive ? "vô hiệu hóa" : "kích hoạt"} đề thi "${test.title}"?`)) {
                              await modifyTest(test.slug);
                              fetchTests();
                              setMenuOpenId(null);
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-5 py-4 transition font-medium ${test.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}>
                          {test.isActive ? (
                            <>
                              <Trash2 className="w-5 h-5" />
                              <span>Vô hiệu hóa</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              <span>Kích hoạt</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          {showPagination && totalTests > limit && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
      </div>

      {/* Modal add question */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button className="absolute top-3 right-3 text-red-600 text-xl"
              onClick={() => setIsModalOpen(false)}>
              <FaTimes />
            </button>

            <button className="flex items-center gap-2 border border-gray-400 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition">
              <FaUpload />
              Upload File
            </button>

            <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
              Thêm đề thi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestManagementPage;