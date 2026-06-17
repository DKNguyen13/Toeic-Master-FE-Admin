import api from "../../../config/axios";
import FlashcardItem from "./FlashcardItem";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import { showToast } from "../../../utils/toast";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Book } from "lucide-react";
import * as XLSX from "xlsx";
import FlashcardImportExcelModal from "./FlashcardImportModal";
import AddFlashcardModal from "../modal/AddFlashcardModal";
import EditFlashcardModal from "./EditFlashcardModal";

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
  onBack?: () => void;
}

const FlashcardList: React.FC<FlashcardListProps> = ({ setId, type: propType, onBack }) => {
  const location = useLocation();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const type = propType || location.state?.type || "myList";
  const editable = type === "myList";
  const [editCard, setEditCard] = useState<Flashcard | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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

  useEffect(() => {
    fetchFlashcards();
  }, [setId]);

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
        <div className="relative mb-8">
          {onBack && (
            <button onClick={onBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
              <ArrowLeft size={18} />Quay lại
            </button>
          )}

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">📚 Flashcards</h1>
            <p className="text-gray-600">Học từ vựng hiệu quả với flashcards</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {editable && (
            <div onClick={() => setShowModal(true)}
              className="group border-2 border-dashed border-blue-300 rounded-2xl flex flex-col justify-center items-center h-64 text-blue-500 hover:bg-blue-50 cursor-pointer transition">
              <div className="text-4xl font-bold">+</div>
              <p className="font-semibold mt-2">Thêm flashcard</p>
            </div>
          )}
          {flashcards.length > 0 ? (
            flashcards.map((card) => (
              <FlashcardItem
                key={card._id}
                flashcard={card}
                onDelete={editable ? (id: string) => setDeleteCardId(id) : undefined}
                onEdit={(card) => {
                  setEditCard(card);
                  setShowEditModal(true);
                }}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="p-4 bg-blue-50 rounded-full mb-4">
                <Book className="w-10 h-10 text-blue-500" />
              </div>

              <h3 className="text-lg font-bold text-gray-700 mb-2">
                Chưa có flashcard nào
              </h3>

              <p className="text-gray-500 text-sm text-center max-w-xs">
                Thêm flashcard để bắt đầu quản lý nội dung.
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        {editable && showModal && setId && (
          <AddFlashcardModal
            setId={setId}
            onClose={() => setShowModal(false)}
            onSuccess={(newCard) =>
              setFlashcards((prev) => [...prev, newCard])
            }
            onOpenImport={() => setShowImportModal(true)}
          />
        )}

        {showEditModal && editCard && (
          <EditFlashcardModal
            flashcard={editCard}
            onClose={() => setShowEditModal(false)}
            onSave={async (data) => {
              try {
                const res = await api.put(`/flashcard/${data._id}`, data);

                setFlashcards((prev) =>
                  prev.map((f) => (f._id === data._id ? res.data.data : f))
                );

                setShowEditModal(false);
                showToast("Cập nhật thành công!", "success");
              } catch (err: any) {
                showToast(err.response?.data?.message || "Lỗi update", "error");
              }
            }}
          />
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