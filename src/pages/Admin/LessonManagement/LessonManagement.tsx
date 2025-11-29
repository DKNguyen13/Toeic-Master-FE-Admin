import * as XLSX from "xlsx";
import api from "../../../config/axios";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../../../utils/toast";
import React, { useEffect, useState, useCallback, useMemo} from "react";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import { BookOpen, Download, Eye, Heart, MoreHorizontal, Search, Trash2, Upload, X } from "lucide-react";
import Pagination from "../../../components/common/Pagination/Pagination";

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
  const [menuState, setMenuState] = useState<{ lessonId: string; coords: DOMRect } | null>(null);
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
      closeMenu();
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
      showToast("Xóa bài học thất bại!", "error");
    }
  };

  // Menu control
  const openMenu = (lessonId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuState({ lessonId, coords: rect });
  };

  const closeMenu = useCallback(() => setMenuState(null), []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!menuState) return;
      const target = e.target as HTMLElement;
      if (!document.getElementById(`menu-${menuState.lessonId}`)?.contains(target)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuState, closeMenu]);

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
                className="flex items-center gap-3 bg-indigo-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold px-7 py-3 rounded-2xl shadow-xl transition-all transform hover:scale-105">
                Tạo bài mới
              </button>

              <button
                onClick={() => setIsFillBlankModalOpen(true)}
                className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-7 py-3 rounded-2xl shadow-xl transition-all transform hover:scale-105">
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
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
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <table className="w-full table-auto">
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
                    <button className="text-gray-500 hover:text-gray-700 transition"
                      onClick={(e) => openMenu(lesson._id, e)}>
                      <MoreHorizontal size={18} />
                    </button>
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

        {/* Menu via Portal */}
        {menuState &&
          createPortal(
            <div id={`menu-${menuState.lessonId}`}
              style={{
                position: "absolute",
                top: menuState.coords.bottom + 4,
                left: menuState.coords.left,
                width: 140,
                zIndex: 1000,
              }}
              className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-40">
              <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition"
              onClick={() => navigate(`/resource/${menuState.lessonId}`)}>
                Xem chi tiết
              </button>

              <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => {
                  const lesson = lessons.find((l) => l._id === menuState.lessonId);
                  if (lesson) {
                    setEditingLesson(lesson);
                    setIsEditModalOpen(true);
                  }
                  closeMenu();
                }}>
                Cập nhật
              </button>

              <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                onClick={() => setDeleteConfirmId(menuState.lessonId)}>
                Xóa
              </button>
            </div>,
            document.body
          )}

        {/* Modal add */}
        {isModalOpen &&
          createPortal(
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Thêm bài học mới</h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedFile(null);
                    }}
                    className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleCreateLesson} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                    <input
                      name="title"
                      type="text"
                      maxLength={50}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      placeholder="Nhập tiêu đề bài học"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại bài</label>
                    <select
                      name="type"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition">
                      <option value="">-- Chọn loại bài --</option>
                      <option value="reading">Reading</option>
                      <option value="vocabulary">Vocabulary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cấp độ truy cập</label>
                    <select
                      name="accessLevel"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition">
                      <option value="">-- Chọn cấp độ --</option>
                      <option value="free">Miễn phí</option>
                      <option value="basic">Basic</option>
                      <option value="advanced">Advanced</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File Word (.docx)</label>
                    <label
                      htmlFor="file"
                      className={`flex items-center justify-center gap-3 px-4 py-10 border-2 border-dashed rounded-lg cursor-pointer transition ${
                        selectedFile
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                      }`}>
                      <Upload size={24} className={selectedFile ? "text-green-600" : "text-gray-500"} />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">
                          {selectedFile ? selectedFile.name : "Kéo thả hoặc click để chọn file"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Chỉ chấp nhận .docx</p>
                      </div>
                    </label>
                    <input id="file" type="file" accept=".docx" className="hidden" onChange={handleFileChange} />
                  </div>
                  <button type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-70 flex items-center justify-center gap-2">
                    {isSubmitting ? <>Đang tải lên...</> : <>Tạo bài học</>}
                  </button>
                </form>
              </div>
            </div>,
            document.body
          )}

        {/* Modal update */}
        {isEditModalOpen && editingLesson &&
          createPortal(
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Cập nhật bài học</h2>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingLesson(null);
                      setEditFile(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleUpdateLesson} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                    <input
                      name="title"
                      maxLength={50}
                      type="text"
                      defaultValue={editingLesson.title}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại bài</label>
                    <select
                      name="type"
                      defaultValue={editingLesson.type}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      required
                    >
                      <option value="reading">Reading</option>
                      <option value="vocabulary">Vocabulary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cấp độ truy cập</label>
                    <select
                      name="accessLevel"
                      defaultValue={editingLesson.accessLevel}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      required
                    >
                      <option value="free">Miễn phí</option>
                      <option value="basic">Basic</option>
                      <option value="advanced">Advanced</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File Word mới (tùy chọn)</label>
                    <label htmlFor="editFile"
                      className={`flex items-center justify-center gap-3 px-4 py-10 border-2 border-dashed rounded-lg cursor-pointer transition ${
                        editFile ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                      }`}>
                      <Upload size={24} className={editFile ? "text-green-600" : "text-gray-500"} />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">{editFile ? editFile.name : "Kéo thả hoặc click để chọn file"}</p>
                        <p className="text-xs text-gray-500 mt-1">Chỉ chấp nhận .docx</p>
                      </div>
                    </label>
                    <input id="editFile" type="file" accept=".docx" className="hidden" onChange={handleEditFileChange} />
                  </div>
                  <button type="submit"
                    disabled={isUpdating}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-70 flex items-center justify-center gap-2">
                    {isUpdating ? "Đang cập nhật..." : "Lưu thay đổi"}
                  </button>
                </form>
              </div>
            </div>,
            document.body
          )}

        {/* Modal delete */}
        {deleteConfirmId &&
          createPortal(
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <Trash2 size={24} className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
                  <p className="mt-2 text-sm text-gray-600">Bạn có chắc chắn muốn xóa bài học này?<br></br> Hành động này không thể hoàn tác.</p>
                </div>
                <div className="mt-6 flex gap-3 justify-center">
                  <button onClick={() => handleDelete(deleteConfirmId)}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    Xóa
                  </button>
                  <button onClick={() => setDeleteConfirmId(null)}
                    className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                    Hủy
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Modal Import Listening Fill-in-the-blank */}
          {isFillBlankModalOpen &&
            createPortal(
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setIsFillBlankModalOpen(false);
                      setExcelFile(null);
                      setPreviewData([]);
                    }
                  }}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
                  <div className="flex justify-between items-center p-6 border-b border-gray-300 sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-900">Thêm file nghe và điền từ</h2>
                    <button className="text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setIsFillBlankModalOpen(false);
                        setExcelFile(null);
                        setPreviewData([]);
                      }}>
                      <X size={28} />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Chọn file Excel (.xlsx, .xls)
                      </label>
                      <label htmlFor="excel-upload"
                        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          excelFile ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                        }`}>
                        <Upload size={48} className={excelFile ? "text-green-600" : "text-gray-400"} />
                        <p className="mt-4 text-lg font-medium text-gray-700">
                          {excelFile ? excelFile.name : "Kéo thả file hoặc click để chọn"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Cột bắt buộc: sentence, blank1, blank2, ...
                        </p>
                      </label>
                      <input
                        id="excel-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={handleExcelFileChange}
                      />
                      <div className="text-center mt-4">
                        <a href="../../templates/listening-fillblank-template.xlsx"
                          download
                          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm underline">
                          <Download size={16} />
                          Tải file Excel mẫu (.xlsx)
                        </a>
                        <p className="text-xs text-gray-600 mt-2">
                          Định dạng: Ghi số thứ tự: đáp án (ví dụ: 1: train, 10: prepare)
                        </p>
                      </div>
                    </div>

                    {/* Preview Table */}
                    {previewData.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Xem trước ({previewData.length} câu hỏi)</h3>
                          <span className="text-sm text-green-600 font-medium">
                            Sẵn sàng nhập
                          </span>
                        </div>

                        <div className="max-h-96 overflow-x-auto border rounded-lg">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                              <tr>
                                <th className="px-4 py-3 text-left">STT</th>
                                <th className="px-4 py-3 text-left">Câu hỏi</th>
                                <th className="px-4 py-3 text-center">Số chỗ trống</th>
                                <th className="px-4 py-3 text-left">Đáp án</th>
                              </tr>
                            </thead>
                            <tbody>
                              {previewData.map((item) => (
                                <tr key={item.no} className="border-t hover:bg-gray-50">
                                  <td className="px-4 py-3">{item.no}</td>
                                  <td className="px-4 py-3 max-w-md truncate">{item.sentence}</td>
                                  <td className="px-4 py-3 text-center font-medium text-indigo-600">
                                    {item.blankCount}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                      {item.blanks.map((b: any, i: number) => (
                                        <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                                          {i + 1}: {b.answer}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4 border-t">
                      <button
                        onClick={() => {
                          setIsFillBlankModalOpen(false);
                          setExcelFile(null);
                          setPreviewData([]);
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                        Hủy
                      </button>
                      <button onClick={handleImportListeningQuestions}
                        disabled={!excelFile || previewData.length === 0 || isImporting}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        {isImporting ? (
                          <>Đang nhập...</>
                        ) : (
                          <>
                            <Upload size={20} />
                            Nhập {previewData.length} câu hỏi
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
      </div>
    </div>
  );
};

export default LessonManagementPage;
