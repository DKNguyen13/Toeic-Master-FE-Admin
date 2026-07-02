import api from "../../../config/axios";
import FlashcardItem from "./FlashcardItem";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import { ArrowLeft, Book } from "lucide-react";
import { showToast } from "../../../utils/toast";
import React, { useEffect, useState } from "react";
import EditFlashcardModal from "./EditFlashcardModal";
import AddFlashcardModal from "../modal/AddFlashcardModal";
import FlashcardImportExcelModal from "./FlashcardImportModal";
import Pagination from "../../../components/common/Pagination/Pagination";
import ConfirmDeleteModal from "../../FlashcardSet/modals/DeleteFlashcardModal";

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
  const [currentPage, setCurrentPage] = useState(1);
  const MY_LIST_ITEMS_PER_PAGE = 11;
  const EXPLORE_ITEMS_PER_PAGE = 12;

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

  const confirmDeleteCard = async () => {
    if (!deleteCardId) return;

    try {
      await api.delete(`/flashcard/${deleteCardId}`);
      const updatedCards = flashcards.filter((f) => f._id !== deleteCardId);
      setFlashcards(updatedCards);

      const newTotalPages = editable
        ? updatedCards.length <= 11
          ? 1
          : 1 + Math.ceil((updatedCards.length - 11) / 12)
        : Math.ceil(updatedCards.length / 12);

      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }

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

  const getPaginatedFlashcards = () => {
    if (editable) {
      const start = (currentPage - 1) * MY_LIST_ITEMS_PER_PAGE;
      return flashcards.slice(start, start + MY_LIST_ITEMS_PER_PAGE);
    }

    const start = (currentPage - 1) * EXPLORE_ITEMS_PER_PAGE;
    return flashcards.slice(start, start + EXPLORE_ITEMS_PER_PAGE);
  };

  const paginatedFlashcards = getPaginatedFlashcards();
  const totalPages = editable
    ? Math.ceil(flashcards.length / MY_LIST_ITEMS_PER_PAGE)
    : Math.ceil(flashcards.length / EXPLORE_ITEMS_PER_PAGE);

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
        <ConfirmDeleteModal
          open={!!deleteCardId}
          message="Bạn có chắc muốn xóa flashcard? Hành động này không thể hoàn tác."
          onCancel={() => setDeleteCardId(null)}
          onConfirm={confirmDeleteCard}
        />

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
            paginatedFlashcards.map((card) => (
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
              <h3 className="text-lg font-bold text-gray-700 mb-2">Chưa có flashcard nào</h3>
              <p className="text-gray-500 text-sm text-center max-w-xs">Thêm flashcard để bắt đầu quản lý nội dung.</p>
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

        {totalPages > 1 && (
          <div className="px-4 py-4 mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
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