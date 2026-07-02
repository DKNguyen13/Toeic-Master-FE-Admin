import React, { useState } from "react";
import { Flashcard } from "./FlashcardList";

type FlashcardFields = "word" | "meaning" | "example" | "note";

interface Props {
  flashcard: Flashcard;
  error?: string;
  onSave: (data: Flashcard) => void;
  onClose: () => void;
}

const EditFlashcardModal: React.FC<Props> = ({
  flashcard,
  error = "",
  onSave,
  onClose,
}) => {
  const [form, setForm] = useState({
    word: flashcard.word,
    meaning: flashcard.meaning,
    example: flashcard.example || "",
    note: flashcard.note || "",
  });

  const fields: FlashcardFields[] = [
    "word",
    "meaning",
    "example",
    "note",
  ];

  const labels: Record<FlashcardFields, string> = {
    word: "Từ vựng",
    meaning: "Nghĩa",
    example: "Ví dụ",
    note: "Ghi chú",
  };

  const maxLengths: Record<FlashcardFields, number> = {
    word: 100,
    meaning: 100,
    example: 200,
    note: 200,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa Flashcard</h2>
          <p className="text-gray-500 mt-2">Cập nhật thông tin từ vựng của bạn</p>

          {error && (
            <p className="text-red-500 text-sm mt-2">
              {error}
            </p>
          )}
        </div>

        {/* Form */}
        <div className="space-y-4">
          {fields.map((field) => {
            const required = field === "word" || field === "meaning";

            return (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {labels[field]}
                  {required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>

                <input type="text"
                  value={form[field]}
                  maxLength={maxLengths[field]}
                  placeholder={`Nhập ${labels[
                    field
                  ].toLowerCase()}...`}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [field]: e.target.value,
                    })
                  }
                  className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-0 ${
                    error
                      .toLowerCase()
                      .includes(labels[field].toLowerCase())
                      ? "border-red-500"
                      : "border-gray-200 focus:border-amber-400"
                  }`}
                />

                <span className="text-xs text-gray-500">
                  {form[field].length}/{maxLengths[field]} ký tự
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() =>
              onSave({
                ...flashcard,
                ...form,
              })
            }
            className="flex-1 px-6 py-3 text-base font-semibold text-white bg-amber-500 rounded-lg shadow-md hover:bg-amber-600 hover:shadow-lg transition-all duration-200">
            Lưu thay đổi
          </button>

          <button onClick={onClose}
            className=" flex-1 px-6 py-3 text-base font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFlashcardModal;