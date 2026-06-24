import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TestImportForm from "./TestImportForm";
import { importTest } from "../../../../service/testService";
import { showToast } from "../../../../utils/toast";

interface ImportResponse {
  success: boolean;
  message: string;
  testId?: string;
}

const TestImportPage: React.FC = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadedTestId, setUploadedTestId] = useState<string>("");

  const handleImport = async (formData: FormData): Promise<void> => {
    setIsUploading(true);

    try {
      const response = await importTest(formData);
      
      setUploadSuccess(true);
      setUploadedTestId(response.testId || "");
      showToast("Tạo đề thi thành công!", "success");
    } catch (err: any) {
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        "Không thể tạo đề thi. Vui lòng kiểm tra lại file Excel.";
      
      showToast(errorMessage, "error");
      
      if (err.response?.data?.validationErrors) {
        const validationErrors = err.response.data.validationErrors;
        Object.keys(validationErrors).forEach((key) => {
          showToast(`${key}: ${validationErrors[key]}`, "error");
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (isUploading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
        <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mb-4">
            <svg
              className="h-8 w-8 text-blue-500 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">Đang xử lý…</h2>
          <p className="text-gray-500 text-sm">
            Đang upload audio lên S3 và tạo đề thi từ file Excel. Vui lòng chờ.
          </p>
        </div>
      </div>
    );
  }


  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Tạo đề thi thành công!
            </h2>
            <p className="text-gray-600 mb-6">
              Đề thi đã được tạo. Bạn cần kích hoạt đề thi để sử dụng.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/admin/testmanagement")}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Quay về danh sách
              </button>
              <button
                onClick={() => {
                  setUploadSuccess(false);
                  setUploadedTestId("");
                }}
                className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition duration-200"
              >
                Tạo đề khác
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📥 Nhập đề thi TOEIC từ Excel
          </h1>
          <p className="text-gray-600">
            Tải lên file Excel chứa thông tin đề thi và danh sách câu hỏi để tạo đề thi tự động.
          </p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Lưu ý:</strong> File Excel cần tuân theo đúng định dạng mẫu. Đảm bảo các cột dữ liệu đầy đủ và hợp lệ.
              </p>
            </div>
          </div>
        </div>

        <TestImportForm onSubmit={handleImport} onCancel={() => navigate(-1)} />
      </div>
    </div>
  );
};

export default TestImportPage;
