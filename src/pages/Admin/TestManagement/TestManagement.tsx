import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import Pagination from "../../../components/common/Pagination/Pagination";
import { getAllTestForAdmin, modifyTest } from "../../../service/testService";
import { MoreHorizontal, Plus, Trash2, CheckCircle, Edit2, FileText } from "lucide-react";

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
  limit?: number;
  showPagination?: boolean;
}

const TestManagementPage: React.FC<Pick<Test, "limit" | "showPagination">> = ({
  limit = 8,
  showPagination = true,
}) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalTests, setTotalTests] = useState<number>(0);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

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

  const activeTests = tests.filter((t) => t.isActive).length;
  const totalAttempts = tests.reduce((s, t) => s + t.statistics.totalAttempts, 0);

  return (
    <div className="min-h-screen flex bg-[#f5f4fb]">
      <LeftSidebarAdmin customHeight="h-auto w-64" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-indigo-400" strokeWidth={1.8} />
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">
              Đề thi
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Quản lý đề thi
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Tổng cộng{" "}
                <span className="font-medium text-gray-600">{totalTests.toLocaleString("vi-VN")}</span>{" "}
                đề thi trong hệ thống
              </p>
            </div>
            <button onClick={() => navigate("/admin/import-test")}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm self-start lg:self-auto">
              <Plus className="w-4 h-4" strokeWidth={2} />
              Tạo đề thi mới
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Tổng đề thi",
              value: totalTests,
              icon: FileText,
              accent: "bg-indigo-50 text-indigo-500",
            },
            {
              label: "Đang hoạt động",
              value: activeTests,
              icon: CheckCircle,
              accent: "bg-emerald-50 text-emerald-500",
            },
            {
              label: "Tổng lượt làm",
              value: totalAttempts,
              icon: FileText,
              accent: "bg-violet-50 text-violet-500",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{card.label}</p>
                <p className="text-2xl font-semibold text-gray-900 tracking-tight">
                  {card.value.toLocaleString("vi-VN")}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.accent}`}>
                <card.icon className="w-5 h-5" strokeWidth={1.8} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.21 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-200">
                {["Mã đề", "Tên đề thi", "Lượt làm", "Ngày tạo", "Cập nhật", "Trạng thái", ""].map(
                  (h, i) => (
                    <th
                      key={i}
                      className={`py-3 px-4 text-xs font-semibold text-gray-800 uppercase tracking-wide ${
                        i === 0 || i >= 2 ? "text-center" : "text-left"
                      }`}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-gray-400">
                    Chưa có đề thi nào.
                  </td>
                </tr>
              ) : (
                tests.map((test, index) => (
                  <tr key={test.testCode} className="hover:bg-gray-100 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{test.testCode}</span>
                    </td>
                    <td className="py-3.5 px-4 text-sm font-medium text-gray-800 max-w-[260px] truncate">{test.title}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700">
                        {test.statistics.totalAttempts.toLocaleString("vi-VN")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-sm text-gray-800">{new Date(test.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td className="py-3.5 px-4 text-center text-sm text-gray-800">
                      {new Date(test.updatedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${ test.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {test.isActive ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center relative w-12">
                      <button onClick={(e) => toggleMenu(test.testCode, e)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {menuOpenId === test.testCode && (
                        <div
                          ref={menuRef}
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute right-3 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden py-1 ${
                            [tests.length - 1, tests.length - 2, tests.length - 3].includes(index) ? "bottom-full mb-1" : "top-full mt-1"}`}>
                          <button
                            onClick={() => {
                              navigate(`/admin/edit-test/${test.slug}`);
                              setMenuOpenId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            <Edit2 className="w-4 h-4 text-amber-500" strokeWidth={1.8} />
                            Chỉnh sửa đề thi
                          </button>
                          <div className="my-1 border-t border-gray-50" />
                          <button
                            onClick={async () => {
                              if (confirm(`Bạn có chắc muốn ${test.isActive ? "vô hiệu hóa" : "kích hoạt"} đề thi "${test.title}"?`)) {
                                await modifyTest(test.slug);
                                fetchTests();
                                setMenuOpenId(null);
                              }
                            }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                              test.isActive ? "text-rose-500 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"}`}>
                            {test.isActive ? (
                              <>
                                <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                                Vô hiệu hóa
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" strokeWidth={1.8} />
                                Kích hoạt
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {showPagination && totalTests > limit && (
            <div className="px-4 py-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TestManagementPage;