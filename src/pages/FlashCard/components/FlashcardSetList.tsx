import api from "../../../config/axios";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../../utils/toast";
import React, { useEffect, useRef, useState } from "react";
import LoginModal from "../../../layouts/common/LoginModal";
import { Book, Inbox, Library, Search, Star, Trash } from "lucide-react";

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
  const [deleteSetId, setDeleteSetId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const closeModal = () => {
    setShowModal(false);
    setError("");
  };

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
      showToast(err.response?.data?.message || "Không thể tải dữ liệu!", "error", { autoClose: 1500 });         
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteSetId) return;
    try {
      await api.delete(`/flashcard-set/${deleteSetId}`);
      setSets(prev => prev.filter(s => s._id !== deleteSetId));
      showToast("Xóa bộ flashcard thành công!", "success", { autoClose: 1500 });
    } catch (err: any) {
      showToast(err.response?.data?.message || "Không thể xóa bộ flashcard!", "error", { autoClose: 1500 });
    } finally {
      setDeleteSetId(null);
    }
  };

  const handleAdd = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!form.name) {
      setError("Vui lòng nhập tên bộ flashcard!");
      return;
    }

    try {
      const res = await api.post("/flashcard-set", form);
      setSets((prev) => [...prev, res.data.data]);
      setShowModal(false);
      setForm({ name: "", description: "" });
      showToast("Thêm bộ từ vựng thành công!", "success", {autoClose: 1500});
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi tạo bộ từ vựng!");
    }
  };

  const handleSetClick = (setId?: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      navigate(`/admin/flashcards/${setId}`, { state: { type } });
    }
  };

  const didFetch = useRef(false);
  
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchSets();
  }, [isLoggedIn, type]);

  return (
    <div className="min-h-screenp-6 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4 space-x-2">
            {type === "myList" ? (
              <Library className="w-6 h-6 text-blue-500" />
            ) : (
              <Star className="w-6 h-6 text-yellow-400" />
            )}
            <h1 className="text-2xl font-bold text-gray-800">
              {type === "myList" ? "Bộ Từ Vựng Của Bạn" : "Khám Phá Flashcards"}
            </h1>
          </div>
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
            <div
              onClick={() => {
                if (!isLoggedIn) setShowLoginModal(true);
                else setShowModal(true);
              }}
              className="group flex flex-col justify-center items-center h-56 bg-white border-2 border-dashed border-blue-300 rounded-2xl shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 p-4">
              <div className="w-20 h-20 flex items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors shadow-inner">
                <span className="text-3xl text-blue-500 font-bold">+</span>
              </div>
              <p className="text-lg font-semibold text-blue-600 mt-4 text-center">Tạo Mới</p>
              <p className="text-sm text-blue-400 mt-1 text-center">Tạo bộ từ vựng của riêng bạn</p>
            </div>
            )}

            {/* Modal xác nhận xóa */}
            {deleteSetId && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-fadeIn">
                  <h2 className="text-2xl font-semibold text-center text-gray-800 mb-2">Xác nhận xóa</h2>
                  <p className="text-gray-600 mb-6">
                    Bạn có chắc muốn xóa bộ {sets.find(s => s._id === deleteSetId)?.name || ""} này?<br></br> Hành động này không thể hoàn tác.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setDeleteSetId(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                      Hủy
                    </button>
                    <button onClick={confirmDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                      Xóa
                    </button>
                  </div>
                </div>
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
                          <Book className="text-white text-2xl" />
                        </div>
                        {type === "myList" && isLoggedIn && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteSetId(set._id!);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg hover:bg-red-50">
                            <Trash className="text-red-500 text-lg" />
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
              <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="p-4 bg-blue-50 rounded-full mb-4">
                  {type === "myList" ? (
                    <Inbox className="w-10 h-10 text-blue-500" />
                  ) : (
                    <Search className="w-10 h-10 text-blue-500" />
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  { type === "myList" ? "Chưa có bộ từ vựng nào" : "Hiện chưa có flashcards miễn phí" }
                </h3>

                <p className="text-gray-500 text-sm text-center max-w-xs">
                  { type === "myList"
                    ? "Nhấn vào nút '+' để tạo bộ từ vựng đầu tiên và bắt đầu hành trình học tập của bạn!"
                    : "Hãy quay lại sau để khám phá các bộ flashcards mới từ cộng đồng." }
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {type === "myList" && showModal && isLoggedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={closeModal}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Tạo bộ từ vựng mới</h2>
              <p className="text-gray-500 mt-2">Bắt đầu xây dựng bộ từ vựng của riêng bạn</p>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tên bộ từ vựng: <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  placeholder="VD: Từ vựng TOEIC Part 1..."
                  maxLength={25}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
                <span className="text-xs text-gray-500">
                  {form.name.length}/25 ký tự
                </span>
                <p className="text-red-500 text-sm mt-2">
                  {error.includes("Nâng cấp VIP") ? (
                    <>
                      Bạn đã đạt giới hạn bộ flashcard.{" "}
                      <a href="/payment" className="text-blue-500">
                        Nâng cấp VIP
                      </a>{" "}
                      để tạo thêm!
                    </>
                  ) : (
                    error
                  )}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mô tả (tùy chọn):
                </label>
                <textarea
                  name="description"
                  placeholder="Thêm mô tả về bộ flashcard của bạn..."
                  maxLength={25}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                  rows={2}
                />
                <span className="text-xs text-gray-500">
                  {form.description.length}/25 ký tự
                </span>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={handleAdd}
                className="flex-1 px-6 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200">
                Tạo mới
              </button>
              <button onClick={closeModal}
                className="flex-1 px-6 py-3 text-base font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal login */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};

export default FlashcardSetList;