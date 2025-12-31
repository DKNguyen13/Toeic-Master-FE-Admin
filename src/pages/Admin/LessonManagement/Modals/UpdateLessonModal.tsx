import { Lesson } from "../types";
import { createPortal } from "react-dom";
import { Upload, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  lesson: Lesson | null;
  isUpdating: boolean;
  editFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

const EditLessonModal: React.FC<Props> = ({
  isOpen,
  lesson,
  isUpdating,
  editFile,
  onFileChange,
  onSubmit,
  onClose,
}) => {
  if (!isOpen || !lesson) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Cập nhật bài học</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
            <input
              name="title"
              maxLength={50}
              type="text"
              defaultValue={lesson.title}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại bài</label>
            <select
              name="type"
              defaultValue={lesson.type}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              required>
              <option value="reading">Reading</option>
              <option value="vocabulary">Vocabulary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cấp độ truy cập</label>
            <select
              name="accessLevel"
              defaultValue={lesson.accessLevel}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              required>
              <option value="free">Miễn phí</option>
              <option value="basic">Basic</option>
              <option value="advanced">Advanced</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Word mới (tùy chọn)
            </label>
            <label
              htmlFor="editFile"
              className={`flex items-center justify-center gap-3 px-4 py-10 border-2 border-dashed rounded-lg cursor-pointer transition ${
                editFile
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}>
              <Upload size={24} className={editFile ? "text-green-600" : "text-gray-500"} />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {editFile ? editFile.name : "Kéo thả hoặc click để chọn file"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Chỉ chấp nhận .docx</p>
              </div>
            </label>
            <input
              id="editFile"
              type="file"
              accept=".docx"
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-70 flex items-center justify-center gap-2">
            {isUpdating ? "Đang cập nhật..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditLessonModal;