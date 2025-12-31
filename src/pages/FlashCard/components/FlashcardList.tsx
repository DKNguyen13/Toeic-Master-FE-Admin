import api from "../../../config/axios";
import FlashcardItem from "./FlashcardItem";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import { showToast } from "../../../utils/toast";
import React, { useEffect, useState } from "react";
import { Book } from "lucide-react";
import * as XLSX from "xlsx";
import FlashcardImportExcelModal from "./FlashcardImportModal";

export interface Flashcard {
  _id?: string;
  word: string;
  meaning: string;
  example?: string;
  note?: string;
}

interface FlashcardListProps {
  setId?: string;
  type?: "myList" | "explore";
}

const FlashcardList: React.FC<FlashcardListProps> = ({ setId, type: propType }) => {
  const location = useLocation();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ word: "", meaning: "", example: "", note: "" });
  const [mode, setMode] = useState("Xem toàn bộ thẻ");
  const [randomIndex, setRandomIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizDirection, setQuizDirection] = useState<"en2vi" | "vi2en">("en2vi");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [canQuiz, setCanQuiz] = useState(true);
  const [correctCard, setCorrectCard] = useState<Flashcard | null>(null);
  const [error, setError] = useState("");
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const type = propType || location.state?.type || "myList";
  const editable = type === "myList";

  const closeModal = () => {
    setShowModal(false);
    setError("");
  };

  const fetchFlashcards = async () => {
    if (!setId) return;
    try {
      setLoading(true);
      const url = type === "explore" ? "/flashcard/free" : "/flashcard";
      const res = await api.get(url, { params: { set: setId } });
      setFlashcards(res.data.data || []);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Không thể tải flashcard!", "error", { autoClose: 1000 });
    } finally {
      setLoading(false);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: Flashcard[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      setFlashcards((prev) => [...prev, ...jsonData]);
      showToast("Import thành công!", "success", { autoClose: 1000 });
      setShowImportModal(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleAdd = async () => {
    if (!form.word || !form.meaning) {
      setError("Từ và nghĩa không được bỏ trống!");
      return;
    }
    if (!setId) return;

    try {
      const res = await api.post("/flashcard", { ...form, set: setId });
      setFlashcards((prev) => [...prev, res.data.data]);
      setShowModal(false);
      setForm({ word: "", meaning: "", example: "", note: "" });
      showToast("Thêm flashcard thành công!", "success", {autoClose: 1000});
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi tạo flashcard!");
    }
  };

  const confirmDeleteCard = async () => {
    if (!deleteCardId) return;
    try {
      await api.delete(`/flashcard/${deleteCardId}`);
      setFlashcards(prev => prev.filter(f => f._id !== deleteCardId));
      showToast("Xóa flashcard thành công!", "success", { autoClose: 1000 });
    } catch (err: any) {
      showToast(err.response?.data?.message || "Không thể xóa flashcard!", "error", { autoClose: 1000 });
    } finally {
      setDeleteCardId(null);
    }
  };

  const nextCard = () => {
    setRandomIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setRandomIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const generateQuiz = () => {
    if (flashcards.length < 4) {
      setCanQuiz(false);
      return;
    }

    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    const correct = shuffled[0];
    setCorrectCard(correct);

    const wrongOptions: string[] = [];
    for (let i = 1; i < shuffled.length && wrongOptions.length < 3; i++) {
      const value = quizDirection === "en2vi" ? shuffled[i].meaning : shuffled[i].word;
      const correctValue = quizDirection === "en2vi" ? correct.meaning : correct.word;
      if (value !== correctValue && !wrongOptions.includes(value)) {
        wrongOptions.push(value);
      }
    }

    if (wrongOptions.length < 3) {
      setCanQuiz(false);
      return;
    }

    const options = [quizDirection === "en2vi" ? correct.meaning : correct.word, ...wrongOptions];
    setQuizOptions(options.sort(() => Math.random() - 0.5));
    setSelectedOption(null);
    setCanQuiz(true);
  };

  const handleNextQuiz = () => {
    setQuizIndex(prev => (prev + 1) % flashcards.length);
    generateQuiz();
  };

  const handleOptionClick = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);

    if (!correctCard) return;

    const correct = quizDirection === "en2vi" ? correctCard.meaning : correctCard.word;

    if (option === correct) setScore(prev => prev + 1);
  };

  useEffect(() => {
    fetchFlashcards();
  }, [setId]);

  useEffect(() => {
    if (mode === "Ngẫu nhiên") setRandomIndex(0);
    if (mode === "Trắc nghiệm") generateQuiz();
  }, [mode, flashcards, quizDirection]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            📚 Flashcards
          </h1>
          <p className="text-gray-600">Học từ vựng hiệu quả với flashcards</p>
        </div>

        {/* Mode Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="mode" className="text-sm font-semibold text-gray-700">
                Chế độ học:
              </label>
              <select 
                id="mode"
                value={mode} 
                onChange={(e) => setMode(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 bg-white hover:border-gray-300">
                <option value="Xem toàn bộ thẻ">📖 Xem toàn bộ thẻ</option>
                <option value="Ngẫu nhiên">🔀 Ngẫu nhiên</option>
                <option value="Trắc nghiệm">🎯 Trắc nghiệm</option>
              </select>
            </div>
            
            {mode === "Trắc nghiệm" && flashcards.length >= 4 && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">Hướng dịch:</label>
                <select 
                  value={quizDirection} 
                  onChange={(e) => setQuizDirection(e.target.value as any)}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 bg-white hover:border-gray-300">
                  <option value="en2vi">Anh → Việt</option>
                  <option value="vi2en">Việt → Anh</option>
                </select>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal cofirm delete flashcard */}
        {deleteCardId && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-fadeIn">
              <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">Xác nhận xóa</h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc muốn xóa flashcard?
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteCardId(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  Hủy
                </button>
                <button onClick={confirmDeleteCard}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {mode === "Trắc nghiệm" ? (
          canQuiz ? (
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {quizDirection === "en2vi" ? correctCard?.word : correctCard?.meaning}
                    </h2>
                    <p className="text-gray-600">Chọn đáp án đúng</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {quizOptions.map((opt, index) => (
                      <button 
                        key={opt} 
                        onClick={() => handleOptionClick(opt)}
                        disabled={!!selectedOption}
                        className={`p-4 rounded-2xl border-2 text-left font-medium transition-all duration-300 transform ${
                          selectedOption
                            ? opt === (quizDirection === "en2vi" ? correctCard?.meaning : correctCard?.word)
                              ? "bg-green-100 border-green-400 text-green-800 scale-105"
                              : opt === selectedOption
                                ? "bg-red-100 border-red-400 text-red-800"
                                : "bg-gray-50 border-gray-200 text-gray-500"
                            : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:scale-105 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold mr-3">
                            {String.fromCharCode(65 + index)}
                          </span>
                          {opt}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {selectedOption && (
                    <div className="text-center">
                      <button onClick={handleNextQuiz} 
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg">
                        Câu tiếp theo →
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-4 py-2">
                      <span className="text-2xl mr-2">🏆</span>
                      <span className="font-bold text-gray-800">Điểm: {score}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <span className="text-3xl">😕</span>
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">Chưa đủ flashcards!</p>
              <p className="text-gray-500">Cần ít nhất 4 flashcards để chơi trắc nghiệm</p>
            </div>
          )
        ) : mode === "Ngẫu nhiên" && flashcards.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md mb-6">
              <FlashcardItem
                flashcard={flashcards[randomIndex]}
                onDelete={editable ? () => setDeleteCardId(flashcards[randomIndex]._id!) : undefined}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={prevCard} 
                disabled={flashcards.length <= 1} 
                className={`px-5 py-2 rounded-3xl font-semibold transition-all duration-200 ${
                  flashcards.length > 1 
                    ? 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg transform hover:scale-105' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-100'
                }`}>
                ← Trước
              </button>
              
              <div className="px-4 py-2 bg-blue-100 rounded-full">
                <span className="text-sm font-semibold text-blue-800">
                  {randomIndex + 1} / {flashcards.length}
                </span>
              </div>
              
              <button 
                onClick={nextCard} 
                disabled={flashcards.length <= 1} 
                className={`px-5 py-2 rounded-3xl font-semibold transition-all duration-200 ${
                  flashcards.length > 1 
                    ? 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg transform hover:scale-105' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-100'
                }`}
              >
                Tiếp →
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {editable && (
              <div 
                onClick={() => setShowModal(true)}
                className="group border-3 border-dashed border-blue-300 rounded-3xl flex flex-col justify-center items-center h-64 text-blue-500 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <span className="text-3xl text-blue-500 font-bold">+</span>
                </div>
                <p className="font-semibold text-lg">Thêm flashcard</p>
                <p className="text-sm text-blue-400 mt-1 text-center">Nhấn để tạo mới</p>
              </div>
            )}
            
            {flashcards.length > 0 ? (
              flashcards.map((card) => (
                <FlashcardItem
                  key={card._id}
                  flashcard={card}
                  onDelete={editable ? (id: string) => setDeleteCardId(id) : undefined}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="p-4 bg-blue-50 rounded-full mb-4">
                  <Book className="w-10 h-10 text-blue-500" />
                </div>

                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  { editable ? "Chưa có flashcard nào" : "Set này chưa có flashcard" }
                </h3>
                {editable && (
                  <p className="text-gray-500 text-sm text-center max-w-xs">Nhấn vào nút '+' để tạo các từ vựng đầu tiên!</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {editable && showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}>
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100"
              onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Tạo Flashcard Mới</h2>
                <p className="text-gray-500 mt-2">Thêm vào các từ mới vào bộ từng vựng của bạn</p>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Từ vựng: <span className="text-red-500">*</span></label>
                  <input 
                    name="word" 
                    placeholder="Nhập từ vựng..." 
                    value={form.word}
                    onChange={(e) => setForm({ ...form, word: e.target.value })}
                    maxLength={100}
                    className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 ${
                      error.includes("Từ") ? "border-red-500" : "border-gray-200"
                    }`} 
                  />
                  <span className="text-xs text-gray-500">
                    {form.word.length}/100 ký tự
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nghĩa: <span className="text-red-500">*</span></label>
                  <input 
                    name="meaning" 
                    placeholder="Nhập nghĩa..." 
                    value={form.meaning}
                    maxLength={100}
                    onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                    className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 ${
                      error.includes("nghĩa") ? "border-red-500" : "border-gray-200"
                    }`} 
                  />
                  <span className="text-xs text-gray-500">
                    {form.meaning.length}/100 ký tự
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ví dụ:</label>
                  <input 
                    name="example" 
                    placeholder="Nhập ví dụ..." 
                    value={form.example}
                    maxLength={200}
                    onChange={(e) => setForm({ ...form, example: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all duration-200" 
                  />
                  <span className="text-xs text-gray-500">
                    {form.example.length}/200 ký tự
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú:</label>
                  <input 
                    name="note" 
                    placeholder="Nhập ghi chú..." 
                    value={form.note}
                    maxLength={200}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all duration-200" 
                  />
                  <span className="text-xs text-gray-500">
                    {form.note.length}/200 ký tự
                  </span>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={handleAdd}
                  className="flex-1 px-5 py-2 text-base font-semibold text-white bg-blue-600 rounded-2xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200">
                  Tạo mới
                </button>

                <button onClick={closeModal}
                  className="flex-1 px-5 py-2 text-base font-semibold text-gray-600 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                  Hủy
                </button>

                <button onClick={() => {
                  closeModal();
                  setShowImportModal(true);
                }} className="flex-1 px-5 py-2 text-base font-semibold text-green-600 bg-green-100 border border-green-300 rounded-2xl hover:bg-green-200 hover:border-green-400 transition-all duration-200">
                   Import file
                </button>
              </div>

            </div>
          </div>
        )}
        {showImportModal && setId && (
          <FlashcardImportExcelModal
            setId={setId}
            onClose={() => setShowImportModal(false)}
            onImportSuccess={fetchFlashcards}
          />
        )}
      </div>
    </div>
  );
};

export default FlashcardList;