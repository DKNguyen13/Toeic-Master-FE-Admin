import * as XLSX from "xlsx";
import FileSaver from "file-saver";
import api from "../../../config/axios";
import React, { useEffect, useRef, useState } from "react";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import LoadingSkeleton from "../../../components/common/LoadingSpinner/LoadingSkeleton";
import {
  Search,
  Users,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  MoreVertical,
  Check,
  Sparkles,
  X,
} from "lucide-react";
import { showToast } from "../../../utils/toast";
import Pagination from "../../../components/common/Pagination/Pagination";

interface User {
  id: number;
  _id: string;
  fullname: string;
  email: string;
  phone: string;
  role: string;
  authType: string;
  registerDate?: string;
  status?: "Active" | "Inactive";
}

const UserManagementPage: React.FC = () => {
  const [allUsersCount, setAllUsersCount] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "Tất cả" | "Active" | "Inactive"
  >("Tất cả");
  const [authTypeFilter, setAuthTypeFilter] = useState<
    "Tất cả" | "google" | "normal"
  >("Tất cả");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  const pageSize = 8;

  const exportExcel = () => {
    if (!users || users.length === 0) return;

    // Tạo sheet từ dữ liệu
    const ws = XLSX.utils.json_to_sheet(
      users.map((u) => ({
        ID: u.id,
        Tên: u.fullname,
        Email: u.email,
        SĐT: u.phone,
        LoạiTK: u.authType === "google" ? "Google" : "Thường",
        NgàyĐK: u.registerDate || "N/A",
        TrạngThái: u.status,
      }))
    );

    // Tính độ rộng cột tự động
    const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][];
    const maxLengths: number[] = [];
    rows.forEach((row) => {
      row.forEach((cell, idx) => {
        const len = cell ? cell.toString().length : 10;
        maxLengths[idx] = Math.max(maxLengths[idx] || 10, len);
      });
    });

    ws["!cols"] = maxLengths.map((width) => ({ wch: width + 2 }));

    // Style header: in đậm và nền màu
    const range = XLSX.utils.decode_range(ws["!ref"] || "");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1E40AF" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
    // Tạo workbook và xuất
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Người dùng");

    const wbout = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    FileSaver.saveAs(blob, "users.xlsx");
  };

  const handleFilterChange = (type: "status" | "authType", value: string) => {
    if (type === "status")
      setStatusFilter(value as "Tất cả" | "Active" | "Inactive");
    if (type === "authType")
      setAuthTypeFilter(value as "Tất cả" | "google" | "normal");
  };

  const filteredUsers = users.filter((user) => {
    const statusMatch =
      statusFilter === "Tất cả" || user.status === statusFilter;
    const authMatch =
      authTypeFilter === "Tất cả" || user.authType === authTypeFilter;
    return statusMatch && authMatch;
  });

  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${page}&limit=${pageSize}`);
      const data = res.data.data;

      setUsers(
        data.users.map((user: any, index: number) => ({
          id: (page - 1) * pageSize + index + 1,
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          role: user.role,
          authType: user.authType || "normal",
          registerDate: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : "",
          status: user.isActive ? "Active" : "Inactive",
        }))
      );
      setTotalUsers(data.total);
      setAllUsersCount(data.total);
    } catch (err) {
      console.error("Lấy danh sách người dùng lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        filterOpen &&
        filterRef.current &&
        filterButtonRef.current &&
        !filterRef.current.contains(target) &&
        !filterButtonRef.current.contains(target)
      ) {
        setFilterOpen(false);
      }

      if (
        menuOpenId &&
        actionMenuRef.current &&
        !actionMenuRef.current.contains(target)
      ) {
        setMenuOpenId(null);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [filterOpen, menuOpenId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchUsers(1);
      return;
    }

    setIsSearching(true);
    try {
      const res = await api.get(
        `/admin/search-users?q=${encodeURIComponent(searchTerm)}`
      );
      const data = res.data.data.hits || [];

      setUsers(
        data.map((user: any, index: number) => ({
          id: index + 1,
          _id: user.id,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          role: user.role,
          authType: user.authType || "normal",
          registerDate: "",
          status: user.isActive ? "Active" : "Inactive",
        }))
      );
      setTotalUsers(data.length);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  const toggleMenu = (userId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuOpenId(menuOpenId === userId ? null : userId);
    setMenuPosition({
      x: rect.right - 160,
      y: rect.bottom + window.scrollY,
    });
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await api.patch("/admin/activate", { email: user.email });
      setUsers((prev) =>
        prev.map((u) =>
          u.email === user.email
            ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
            : u
        )
      );
      showToast(
        `User ${user.fullname} đã ${
          user.status === "Active" ? "vô hiệu hóa" : "kích hoạt"
        }!`,
        "success"
      );
      setMenuOpenId(null);
    } catch (err) {
      console.error("Cập nhật trạng thái lỗi:", err);
    }
  };

  if (loading) return <LoadingSkeleton />;

  const activeUsers = users.filter((u) => u.status === "Active").length;
  const inactiveUsers = users.filter((u) => u.status === "Inactive").length;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <LeftSidebarAdmin customHeight="h-auto w-64" />
      <div className="flex-1 p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Quản lý người dùng
            </h1>
            <p className="text-gray-600 text-sm flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-800" />
              <span className="font-semibold text-gray-800">
                Tổng người dùng: {allUsersCount}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchUsers(currentPage)}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-400 rounded-xl text-gray-700 hover:bg-gray-200 transition"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              Làm mới
            </button>
            <button
              onClick={exportExcel}
              className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
            >
              <Download className="w-4 h-4" />
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tổng người dùng */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng người dùng</p>
                <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Đang hoạt động */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Đang hoạt động</p>
                <p className="text-3xl font-bold text-gray-900">
                  {activeUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Không hoạt động */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Không hoạt động</p>
                <p className="text-3xl font-bold text-gray-900">
                  {inactiveUsers}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
                <XCircle className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          {/* Search Box */}
          <div className="relative flex-1 group">
            {/* Gradient border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 group-focus-within:opacity-30 blur transition duration-300"></div>

            <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                {/* Search Icon */}
                <div className="absolute left-4 flex items-center pointer-events-none">
                  <Search
                    className={`w-5 h-5 transition-all duration-300 ${
                      searchTerm ? "text-blue-600 scale-110" : "text-gray-400"
                    }`}
                  />
                </div>

                {/* Input */}
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  value={searchTerm}
                  maxLength={60}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(e);
                    }
                  }}
                  className="w-full py-3.5 pl-12 pr-32 text-gray-800 placeholder-gray-400 bg-transparent rounded-2xl outline-none transition-all"
                />

                {/* Clear button */}
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-28 p-1.5 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-all duration-300 transform hover:scale-110 hover:rotate-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="absolute right-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSearching ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang tìm...
                    </span>
                  ) : (
                    "Tìm kiếm"
                  )}
                </button>
              </div>

              {/* Character count */}
              {searchTerm && (
                <div className="px-4 pb-2 pt-1 flex items-center gap-2 border-t border-gray-100">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-gray-500">
                    {searchTerm.length}/60 ký tự
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Filter Button */}
          <div className="relative">
            <button
              ref={filterButtonRef}
              onClick={() => setFilterOpen(!filterOpen)}
              className="relative group h-full min-w-[140px]"
            >
              {/* Gradient border */}
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300 ${
                  filterOpen ? "opacity-30" : ""
                }`}
              ></div>

              <div
                className={`relative flex items-center justify-center gap-2 px-5 py-3.5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  filterOpen ? "ring-2 ring-purple-500 ring-opacity-50" : ""
                }`}
              >
                <Filter
                  className={`w-5 h-5 transition-all duration-300 ${
                    (statusFilter !== "Tất cả" ? 1 : 0) +
                      (authTypeFilter !== "Tất cả" ? 1 : 0) >
                    0
                      ? "text-purple-600"
                      : "text-gray-600"
                  }`}
                />
                <span className="font-medium text-gray-700">Bộ lọc</span>

                {/* Active filters badge */}
                {(statusFilter !== "Tất cả" ? 1 : 0) +
                  (authTypeFilter !== "Tất cả" ? 1 : 0) >
                  0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {(statusFilter !== "Tất cả" ? 1 : 0) +
                      (authTypeFilter !== "Tất cả" ? 1 : 0)}
                  </span>
                )}
              </div>
            </button>

            {/* Filter Dropdown */}
            {filterOpen && (
              <div
                ref={filterRef}
                className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                style={{
                  animation: "slideDown 0.2s ease-out",
                }}
              >
                {/* Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Filter className="w-4 h-4 text-purple-600" />
                      Bộ lọc
                    </h3>
                    {(statusFilter !== "Tất cả" ? 1 : 0) +
                      (authTypeFilter !== "Tất cả" ? 1 : 0) >
                      0 && (
                      <button
                        onClick={() => {
                          setStatusFilter("Tất cả");
                          setAuthTypeFilter("Tất cả");
                        }}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium underline"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 max-h-96 overflow-y-auto">
                  {/* Status Filter */}
                  <div className="mb-4">
                    <p className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      Trạng thái
                    </p>
                    <div className="space-y-1">
                      {["Tất cả", "Active", "Inactive"].map((status) => (
                        <button
                          key={status}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                            statusFilter === status
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-[1.02]"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                          onClick={() => handleFilterChange("status", status)}
                        >
                          <span className="font-medium text-sm">{status}</span>
                          {statusFilter === status && (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auth Type Filter */}
                  <div>
                    <p className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      Loại tài khoản
                    </p>
                    <div className="space-y-1">
                      {[
                        { key: "Tất cả", label: "Tất cả" },
                        { key: "google", label: "Google" },
                        { key: "normal", label: "Thường" },
                      ].map((type) => (
                        <button
                          key={type.key}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                            authTypeFilter === type.key
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md transform scale-[1.02]"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                          onClick={() =>
                            handleFilterChange("authType", type.key)
                          }
                        >
                          <span className="font-medium text-sm">
                            {type.label}
                          </span>
                          {authTypeFilter === type.key && (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(statusFilter !== "Tất cả" ? 1 : 0) +
          (authTypeFilter !== "Tất cả" ? 1 : 0) >
          0 && (
          <div
            className="flex flex-wrap gap-2 mb-6"
            style={{ animation: "fadeIn 0.3s ease-out" }}
          >
            <span className="text-sm text-gray-600 self-center">Đang lọc:</span>
            {statusFilter !== "Tất cả" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Trạng thái: {statusFilter}
                <button
                  onClick={() => setStatusFilter("Tất cả")}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {authTypeFilter !== "Tất cả" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Loại:{" "}
                {authTypeFilter === "normal"
                  ? "Thường"
                  : authTypeFilter === "google"
                  ? "Google"
                  : authTypeFilter}
                <button
                  onClick={() => setAuthTypeFilter("Tất cả")}
                  className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <style>{`
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`}</style>

        {/* User Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left text-base font-semibold">
                <th className="px-4 py-4">ID</th>
                <th className="px-4 py-4">Tên người dùng</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">SĐT</th>
                <th className="px-4 py-4">Loại</th>
                <th className="px-4 py-4">Ngày đăng ký</th>
                <th className="px-4 py-4">Trạng thái</th>
                <th className="px-4 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 text-center">{user.id}</td>
                    <td
                      className="px-4 py-4 max-w-[200px] truncate"
                      title={user.fullname}
                    >
                      {user.fullname}
                    </td>
                    <td className="px-4 py-4">{user.email}</td>
                    <td className="px-4 py-4">{user.phone}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          user.authType === "google"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.authType === "google" ? "Google" : "Thường"}
                      </span>
                    </td>
                    <td className="px-4 py-4">{user.registerDate || "N/A"}</td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="text-gray-500 hover:text-blue-600"
                        onClick={(e) => toggleMenu(user._id, e)}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500">
                    Không tìm thấy người dùng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!searchTerm && users.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Action Menu */}
        {menuOpenId && menuPosition && (
          <div
            ref={actionMenuRef}
            className="fixed bg-white border rounded-lg shadow p-2 z-50"
            style={{ top: menuPosition.y, left: menuPosition.x }}
          >
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
              onClick={() => {
                const user = users.find((u) => u._id === menuOpenId);
                if (user) handleToggleStatus(user);
              }}
            >
              {users.find((u) => u._id === menuOpenId)?.status === "Active"
                ? "Vô hiệu hóa tài khoản"
                : "Kích hoạt tài khoản"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
