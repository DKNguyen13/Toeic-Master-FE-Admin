import { createPortal } from "react-dom";
import api from "../../../config/axios";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useState, useCallback } from "react";
import { FaEllipsisH, FaTimes, FaUpload } from "react-icons/fa";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";
import { showToast } from "../../../utils/toast";
import { BookOpen, Eye, FileText, Heart, Trash2, Upload, X } from "lucide-react";

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

const ITEMS_PER_PAGE = 10;

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

  // Pagination
  const totalPages = Math.ceil(lessons.length / ITEMS_PER_PAGE);
  const paginatedLessons = lessons.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const goToPage = (page: number) => setCurrentPage(page);

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "docx") {
        showToast("Chỉ được chọn file Word (.docx)!", "error");
        e.target.value = ""; // reset input
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
        // Nếu có file mới, gọi API upload
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
        <div className="flex justify-between items-center mb-8"> 
          <div> 
              <h1 className="text-3xl font-bold text-gray-900">Quản lý bài học</h1> 
              <p className="text-gray-600 mt-1">Quản lý nội dung bài học của hệ thống</p> 
          </div>
          
          <button className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition"
            onClick={() => setIsModalOpen(true)}>Thêm bài học</button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tổng bài học */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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

          {/* Tổng lượt yêu thích */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
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
                      <FaEllipsisH size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => goToPage(page)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === page ? "bg-blue-600 text-white" : "bg-white text-gray-700"
                }`}>
                {page}
              </button>
            ))}
          </div>
        )}

        {/* Menu via Portal */}
        {menuState &&
          createPortal(
            <div id={`menu-${menuState.lessonId}`}
              style={{
                position: "fixed",
                top: menuState.coords.bottom + 4,
                left: menuState.coords.left,
                width: 140,
                zIndex: 1000,
              }}
              className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-40">
              <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition"
                onClick={() => {
                  const lesson = lessons.find((l) => l._id === menuState.lessonId);
                  if (lesson) {
                    setEditingLesson(lesson);
                    setIsEditModalOpen(true);
                  }
                  closeMenu();
                }}>
                Sửa
              </button>

              <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                onClick={() => setDeleteConfirmId(menuState.lessonId)}>
                Xóa
              </button>
            </div>,
            document.body
          )}

        {/* Modal Thêm */}
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
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleCreateLesson} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                    <input
                      name="title"
                      type="text"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    >
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    >
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
                      }`}
                    >
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
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <>Đang tải lên...</> : <><FileText size={18} /> Tạo bài học</>}
                  </button>
                </form>
              </div>
            </div>,
            document.body
          )}

        {/* Modal Sửa */}
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
                    <label
                      htmlFor="editFile"
                      className={`flex items-center justify-center gap-3 px-4 py-10 border-2 border-dashed rounded-lg cursor-pointer transition ${
                        editFile ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <Upload size={24} className={editFile ? "text-green-600" : "text-gray-500"} />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">{editFile ? editFile.name : "Kéo thả hoặc click để chọn file"}</p>
                        <p className="text-xs text-gray-500 mt-1">Chỉ chấp nhận .docx</p>
                      </div>
                    </label>
                    <input id="editFile" type="file" accept=".docx" className="hidden" onChange={handleEditFileChange} />
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isUpdating ? "Đang cập nhật..." : "Lưu thay đổi"}
                  </button>
                </form>
              </div>
            </div>,
            document.body
          )}

        {/* Modal Xóa */}
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
                  <button
                    onClick={() => handleDelete(deleteConfirmId)}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
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
