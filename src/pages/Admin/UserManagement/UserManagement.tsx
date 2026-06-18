import * as XLSX from "xlsx";
import FileSaver from "file-saver";
import api from "../../../config/axios";
import { showToast } from "../../../utils/toast";
import UserDetailModal from "./Component/UserDetailModal";
import React, { useEffect, useRef, useState } from "react";
import { formatDateDDMMYY } from "../../../utils/formatDateDDMMYY";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import Pagination from "../../../components/common/Pagination/Pagination";
import LoadingSkeleton from "../../../components/common/LoadingSpinner/LoadingSkeleton";
import { mapUser } from "../../../mappers/user.mapper";
import { motion } from "framer-motion";
import { Search, Users, Filter, Download, RefreshCw, CheckCircle, XCircle, MoreVertical, Check, X, Shield, User } from "lucide-react";

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

const pageSize = 8;

const StatCard = ({
  label,
  value,
  icon: Icon,
  accent,
  index,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.07 }}
    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between"
  >
    <div>
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 tracking-tight">
        {value.toLocaleString("vi-VN")}
      </p>
    </div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
      <Icon className="w-5 h-5" strokeWidth={1.8} />
    </div>
  </motion.div>
);

const UserManagementPage: React.FC = () => {
  const [allUsersCount, setAllUsersCount] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"Tất cả" | "Active" | "Inactive">("Tất cả");
  const [authTypeFilter, setAuthTypeFilter] = useState<"Tất cả" | "google" | "normal">("Tất cả");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const exportExcel = async () => {
    try {
      const res = await api.get("/admin/users/export");
      const allUsers = res.data.data;
      if (!allUsers || allUsers.length === 0) {
        showToast("Không có dữ liệu để xuất", "warn", { autoClose: 500 });
        return;
      }
      const sortedUsers = [...allUsers].sort((a: any, b: any) =>
        (a.fullname || "").localeCompare(b.fullname || "", "vi", { sensitivity: "base" })
      );
      const ws = XLSX.utils.json_to_sheet(
        sortedUsers.map((u: any, index: number) => ({
          STT: index + 1,
          Tên: u.fullname,
          Email: u.email,
          SĐT: u.phone || "",
          "Loại TK": u.authType === "google" ? "Google" : "Thường",
          "Trạng thái": u.isActive ? "Active" : "Inactive",
          VIP: u.vip?.isActive ? u.vip.type : "Không",
          "Ngày đăng ký": u.createdAt ? formatDateDDMMYY(u.createdAt) : "",
        }))
      );
      const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) as any[][];
      ws["!cols"] = rows[0].map((_: any, i: number) => ({
        wch: Math.max(...rows.map((r) => (r[i] ? r[i].toString().length : 10)), 10) + 2,
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      FileSaver.saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        "toeic_master_users.xlsx"
      );
    } catch (err) {
      console.error(err);
      showToast("Xuất Excel thất bại", "error", { autoClose: 500 });
    }
  };

  const handleViewDetail = async (userId: string) => {
    setLoadingDetail(true);
    setIsModalOpen(true);
    setSelectedUserDetail(null);
    try {
      const res = await api.get(`/admin/user-detail/${userId}`);
      setSelectedUserDetail(res.data.data);
    } catch (err) {
      console.error("Lỗi lấy chi tiết user:", err);
      showToast("Không thể tải thông tin chi tiết người dùng", "error", { autoClose: 500 });
      setIsModalOpen(false);
    } finally {
      setLoadingDetail(false);
      setMenuOpenId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const statusMatch = statusFilter === "Tất cả" || user.status === statusFilter;
    const authMatch = authTypeFilter === "Tất cả" || user.authType === authTypeFilter;
    return statusMatch && authMatch;
  });

  const fetchUsers = async (page: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?page=${page}&limit=${pageSize}`);
      const data = res.data.data;
      setUsers(data.users.map((u: any, i: number) => mapUser(u, i, currentPage, pageSize)));
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
      if (menuOpenId && actionMenuRef.current && !actionMenuRef.current.contains(target)) {
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
      const res = await api.get(`/admin/search-users?q=${encodeURIComponent(searchTerm)}`);
      const data = res.data.data.hits || [];
      setUsers(
        data.map((user: any, index: number) => ({
          id: index + 1,
          _id: user._id,
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
    setMenuOpenId(menuOpenId === userId ? null : userId);
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
        `${user.fullname} đã ${user.status === "Active" ? "bị vô hiệu hóa" : "được kích hoạt"}!`,
        "success",
        { autoClose: 500 }
      );
      setMenuOpenId(null);
    } catch (err) {
      console.error("Cập nhật trạng thái lỗi:", err);
    }
  };

  if (loading) return <LoadingSkeleton />;

  const activeUsers = users.filter((u) => u.status === "Active").length;
  const inactiveUsers = users.filter((u) => u.status === "Inactive").length;
  const filterActive = statusFilter !== "Tất cả" || authTypeFilter !== "Tất cả";
  const activeFilterCount =
    (statusFilter !== "Tất cả" ? 1 : 0) + (authTypeFilter !== "Tất cả" ? 1 : 0);

  return (
    <div className="min-h-screen flex bg-[#f5f4fb]">
      <LeftSidebarAdmin customHeight="h-auto w-64" />

      <div className="flex-1 p-8 max-w-screen-xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-indigo-400" strokeWidth={1.8} />
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">
              Tài khoản
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Quản lý người dùng
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Tổng cộng{" "}
                <span className="font-medium text-gray-600">{allUsersCount.toLocaleString("vi-VN")}</span>{" "}
                tài khoản trong hệ thống
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchUsers(currentPage)}
                className="flex items-center gap-2 h-9 px-4 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                <RefreshCw className="w-3.5 h-3.5" strokeWidth={2} />
                Làm mới
              </button>
              <button onClick={exportExcel}
                className="flex items-center gap-2 h-9 px-4 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                <Download className="w-3.5 h-3.5" strokeWidth={2} />
                Xuất Excel
              </button>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Tổng người dùng" value={totalUsers} icon={Users} accent="bg-indigo-50 text-indigo-500" index={0} />
          <StatCard label="Đang hoạt động" value={activeUsers} icon={CheckCircle} accent="bg-emerald-50 text-emerald-500" index={1} />
          <StatCard label="Không hoạt động" value={inactiveUsers} icon={XCircle} accent="bg-gray-100 text-gray-400" index={2} />
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm theo tên, email, số điện thoại..."
                value={searchTerm}
                maxLength={60}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(e as any); }}
                className="w-full h-9 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button onClick={handleSearch} disabled={isSearching}
              className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 shrink-0">
              {isSearching ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang tìm...
                </>
              ) : (
                "Tìm kiếm"
              )}
            </button>
          </div>

          {/* Filter button */}
          <div className="relative">
            <button ref={filterButtonRef}
              onClick={() => setFilterOpen(!filterOpen)}
              className={`relative flex items-center gap-2 h-9 px-4 rounded-xl border text-sm font-medium transition-colors shadow-sm ${
                filterActive ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
              <Filter className="w-3.5 h-3.5" strokeWidth={2} />
              Bộ lọc
              {filterActive && (
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {filterOpen && (
              <div ref={filterRef} className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <span className="text-sm font-semibold text-gray-700">Bộ lọc</span>
                  {filterActive && (
                    <button onClick={() => { setStatusFilter("Tất cả"); setAuthTypeFilter("Tất cả"); }} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                      Xóa tất cả
                    </button>
                  )}
                </div>

                <div className="p-3 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Trạng thái</p>
                    <div className="space-y-1">
                      {(["Tất cả", "Active", "Inactive"] as const).map((s) => (
                        <button key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                            statusFilter === s ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                          <span>
                            {s === "Active" ? "Đang hoạt động" : s === "Inactive" ? "Không hoạt động" : "Tất cả"}
                          </span>
                          {statusFilter === s && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Loại tài khoản</p>
                    <div className="space-y-1">
                      {([
                        { key: "Tất cả", label: "Tất cả" },
                        { key: "google", label: "Google" },
                        { key: "normal", label: "Thường" },
                      ] as const).map((t) => (
                        <button key={t.key}
                          onClick={() => setAuthTypeFilter(t.key as any)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                            authTypeFilter === t.key ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                          <span>{t.label}</span>
                          {authTypeFilter === t.key && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {filterActive && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-gray-400">Đang lọc:</span>
            {statusFilter !== "Tất cả" && (
              <span className="inline-flex items-center gap-1.5 h-7 px-3 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
                {statusFilter === "Active" ? "Đang hoạt động" : "Không hoạt động"}
                <button onClick={() => setStatusFilter("Tất cả")} className="hover:text-indigo-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {authTypeFilter !== "Tất cả" && (
              <span className="inline-flex items-center gap-1.5 h-7 px-3 bg-violet-50 text-violet-700 rounded-full text-xs font-medium border border-violet-100">
                {authTypeFilter === "google" ? "Google" : "Thường"}
                <button onClick={() => setAuthTypeFilter("Tất cả")} className="hover:text-violet-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.21 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["#", "Họ tên", "Email", "SĐT", "Loại", "Ngày đăng ký", "Trạng thái", ""].map(
                  (h, i) => (
                    <th
                      key={i}
                      className={`py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide ${
                        i === 0 || i === 7 ? "text-center" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center text-sm text-gray-400 w-12">
                      {user.id}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-medium text-gray-800 max-w-[180px] truncate">
                      {user.fullname}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-600 max-w-[200px] truncate">
                      {user.email}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-500">
                      {user.phone || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                          user.authType === "google"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {user.authType === "google" ? "Google" : "Thường"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-400">
                      {user.registerDate || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                          user.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {user.status === "Active" ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center relative w-12">
                      <button
                        onClick={(e) => toggleMenu(user._id, e)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {menuOpenId === user._id && (
                        <div
                          ref={actionMenuRef}
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute right-3 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden py-1 ${
                            [
                              filteredUsers.length - 1,
                              filteredUsers.length - 2,
                              filteredUsers.length - 3,
                            ].includes(filteredUsers.findIndex((u) => u._id === user._id))
                              ? "bottom-full mb-1"
                              : "top-full mt-1"
                          }`}
                        >
                          <button
                            onClick={() => handleViewDetail(user._id)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <User className="w-4 h-4 text-gray-400" strokeWidth={1.8} />
                            Xem chi tiết
                          </button>
                          <div className="my-1 border-t border-gray-50" />
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                              user.status === "Active"
                                ? "text-rose-500 hover:bg-rose-50"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            <Shield className="w-4 h-4" strokeWidth={1.8} />
                            {user.status === "Active" ? "Vô hiệu hóa" : "Kích hoạt"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {!searchTerm && users.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </motion.div>
      </div>

      <UserDetailModal
        user={selectedUserDetail}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedUserDetail(null); }}
        loading={loadingDetail}
      />
    </div>
  );
};

export default UserManagementPage;