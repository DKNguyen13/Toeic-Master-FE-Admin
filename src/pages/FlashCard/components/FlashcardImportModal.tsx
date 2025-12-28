import * as XLSX from "xlsx";
import React, { useState } from "react";
import api from "../../../config/axios";
import { showToast } from "../../../utils/toast";
import { Download, Upload, Check, X } from "lucide-react";

interface Flashcard {
  word: string;
  meaning: string;
  example?: string;
  note?: string;
}

interface Props {
  setId: string;
  onClose: () => void;
  onImportSuccess: () => void;
}

const FlashcardImportExcelModal: React.FC<Props> = ({
  setId,
  onClose,
  onImportSuccess,
}) => {
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [previewData, setPreviewData] = useState<Flashcard[]>([]);
  const [invalidRows, setInvalidRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFile(file);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) {
        setLoading(false);
        return;
      }

      try {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
          header: ["word", "meaning", "example", "note"],
        });

        const startIndex = jsonData[0]?.word?.toString().toLowerCase() === "word" ? 1 : 0;
        const rows = jsonData.slice(startIndex);

        const validRows: Flashcard[] = [];
        const invalidIndices: number[] = [];

        rows.forEach((row: any, idx: number) => {
          const rowNumber = idx + startIndex + 1;

          const word = (row.word || "").toString().trim();
          const meaning = (row.meaning || "").toString().trim();

          if (!word || !meaning) {
            invalidIndices.push(rowNumber);
            return;
          }

          validRows.push({
            word,
            meaning,
            example: row.example ? row.example.toString().trim() : undefined,
            note: row.note ? row.note.toString().trim() : undefined,
          });
        });

        if (validRows.length === 0) {
          showToast("Không tìm thấy dữ liệu hợp lệ! Vui lòng kiểm tra cột word và meaning.", "error", { autoClose: 500 });
          setExcelFile(null);
          setLoading(false);
          return;
        }

        if (invalidIndices.length > 0) {
          showToast(`Bỏ qua ${invalidIndices.length} dòng thiếu từ hoặc nghĩa (dòng: ${invalidIndices.join(", ")})`, "warn", { autoClose: 500 });
        }

        setPreviewData(validRows);
        setInvalidRows(invalidIndices);
        setStep("preview");
      } catch (err) {
        console.error(err);
        showToast("File Excel không hợp lệ hoặc bị lỗi định dạng!", "error", { autoClose: 500 });
        setExcelFile(null);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = async () => {
    if (previewData.length === 0) return;

    setLoading(true);
    try {
      const res = await api.post("/flashcard/import", {
        setId,
        flashcards: previewData,
      });

      const count = res.data.data?.length || previewData.length;
      showToast(`${count} flashcards đã được import thành công!`, "success", { autoClose: 500 });

      onImportSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Import thất bại!", "error", { autoClose: 500 });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("upload");
    setPreviewData([]);
    setInvalidRows([]);
    setExcelFile(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Import Flashcards từ Excel
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={28} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {step === "upload" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Chọn file Excel (.xlsx, .xls)</label>
              <label
                htmlFor="excel-upload"
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
                  Cột bắt buộc: <strong>word</strong>, <strong>meaning</strong> • Tùy chọn: example, note
                </p>
              </label>

              <input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
                disabled={loading}
              />

              <div className="text-center mt-4">
                <a href="/templates/flashcard-template.xlsx"
                  download="flashcard-template.xlsx"
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm underline">
                  <Download size={16} />
                  Tải file Excel mẫu (.xlsx)
                </a>
              </div>

              {loading && (
                <div className="text-center mt-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                  <p className="text-gray-600 mt-2">Đang xử lý file...</p>
                </div>
              )}
            </div>
          )}

          {step === "preview" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Xem trước ({previewData.length} flashcard hợp lệ)
              </h3>

              {invalidRows.length > 0 && (
                <p className="text-sm text-red-600 mb-3 flex items-center gap-1">
                  <X size={16} />
                  Đã bỏ qua {invalidRows.length} dòng thiếu từ hoặc nghĩa
                </p>
              )}

              <div className="max-h-[60vh] overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Từ vựng</th>
                      <th className="px-4 py-3 text-left font-semibold">Nghĩa</th>
                      <th className="px-4 py-3 text-left font-semibold">Ví dụ</th>
                      <th className="px-4 py-3 text-left font-semibold">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((item, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{item.word}</td>
                        <td className="px-4 py-3">{item.meaning}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {item.example || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {item.note || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button onClick={step === "upload" ? onClose : handleBack} className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium">
              {step === "upload" ? "Hủy" : "Quay lại"}
            </button>

            {step === "preview" && (
              <button onClick={handleConfirmImport}
                disabled={loading || previewData.length === 0}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium">
                {loading ? (
                  "Đang import..."
                ) : (
                  <>
                    <Check size={18} />
                    Import {previewData.length} thẻ
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardImportExcelModal;