import api from "../../../config/axios";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../../utils/toast";
import React, { useEffect, useRef, useState } from "react";
import LoginModal from "../../../layouts/common/LoginModal";

export interface FlashcardSet {
  _id?: string;
  user?: string;
  name: string;
  description?: string;
  count?: number;
}

interface FlashcardSetListProps {
  type?: "myList" | "explore";
  isLoggedIn?: boolean;
}

const FlashcardSetList: React.FC<FlashcardSetListProps> = ({
  type = "myList",
  isLoggedIn = false,
}) => {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const fetchSets = async () => {
    if (type === "myList" && !isLoggedIn) return;
    try {
      setLoading(true);
      const res =
        type === "myList"
          ? await api.get("/flashcard-set")
          : await api.get("/flashcard-set/free");
      setSets(res.data.data as FlashcardSet[]);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Không thể tải dữ liệu!", "error", { autoClose: 1500});         
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!form.name) {
      showToast("Nhập tên bộ flashcard!", "warn");
      return;
    }
    try {
      const res = await api.post("/flashcard-set", form);
      setSets((prev) => [...prev, res.data.data]);
      setShowModal(false);
      setForm({ name: "", description: "" });
      showToast("Thêm bộ flashcard thành công!", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Lỗi khi tạo bộ flashcard!", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bộ flashcard này?')) return;
    
    try {
      await api.delete(`/flashcard-set/${id}`);
      setSets((prev) => prev.filter((s) => s._id !== id));
      showToast("Nhập tên bộ flashcard!", "warn");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Không thể xóa bộ flashcard!", "error", {autoClose: 1500});
    }
  };

  const handleSetClick = (setId?: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      navigate(`/flashcards/${setId}`, { state: { type } });
    }
  };

  const didFetch = useRef(false);
  
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchSets();
  }, [isLoggedIn, type]);

  return (
    <div className="min-h-screenp-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            {type === "myList" ? "📚 Bộ Từ Vựng Của Bạn" : "🌟 Khám Phá Flashcards"}
          </h1>
          <p className="text-gray-600 text-lg">
            {type === "myList" 
              ? "Quản lý và học từ vựng của bạn một cách hiệu quả"
              : "Khám phá các bộ flashcards miễn phí từ cộng đồng"}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-56 w-full bg-white rounded-2xl animate-pulse shadow-md"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Add Button */}
            {type === "myList" && (
              <div onClick={() => {
                  if (!isLoggedIn) {
                    setShowLoginModal(true);
                  } else {
                    setShowModal(true);
                  }
                }}
                className="group border-3 border-dashed border-blue-400 rounded-2xl flex flex-col justify-center items-center h-56 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <span className="text-4xl font-bold text-blue-500">+</span>
                </div>
                <p className="text-lg font-semibold text-blue-600">
                  Thêm Bộ Mới
                </p>
                <p className="text-sm text-blue-400 mt-1">Tạo bộ từ vựng của riêng bạn</p>
              </div>
            )}

            {/* Flashcard Sets */}
            {sets.length > 0 ? (
              sets.map((set) => (
                <div  key={set._id}
                  onClick={() => handleSetClick(set._id)}
                  className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 h-56 flex flex-col justify-between cursor-pointer transform hover:scale-105 border border-gray-100 hover:border-blue-300 overflow-hidden">
                  {/* Gradient Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">📖</span>
                      </div>
                      {type === "myList" && isLoggedIn && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(set._id!);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg hover:bg-red-50"
                        >
                          <span className="text-red-500 text-lg">🗑️</span>
                        </button>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {set.name}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {set.description || "Không có mô tả"}
                    </p>
                  </div>
                  
                  <div className="relative z-10 flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600">{set.count || 0}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">flashcards</p>
                    </div>
                    <div className="flex items-center text-blue-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Học ngay</span>
                      <span className="ml-1">→</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col justify-center items-center py-20 bg-white rounded-2xl shadow-md">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <span className="text-5xl">{type === "myList" ? "📭" : "🔍"}</span>
                </div>
                <p className="text-2xl font-bold text-gray-700 mb-2">
                  {type === "myList"
                    ? "Chưa có bộ từ vựng nào"
                    : "Hiện chưa có flashcards miễn phí"}
                </p>
                <p className="text-gray-500 text-center max-w-md">
                  {type === "myList"
                    ? "Nhấn vào nút '+' để tạo bộ từ vựng đầu tiên và bắt đầu hành trình học tập của bạn!"
                    : "Hãy quay lại sau để khám phá các bộ flashcards mới từ cộng đồng."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {type === "myList" && showModal && isLoggedIn && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                <span className="text-3xl">✨</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Tạo Bộ Flashcard Mới
              </h2>
              <p className="text-gray-500 mt-2">Bắt đầu xây dựng bộ từ vựng của riêng bạn</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên bộ flashcard *
                </label>
                <input
                  name="name"
                  placeholder="VD: Từ vựng TOEIC Part 1..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  name="description"
                  placeholder="Thêm mô tả về bộ flashcard của bạn..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button 
                onClick={handleAdd}
                className="flex-1 px-6 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Tạo bộ flashcard
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-4 text-base font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal đăng nhập */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};

export default FlashcardSetList;