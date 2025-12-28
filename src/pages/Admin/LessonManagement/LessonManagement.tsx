import * as XLSX from "xlsx";
import api from "../../../config/axios";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../../utils/toast";
import CreateLessonModal from "./Modals/CreateLessonModal";
import DeleteLessonModal from "./Modals/DeleteLessonModal";
import EditLessonModal from "./Modals/UpdateLessonModal";
import ImportFillBlankModal from "./Modals/ImportFillBlankModal";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import React, { useEffect, useState, useCallback, useMemo, useRef} from "react";
import Pagination from "../../../components/common/Pagination/Pagination";
import { BookOpen, Eye, Heart, MoreHorizontal, Search, Trash2, Upload, X } from "lucide-react";

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
  const [filterType, setFilterType] = useState<"reading" | "vocabulary" | "">("");
  const [filterLevel, setFilterLevel] = useState<"free" | "basic" | "advanced" | "premium" | "">("");

  const navigate = useNavigate();

  // Fetch lessons
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
      "application/vnd.ms-excel"
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

        const processed = jsonData.map((row: any, index) => {
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
            if (blankMap.has(pos)) {
              console.warn(`Cảnh báo: Vị trí ${pos + 1} bị trùng ở câu ${index + 1}`);
            }
            blankMap.set(pos, answer);
          }

          const blanks = Array.from(blankMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([position, answer]) => ({ position, answer }));

          return {
            no: index + 1,
            sentence,
            blanks,
            blankCount: blanks.length,
          };
        }).filter(Boolean) as any[];

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
      const questions = previewData.map(item => ({
        sentence: item.sentence,
        blanks: item.blanks,
      }));

      const res = await api.post("/practice/import", { questions });

      if (res.data.errors && res.data.errors.length > 0) {
        res.data.errors.forEach((err: string) => showToast(err, "warn"));
      }
      showToast(`Nhập thành công ${res.data.data?.importedCount || questions.length} câu hỏi!`, "success");

      setIsFillBlankModalOpen(false);
      setExcelFile(null);
      setPreviewData([]);

    } catch (err: any) {
      console.error("Import error:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        "Nhập dữ liệu thất bại! Vui lòng kiểm tra lại file.";

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

  // Pagination
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

  // Delete lesson
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

  // File selection
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

  // Submit edit form
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

    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);
    formData.append("accessLevel", accessLevel);
    if (editFile) formData.append("file", editFile);

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
        res = await api.put(`/lessons/${editingLesson._id}`, {
          title,
          type,
          accessLevel,
        });
      }

      showToast("Cập nhật bài học thành công!", "success");
      setLessons((prev) =>
        prev.map((l) => (l._id === editingLesson._id ? res.data.data : l))
      );
      setIsEditModalOpen(false);
      setEditFile(null);
      setEditingLesson(null);
    } catch (err) {
      showToast("Cập nhật bài học thất bại!", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Submit form
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
      setLessons((prev) => [...prev, res.data.data]);
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
    <div className="min-h-screen flex bg-gray-100">
      <LeftSidebarAdmin customHeight="h-auto w-64" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Quản lý bài học</h1>
              <p className="text-gray-600 mt-2 text-lg">Quản lý toàn bộ nội dung bài học trong hệ thống</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-7 py-3 rounded-2xl shadow-xl transition-all transform hover:scale-105">
                Tạo bài mới
              </button>

              <button
                onClick={() => setIsFillBlankModalOpen(true)}
                className="flex items-center gap-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-semibold px-7 py-3 rounded-2xl shadow-xl transition-all transform hover:scale-105">
                Thêm bài điền khuyết
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Search */}
            <div className="relative md:col-span-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài học theo tiêu đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-3 bg-white border border-gray-200 rounded-2xl outline-none transition-all text-gray-800 placeholder-gray-400 shadow-md text-base"
              />
            </div>

            {/* Filter Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="md:col-span-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl outline-none transition-all shadow-md">
              <option value="">Tất cả loại bài</option>
              <option value="reading">Reading</option>
              <option value="vocabulary">Vocabulary</option>
            </select>

            {/* Filter Level */}
            <select value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value as any)}
              className="md:col-span-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl outline-none transition-all shadow-md">
              <option value="">Tất cả cấp độ</option>
              <option value="free">Miễn phí</option>
              <option value="basic">Basic</option>
              <option value="advanced">Advanced</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total lessons */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng bài học</p>
                <p className="text-3xl font-bold text-gray-900">{lessons.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Tổng lượt xem */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng lượt xem</p>
                <p className="text-3xl font-bold text-gray-900">
                  {lessons.reduce((sum, l) => sum + l.views, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Eye className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Total favorite */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng yêu thích</p>
                <p className="text-3xl font-bold text-gray-900">
                  {lessons.reduce((sum, l) => sum + l.favoriteCount, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Heart className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-visible">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                <th className="py-3 px-4 text-left">STT</th>
                <th className="py-3 px-4 text-left">Tiêu đề</th>
                <th className="py-3 px-4 text-left">Loại</th>
                <th className="py-3 px-4 text-left">Quyền</th>
                <th className="py-3 px-4 text-center">Views</th>
                <th className="py-3 px-4 text-center">Thích</th>
                <th className="py-3 px-4 text-center">Ngày tạo</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {paginatedLessons.map((lesson, index) => (
                <tr key={lesson._id}
                  className={`border-b hover:bg-gray-100 transition ${index % 2 === 0 ? "bg-gray-50" : ""}`}>
                  <td className="py-4 px-4">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                  <td className="py-4 px-4">{lesson.title}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        lesson.type === "reading" ? "bg-blue-200 text-blue-800" : "bg-yellow-200 text-yellow-800"
                      }`}>
                      {lesson.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 capitalize">{lesson.accessLevel}</td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye size={16} className="text-rose-400" />
                      <span>{lesson.views}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Heart size={16} className="text-rose-400" />
                      <span>{lesson.favoriteCount}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {new Date(lesson.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-4 px-4 text-center relative">
                    <button onClick={(e) => toggleMenu(lesson._id, e)} className="text-gray-500 hover:text-blue-600 transition">
                      <MoreHorizontal size={20} />
                    </button>

                    {/* Dropdown menu */}
                    {menuOpenId === lesson._id && (
                      <div ref={menuRef}
                        className={`absolute right-4 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden ${
                          [paginatedLessons.length - 1, paginatedLessons.length - 2, paginatedLessons.length - 3]
                            .includes(paginatedLessons.findIndex(l => l._id === lesson._id))
                            ? "bottom-full mb-2"
                            : "top-full mt-2"
                        }`}
                        onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => {
                            navigate(`/resource/${lesson._id}`);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 text-gray-700 transition">
                          <Eye className="w-5 h-5" />
                          Xem chi tiết
                        </button>

                        <button onClick={() => {
                            setEditingLesson(lesson);
                            setIsEditModalOpen(true);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 text-gray-700 transition">
                          <Upload className="w-5 h-5" />
                          Cập nhật bài học
                        </button>

                        <button onClick={() => {
                            setDeleteConfirmId(lesson._id);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 text-red-600 transition">
                          <Trash2 className="w-5 h-5" />
                          Xóa bài học
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}

        {/* Modal add */}
        {isModalOpen && (
          <CreateLessonModal
            isOpen={isModalOpen}
            isSubmitting={isSubmitting}
            selectedFile={selectedFile}
            onFileChange={handleFileChange}
            onSubmit={handleCreateLesson}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedFile(null);
            }}
          />
        )}

        {/* Modal update */}
        {isEditModalOpen && editingLesson && (
          <EditLessonModal
            isOpen={isEditModalOpen}
            lesson={editingLesson}
            isUpdating={isUpdating}
            editFile={editFile}
            onFileChange={handleEditFileChange}
            onSubmit={handleUpdateLesson}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingLesson(null);
              setEditFile(null);
            }}
          />
        )}

        {/* Modal delete */}
        {deleteConfirmId && (
          <DeleteLessonModal
            lessonId={deleteConfirmId}
            onConfirm={handleDelete}
            onClose={() => setDeleteConfirmId(null)}
          />
        )}

       {/* Modal Import Listening Fill-in-the-blank */}
        <ImportFillBlankModal
          isOpen={isFillBlankModalOpen}
          excelFile={excelFile}
          previewData={previewData}
          isImporting={isImporting}
          onExcelFileChange={handleExcelFileChange}
          onImport={handleImportListeningQuestions}
          onClose={() => {
            setIsFillBlankModalOpen(false);
            setExcelFile(null);
            setPreviewData([]);
          }}
        />
      </div>
    </div>
  );
};

export default LessonManagementPage;