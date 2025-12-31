import { Trash2 } from "lucide-react";
import { createPortal } from "react-dom";

interface Props {
  lessonId: string;
  onConfirm: (id: string) => void;
  onClose: () => void;
}

const DeleteLessonModal: React.FC<Props> = ({
  lessonId,
  onConfirm,
  onClose,
}) => {
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Trash2 size={24} className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Xác nhận xóa
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Bạn có chắc chắn muốn xóa bài học này?
            <br />Hành động này không thể hoàn tác.
          </p>
        </div>

        <div className="mt-6 flex gap-3 justify-center">
          <button onClick={() => onConfirm(lessonId)}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Xóa
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
            Hủy
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteLessonModal;