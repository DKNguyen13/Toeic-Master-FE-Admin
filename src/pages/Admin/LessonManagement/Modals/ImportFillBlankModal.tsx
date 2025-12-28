import React from "react";
import { createPortal } from "react-dom";
import { Download, Upload, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  excelFile: File | null;
  previewData: any[];
  isImporting: boolean;

  onClose: () => void;
  onExcelFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImport: () => void;
}

const ImportFillBlankModal: React.FC<Props> = ({
  isOpen,
  excelFile,
  previewData,
  isImporting,
  onClose,
  onExcelFileChange,
  onImport,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-300 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Thêm file nghe và điền từ
          </h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <X size={28} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn file Excel (.xlsx, .xls)
            </label>

            <label htmlFor="excel-upload"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                excelFile
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}>
              <Upload
                size={48}
                className={excelFile ? "text-green-600" : "text-gray-400"}
              />
              <p className="mt-4 text-lg font-medium text-gray-700">
                {excelFile ? excelFile.name : "Kéo thả file hoặc click để chọn"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Cột bắt buộc: sentence, blank1, blank2, ...
              </p>
            </label>

            <input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={onExcelFileChange}
            />

            <div className="text-center mt-4">
              <a href="/templates/listening-fillblank-template.xlsx" download
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm underline">
                <Download size={16} />
                Tải file Excel mẫu (.xlsx)
              </a>
            </div>
          </div>

          {/* Preview */}
          {previewData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Xem trước ({previewData.length} câu hỏi)
              </h3>

              <div className="max-h-96 overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left">STT</th>
                      <th className="px-4 py-3 text-left">Câu hỏi</th>
                      <th className="px-4 py-3 text-center">Số chỗ trống</th>
                      <th className="px-4 py-3 text-left">Đáp án</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((item) => (
                      <tr key={item.no} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{item.no}</td>
                        <td className="px-4 py-3 max-w-md truncate">
                          {item.sentence}
                        </td>
                        <td className="px-4 py-3 text-center text-indigo-600 font-medium">
                          {item.blankCount}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.blanks.map((b: any, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs"
                              >
                                {i + 1}: {b.answer}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button onClick={onClose} className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300">Hủy</button>
            <button onClick={onImport}
              disabled={!excelFile || previewData.length === 0 || isImporting}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
              {isImporting ? "Đang nhập..." : `Nhập ${previewData.length} câu hỏi`}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImportFillBlankModal;