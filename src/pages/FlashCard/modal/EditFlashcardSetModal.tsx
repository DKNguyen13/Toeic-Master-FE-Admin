import api from "../../../config/axios";
import React, { useEffect, useState } from "react";
import { showToast } from "../../../utils/toast";
import { FlashcardSet } from "../components/FlashcardSetList";

interface Props {
  open: boolean;
  set: FlashcardSet | null;
  onClose: () => void;
  onUpdated: (updated: FlashcardSet) => void;
}

const EditFlashcardSetModal: React.FC<Props> = ({
  open,
  set,
  onClose,
  onUpdated,
}) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (set) {
      setForm({
        name: set.name,
        description: set.description || "",
      });
    }
  }, [set]);

  if (!open || !set) return null;

  const handleUpdate = async () => {
    if (!form.name.trim()) {
      setError("Vui lòng nhập tên bộ flashcard!");
      return;
    }

    try {
      const res = await api.put(`/flashcard-set/${set._id}`, form);
      onUpdated(res.data.data);
      showToast("Cập nhật bộ flashcard thành công!", "success", { autoClose: 1000 });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể cập nhật bộ flashcard!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Cập nhật bộ từ vựng</h2>
          <p className="text-gray-500 mt-2">Cập nhật thông tin bộ flashcard của bạn</p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên bộ từ vựng:
              <span className="text-red-500"> *</span>
            </label>

            <input value={form.name}
              maxLength={25}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />

            <span className="text-xs text-gray-500">
              {form.name.length}/25 ký tự
            </span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô tả (tùy chọn):
            </label>

            <textarea
              rows={2}
              maxLength={25}
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
            />

            <span className="text-xs text-gray-500">
              {form.description.length}/25 ký tự
            </span>
          </div>

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-4 mt-8">
          <button onClick={handleUpdate} className="flex-1 px-6 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200">
            Lưu thay đổi
          </button>

          <button onClick={onClose}
            className="flex-1 px-6 py-3 text-base font-semibold text-gray-600 bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-300 hover:border-gray-400 transition-all duration-200">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFlashcardSetModal;