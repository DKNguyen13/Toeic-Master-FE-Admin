import React, { useState } from "react";
import api from "../../../config/axios";
import { showToast } from "../../../utils/toast";

export interface FlashcardForm {
  word: string;
  meaning: string;
  example: string;
  note: string;
}

interface Props {
  setId: string;
  onClose: () => void;
  onSuccess: (newCard: any) => void;
  onOpenImport: () => void;
}

const AddFlashcardModal: React.FC<Props> = ({
  setId,
  onClose,
  onSuccess,
  onOpenImport,
}) => {
  const [form, setForm] = useState<FlashcardForm>({
    word: "",
    meaning: "",
    example: "",
    note: "",
  });

  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!form.word || !form.meaning) {
      setError("Từ và nghĩa không được bỏ trống!");
      return;
    }

    try {
      const res = await api.post("/flashcard", { ...form, set: setId });
      onSuccess(res.data.data);

      setForm({ word: "", meaning: "", example: "", note: "" });
      setError("");

      showToast("Thêm flashcard thành công!", "success", {
        autoClose: 1000,
      });

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi tạo flashcard!");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Tạo Flashcard Mới
          </h2>
          <p className="text-gray-500 mt-2">
            Thêm vào các từ mới vào bộ từng vựng của bạn
          </p>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        <div className="space-y-4">
          {/* WORD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Từ vựng: <span className="text-red-500">*</span>
            </label>
            <input
              name="word"
              placeholder="Nhập từ vựng..."
              value={form.word}
              onChange={(e) =>
                setForm({ ...form, word: e.target.value })
              }
              maxLength={100}
              className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 ${
                error.includes("Từ")
                  ? "border-red-500"
                  : "border-gray-200"
              }`}
            />
            <span className="text-xs text-gray-500">
              {form.word.length}/100 ký tự
            </span>
          </div>

          {/* MEANING */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nghĩa: <span className="text-red-500">*</span>
            </label>
            <input
              name="meaning"
              placeholder="Nhập nghĩa..."
              value={form.meaning}
              maxLength={100}
              onChange={(e) =>
                setForm({ ...form, meaning: e.target.value })
              }
              className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 ${
                error.includes("nghĩa")
                  ? "border-red-500"
                  : "border-gray-200"
              }`}
            />
            <span className="text-xs text-gray-500">
              {form.meaning.length}/100 ký tự
            </span>
          </div>

          {/* EXAMPLE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ví dụ:
            </label>
            <input
              name="example"
              placeholder="Nhập ví dụ..."
              value={form.example}
              maxLength={200}
              onChange={(e) =>
                setForm({ ...form, example: e.target.value })
              }
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all duration-200"
            />
            <span className="text-xs text-gray-500">
              {form.example.length}/200 ký tự
            </span>
          </div>

          {/* NOTE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ghi chú:
            </label>
            <input
              name="note"
              placeholder="Nhập ghi chú..."
              value={form.note}
              maxLength={200}
              onChange={(e) =>
                setForm({ ...form, note: e.target.value })
              }
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all duration-200"
            />
            <span className="text-xs text-gray-500">
              {form.note.length}/200 ký tự
            </span>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleAdd}
            className="flex-1 px-5 py-2 text-base font-semibold text-white bg-blue-600 rounded-2xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
          >
            Tạo mới
          </button>

          <button
            onClick={onClose}
            className="flex-1 px-5 py-2 text-base font-semibold text-gray-600 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            Hủy
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenImport();
            }}
            className="flex-1 px-5 py-2 text-base font-semibold text-green-600 bg-green-100 border border-green-300 rounded-2xl hover:bg-green-200 hover:border-green-400 transition-all duration-200"
          >
            Import file
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFlashcardModal;