import { createPortal } from "react-dom";
import api from "../../../config/axios";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import React, { useEffect, useState, useCallback } from "react";
import { FaEllipsisH, FaTimes, FaUpload } from "react-icons/fa";
import LeftSidebarAdmin from "../../../components/LeftSidebarAdmin";

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
      toast.error("Không thể tải danh sách bài học!");
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
      toast.success("Xóa bài học thành công!");
      closeMenu();
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
      toast.error("Xóa bài học thất bại!");
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
        toast.error("Chỉ được chọn file Word (.docx)!");
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
        toast.error("Chỉ được chọn file Word (.docx)!");
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
      toast.error("Vui lòng điền đầy đủ thông tin!");
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

      toast.success("Cập nhật thành công!");
      setLessons((prev) =>
        prev.map((l) => (l._id === editingLesson._id ? res.data.data : l))
      );
      setIsEditModalOpen(false);
      setEditFile(null);
      setEditingLesson(null);
    } catch (err) {
      toast.error("Cập nhật thất bại!");
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
      toast.error("Vui lòng chọn file .docx trước khi tạo!");
      return;
    }
    if (!title || !type || !accessLevel) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
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
      toast.success(`Tải lên thành công: ${selectedFile.name}`);
      setLessons((prev) => [...prev, res.data.data]);
      setIsModalOpen(false);
      setSelectedFile(null);
      form.reset();
    } catch (err) {
      console.error(err);
      toast.error("Tải lên thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <LeftSidebarAdmin customHeight="h-auto w-64" />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý bài học</h1>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
            onClick={() => setIsModalOpen(true)}>
            + Thêm bài học
          </button>
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
                <th className="py-3 px-4 text-center">Hành động</th>
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
                  <td className="py-4 px-4 text-center">{lesson.views}</td>
                  <td className="py-4 px-4 text-center">{lesson.favoriteCount}</td>
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
              className="bg-white border rounded shadow-lg">
              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100"
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

              <button className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                onClick={() => setDeleteConfirmId(menuState.lessonId)}>
                Xóa
              </button>
            </div>,
            document.body
          )}

        {/* Modal Thêm bài học */}
        {isModalOpen &&
          createPortal(
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
              <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg relative">
                <button className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedFile(null);
                  }}>
                  <FaTimes size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                  Thêm bài học mới
                </h2>

                <form onSubmit={handleCreateLesson} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập tiêu đề bài học"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Loại bài</label>
                    <select id="type" name="type" required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">-- Chọn loại bài --</option>
                      <option value="reading">Reading</option>
                      <option value="vocabulary">Vocabulary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Cấp độ truy cập</label>
                    <select id="accessLevel" name="accessLevel" required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="">-- Chọn cấp độ --</option>
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="advanced">Advanced</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">File Word (.docx)</label>
                    <label htmlFor="file"
                      className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition ${
                        selectedFile ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
                      }`}>
                      <FaUpload className="text-gray-600" />
                      <span className={selectedFile ? "text-gray-700" : "text-red-500"}>
                        {selectedFile ? selectedFile.name : "Chưa chọn file"}
                      </span>
                    </label>
                    <input
                      id="file"
                      name="file"
                      type="file"
                      accept=".docx"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400">
                    {isSubmitting ? "Đang tải lên..." : "Tạo bài học"}
                  </button>
                </form>
              </div>
            </div>,
            document.body
          )}

        {/* Modal Sửa bài học */}
        {isEditModalOpen &&
          createPortal(
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
              <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg relative">
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditFile(null);
                    setEditingLesson(null);
                  }}>
                  <FaTimes size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                  Cập nhật bài học
                </h2>

                {editingLesson && (
                  <form onSubmit={handleUpdateLesson} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                      <input id="title"
                        name="title"
                        type="text"
                        defaultValue={editingLesson.title}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Loại bài</label>
                      <select id="type" name="type"
                        defaultValue={editingLesson.type}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="reading">Reading</option>
                        <option value="vocabulary">Vocabulary</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Cấp độ truy cập</label>
                      <select id="accessLevel"
                        name="accessLevel"
                        defaultValue={editingLesson.accessLevel}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="free">Free</option>
                        <option value="basic">Basic</option>
                        <option value="advanced">Advanced</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">File Word mới (tuỳ chọn)</label>
                      <label htmlFor="editFile"
                        className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition ${
                          editFile ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
                        }`}>
                        <FaUpload className="text-gray-600" />
                        <span className={editFile ? "text-gray-700" : "text-gray-500"}>
                          {editFile ? editFile.name : "Chưa chọn file mới"}
                        </span>
                      </label>
                      <input
                        id="editFile"
                        name="file"
                        type="file"
                        accept=".docx"
                        className="hidden"
                        onChange={handleEditFileChange}
                      />
                    </div>

                    <button type="submit"
                      disabled={isUpdating}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400">
                      {isUpdating ? "Đang cập nhật..." : "Lưu thay đổi"}
                    </button>
                  </form>
                )}
              </div>
            </div>,
            document.body
          )}

        {/* Modal Xác nhận xóa */}
        {deleteConfirmId &&
          createPortal(
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Xác nhận xóa</h2>
                <p className="mb-6 text-gray-700">Bạn có chắc muốn xóa bài học này?</p>
                <div className="flex justify-center gap-4">
                  <button onClick={() => handleDelete(deleteConfirmId)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    Xóa
                  </button>
                  <button onClick={() => setDeleteConfirmId(null)}
                    className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">
                    Hủy
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

        <ToastContainer position="top-right" autoClose={1200} />
      </div>
    </div>
  );
};

export default LessonManagementPage;
