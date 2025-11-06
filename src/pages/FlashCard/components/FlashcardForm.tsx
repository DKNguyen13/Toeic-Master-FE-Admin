import React, { useState, ChangeEvent, FormEvent } from "react";

interface FlashcardFormProps {
  onAdd: (flashcard: {
    word: string;
    meaning: string;
    example?: string;
    note?: string;
  }) => void;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({ onAdd }) => {
  const [form, setForm] = useState({
    word: "",
    meaning: "",
    example: "",
    note: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.word || !form.meaning) {
      alert("Nhập đầy đủ từ và nghĩa!");
      return;
    }
    onAdd(form);
    setForm({ word: "", meaning: "", example: "", note: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          name="word"
          placeholder="Từ vựng"
          value={form.word}
          onChange={handleChange}
          className="border p-2 flex-1 rounded-md"
        />
        <input
          name="meaning"
          placeholder="Nghĩa"
          value={form.meaning}
          onChange={handleChange}
          className="border p-2 flex-1 rounded-md"
        />
      </div>
      <input
        name="example"
        placeholder="Ví dụ (optional)"
        value={form.example}
        onChange={handleChange}
        className="border p-2 w-full rounded-md mt-2"
      />
      <input
        name="note"
        placeholder="Ghi chú (optional)"
        value={form.note}
        onChange={handleChange}
        className="border p-2 w-full rounded-md mt-2"
      />
      <button
        type="submit"
        className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        ➕ Thêm Flashcard
      </button>
    </form>
  );
};

export default FlashcardForm;
