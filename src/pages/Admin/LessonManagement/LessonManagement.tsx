import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import api from "../../../config/axios";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../../utils/toast";
import EditLessonModal from "./Modals/UpdateLessonModal";
import CreateLessonModal from "./Modals/CreateLessonModal";
import DeleteLessonModal from "./Modals/DeleteLessonModal";
import ImportFillBlankModal from "./Modals/ImportFillBlankModal";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import Pagination from "../../../components/common/Pagination/Pagination";
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { BookOpen, Eye, Heart, MoreHorizontal, Search, Trash2, Upload, Plus, FileSpreadsheet,} from "lucide-react";
import DataFilterBar from "../../../components/common/FilterBar/DataFilterBar";

interface Lesson {
  _id: string;
  title: string;
  type: "reading" | "vocabulary";
  accessLevel: "free" | "basic" | "advanced" | "premium";
  views: number;
  favoriteCount: number;
  isFavorite: boolean;
  createdAt: string;
}

const ITEMS_PER_PAGE = 8;

const ACCESS_LEVEL_STYLES: Record<string, string> = {
  free: "bg-emerald-50 text-emerald-700",
  basic: "bg-blue-50 text-blue-700",
  advanced: "bg-violet-50 text-violet-700",
  premium: "bg-amber-50 text-amber-700",
};

const ACCESS_LEVEL_LABELS: Record<string, string> = {
  free: "Miễn phí",
  basic: "Basic",
  advanced: "Advanced",
  premium: "Premium",
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  accent,
  index,
}: {
  label: string;
  value: string | number;
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
        {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
      </p>
    </div>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
      <Icon className="w-5 h-5" strokeWidth={1.8} />
    </div>
  </motion.div>
);

const LessonManagementPage: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isFillBlankModalOpen, setIsFillBlankModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<string>("");

  const navigate = useNavigate();

  const fetchLessons = useCallback(async () => {
    try {
      const res = await api.get("/lessons");
      setLessons(res.data.data);
    } catch (err) {
      console.error(err);
      showToast("Lấy danh sách bài học thất bại!", "error");
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!validTypes.includes(file.type)) {
      showToast("Chỉ chấp nhận file Excel (.xlsx, .xls)", "error");
      return;
    }
    setExcelFile(file);
    setPreviewData([]);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        const processed = jsonData
          .map((row: any, index) => {
            const sentence = String(
              row["Câu hỏi"] || row["Cau hoi"] || row["sentence"] || row["Sentence"] || ""
            ).trim();
            if (!sentence) return null;
            const blankMap = new Map<number, string>();
            for (let i = 1; i <= 10; i++) {
              const value = row[`Blank ${i}`] || row[`blank ${i}`] || row[`Blank${i}`] || "";
              if (!value) continue;
              const text = String(value).trim();
              if (!text) continue;
              const match = text.match(/^(\d+):?\s*(.+)$/i);
              let pos: number;
              let answer: string;
              if (match) {
                pos = parseInt(match[1], 10) - 1;
                answer = match[2].trim().toLowerCase();
              } else {
                pos = i - 1;
                answer = text.trim().toLowerCase();
              }
              if (pos < 0) continue;
              blankMap.set(pos, answer);
            }
            const blanks = Array.from(blankMap.entries())
              .sort(([a], [b]) => a - b)
              .map(([position, answer]) => ({ position, answer }));
            return { no: index + 1, sentence, blanks, blankCount: blanks.length };
          })
          .filter(Boolean) as any[];
        setPreviewData(processed);
        if (processed.length === 0) {
          showToast("Không tìm thấy dữ liệu hợp lệ nào!", "warn");
        } else {
          showToast(`Đã tải ${processed.length} câu hỏi thành công!`, "success");
        }
      } catch (err) {
        console.error(err);
        showToast("Lỗi khi đọc file Excel!", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportListeningQuestions = async () => {
    if (!excelFile || previewData.length === 0) {
      showToast("Không có dữ liệu để nhập!", "error");
      return;
    }
    setIsImporting(true);
    try {
      const questions = previewData.map((item) => ({ sentence: item.sentence, blanks: item.blanks }));
      const res = await api.post("/practice/import", { questions });
      if (res.data.errors?.length > 0) {
        res.data.errors.forEach((err: string) => showToast(err, "warn"));
      }
      showToast(`Nhập thành công ${res.data.data?.importedCount || questions.length} câu hỏi!`, "success");
      setIsFillBlankModalOpen(false);
      setExcelFile(null);
      setPreviewData([]);
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0] || "Nhập dữ liệu thất bại!";
      showToast(message, "error");
    } finally {
      setIsImporting(false);
    }
  };

  const toggleMenu = (lessonId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setMenuOpenId(menuOpenId === lessonId ? null : lessonId);
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

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || lesson.type === filterType;
      const matchesLevel = !filterLevel || lesson.accessLevel === filterLevel;
      return matchesSearch && matchesType && matchesLevel;
    });
  }, [lessons, searchTerm, filterType, filterLevel]);

  const totalPages = Math.ceil(filteredLessons.length / ITEMS_PER_PAGE);
  const paginatedLessons = filteredLessons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterLevel]);

  const handleDelete = async (id: string) => {
    try {
      await api.patch(`/lessons/${id}/delete`);
      setLessons((prev) => prev.filter((l) => l._id !== id));
      showToast("Xóa bài học thành công!", "success");
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
      showToast("Xóa bài học thất bại!", "error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "docx") {
        showToast("Chỉ được chọn file Word (.docx)!", "error");
        e.target.value = "";
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "docx") {
        showToast("Chỉ được chọn file Word (.docx)!", "error");
        e.target.value = "";
        setEditFile(null);
        return;
      }
      setEditFile(file);
    } else {
      setEditFile(null);
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLesson) return;
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement)?.value.trim();
    const type = form.type.value;
    const accessLevel = form.accessLevel.value;
    if (!title || !type || !accessLevel) {
      showToast("Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }
    setIsUpdating(true);
    try {
      let res;
      if (editFile) {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("type", type);
        formData.append("accessLevel", accessLevel);
        formData.append("file", editFile);
        res = await api.put(`/lessons/${editingLesson._id}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await api.put(`/lessons/${editingLesson._id}`, { title, type, accessLevel });
      }
      showToast("Cập nhật bài học thành công!", "success");
      setLessons((prev) => prev.map((l) => (l._id === editingLesson._id ? res.data.data : l)));
      setIsEditModalOpen(false);
      setEditFile(null);
      setEditingLesson(null);
    } catch (err) {
      showToast("Cập nhật bài học thất bại!", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem("title") as HTMLInputElement)?.value.trim();
    const type = form.type.value;
    const accessLevel = form.accessLevel.value;
    if (!selectedFile) {
      showToast("Vui lòng chọn file .docx trước khi tạo!", "error");
      return;
    }
    if (!title || !type || !accessLevel) {
      showToast("Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);
    formData.append("accessLevel", accessLevel);
    formData.append("file", selectedFile);
    setIsSubmitting(true);
    try {
      const res = await api.post("/lessons/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Tạo bài học thành công!", "success");
      await fetchLessons();
      setLessons((prev) => [
        ...prev,
        {
          ...res.data.data,
          views: res.data.data.views ?? 0,
          favoriteCount: res.data.data.favoriteCount ?? 0,
          isFavorite: res.data.data.isFavorite ?? false,
        },
      ]);
      setIsModalOpen(false);
      setSelectedFile(null);
      form.reset();
    } catch (err) {
      console.error(err);
      showToast("Tạo bài học thất bại!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f5f4fb]">
      <LeftSidebarAdmin customHeight="h-auto w-64" />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-indigo-400" strokeWidth={1.8} />
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-widest">Nội dung</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Quản lý bài học</h1>
              <p className="text-sm text-gray-400 mt-1">Quản lý toàn bộ nội dung bài học trong hệ thống</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 h-9 px-4 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" strokeWidth={2} />
                Tạo bài mới
              </button>
              <button onClick={() => setIsFillBlankModalOpen(true)}
                className="flex items-center gap-2 h-9 px-4 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                <FileSpreadsheet className="w-4 h-4" strokeWidth={1.8} />
                Thêm điền khuyết
              </button>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Tổng bài học"
            value={lessons.length}
            icon={BookOpen}
            accent="bg-indigo-50 text-indigo-500"
            index={0}
          />
          <StatCard
            label="Tổng lượt xem"
            value={lessons.reduce((s, l) => s + l.views, 0)}
            icon={Eye}
            accent="bg-violet-50 text-violet-500"
            index={1}
          />
          <StatCard
            label="Tổng yêu thích"
            value={lessons.reduce((s, l) => s + l.favoriteCount, 0)}
            icon={Heart}
            accent="bg-fuchsia-50 text-fuchsia-500"
            index={2}
          />
        </div>

        {/* Filters */}
        <DataFilterBar
          search={{
            value: searchTerm,
            onChange: setSearchTerm,
            placeholder: "Tìm kiếm theo tiêu đề...",
          }}
          selects={[
            {
              key: "type",
              label: "Loại bài học",
              value: filterType,
              onChange: setFilterType,
              color: "blue",
              options: [
                { value: "reading", label: "Reading" },
                { value: "vocabulary", label: "Vocabulary" },
              ],
            },
            {
              key: "level",
              label: "Cấp độ truy cập",
              value: filterLevel,
              onChange: setFilterLevel,
              color: "violet",
              options: [
                { value: "free", label: "Miễn phí" },
                { value: "basic", label: "Basic" },
                { value: "advanced", label: "Advanced" },
                { value: "premium", label: "Premium" },
              ],
            },
          ]}
          onResetFilters={() => {
            setFilterType("");
            setFilterLevel("");
          }}
        />

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.21 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-200">
                {["STT", "Tiêu đề", "Loại", "Cấp độ", "Views", "Yêu thích", "Ngày tạo", ""].map(
                  (h, i) => (
                    <th
                      key={i}
                      className={`py-3 px-4 text-xs font-semibold text-gray-800 uppercase tracking-wide ${
                        i === 0 || i >= 4 ? "text-center" : "text-left"
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedLessons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                    Không tìm thấy bài học nào.
                  </td>
                </tr>
              ) : (
                paginatedLessons.map((lesson, index) => (
                  <tr key={lesson._id} className="hover:bg-gray-100 transition-colors group">
                    <td className="py-3.5 px-4 text-center text-sm text-gray-400 w-12">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-medium text-gray-800 max-w-[240px] truncate">
                      {lesson.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                          lesson.type === "reading"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {lesson.type === "reading" ? "Reading" : "Vocabulary"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                          ACCESS_LEVEL_STYLES[lesson.accessLevel] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {ACCESS_LEVEL_LABELS[lesson.accessLevel] || lesson.accessLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center gap-1 text-sm text-gray-800">
                        <Eye className="w-3.5 h-3.5 text-gray-300" strokeWidth={1.8} />
                        {lesson.views.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center gap-1 text-sm text-gray-800">
                        <Heart className="w-3.5 h-3.5 text-rose-300" strokeWidth={1.8} />
                        {lesson.favoriteCount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-sm text-gray-800">
                      {new Date(lesson.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3.5 px-4 text-center relative w-12">
                      <button onClick={(e) => toggleMenu(lesson._id, e)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {menuOpenId === lesson._id && (
                        <div
                          ref={menuRef}
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute right-3 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden py-1 ${
                            [
                              paginatedLessons.length - 1,
                              paginatedLessons.length - 2,
                              paginatedLessons.length - 3,
                            ].includes(paginatedLessons.findIndex((l) => l._id === lesson._id))
                              ? "bottom-full mb-1"
                              : "top-full mt-1"
                          }`}
                        >
                          <button onClick={() => { navigate(`/resource/${lesson._id}`); setMenuOpenId(null); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            <Eye className="w-4 h-4 text-gray-400" strokeWidth={1.8} />
                            Xem chi tiết
                          </button>
                          <button onClick={() => { setEditingLesson(lesson); setIsEditModalOpen(true); setMenuOpenId(null); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                            <Upload className="w-4 h-4 text-gray-400" strokeWidth={1.8} />
                            Cập nhật bài học
                          </button>
                          <div className="my-1 border-t border-gray-50" />
                          <button
                            onClick={() => { setDeleteConfirmId(lesson._id); setMenuOpenId(null); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                            Xóa bài học
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="px-4 py-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          )}
        </motion.div>

        {/* Modals */}
        {isModalOpen && (
          <CreateLessonModal
            isOpen={isModalOpen}
            isSubmitting={isSubmitting}
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
            onSubmit={handleCreateLesson}
            onClose={() => { setIsModalOpen(false); setSelectedFile(null); }}
          />
        )}
        {isEditModalOpen && editingLesson && (
          <EditLessonModal
            isOpen={isEditModalOpen}
            lesson={editingLesson}
            isUpdating={isUpdating}
            editFile={editFile}
            onFileChange={handleEditFileChange}
            onSubmit={handleUpdateLesson}
            onClose={() => { setIsEditModalOpen(false); setEditingLesson(null); setEditFile(null); }}
          />
        )}
        {deleteConfirmId && (
          <DeleteLessonModal
            lessonId={deleteConfirmId}
            onConfirm={handleDelete}
            onClose={() => setDeleteConfirmId(null)}
          />
        )}
        <ImportFillBlankModal
          isOpen={isFillBlankModalOpen}
          excelFile={excelFile}
          previewData={previewData}
          isImporting={isImporting}
          onExcelFileChange={handleExcelFileChange}
          onImport={handleImportListeningQuestions}
          onClose={() => { setIsFillBlankModalOpen(false); setExcelFile(null); setPreviewData([]); }}
        />
      </div>
    </div>
  );
};

export default LessonManagementPage;