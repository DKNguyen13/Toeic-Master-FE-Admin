import React, { useState, ChangeEvent, FormEvent } from "react";
import AudioUploader from "../../../../components/common/AudioUploader/AudioUploader";
import { Music } from "lucide-react";

interface TestImportFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

interface FormFields {
  title: string;
}

const TestImportForm: React.FC<TestImportFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState<string>("");
  const [titleError, setTitleError] = useState<string>("");

  // Audio file state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>("");
  const [audioError, setAudioError] = useState<string>("");

  // Excel file state
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (titleError) setTitleError("");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileError("");

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      const validExtensions = [".xlsx", ".xls"];
      const fileExtension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        setFileError("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
        setExcelFile(null);
        e.target.value = "";
        return;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setFileError("File vượt quá dung lượng cho phép (10MB)");
        setExcelFile(null);
        e.target.value = "";
        return;
      }

      setExcelFile(file);
    }
  };

  const validateForm = (): boolean => {
    let valid = true;

    if (!title.trim()) {
      setTitleError("Tên đề thi không được để trống");
      valid = false;
    } else if (title.length < 3) {
      setTitleError("Tên đề thi phải có ít nhất 3 ký tự");
      valid = false;
    }

    if (!audioFile) {
      setAudioError("Vui lòng chọn file audio cho đề thi");
      valid = false;
    }

    if (!excelFile) {
      setFileError("Vui lòng chọn file Excel");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitFormData = new FormData();
    submitFormData.append("title", title.trim());

    if (audioFile) {
      submitFormData.append("audio", audioFile);
    }

    if (excelFile) {
      submitFormData.append("file", excelFile);
    }

    await onSubmit(submitFormData);
  };

  const handleRemoveFile = () => {
    setExcelFile(null);
    setFileError("");
    const fileInput = document.getElementById("excel-file") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tên đề thi <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="VD: TOEIC Practice Test 2024"
          maxLength={200}
          className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:outline-none transition ${
            titleError ? "border-red-500" : "border-gray-300"
          }`}
        />
        {titleError && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {titleError}
          </p>
        )}
      </div>

      {/* Audio upload */}
      <div>
        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
          <Music className="w-4 h-4" />
          File Audio <span className="text-red-500">*</span>
        </label>
        <AudioUploader
          currentUrl={audioPreviewUrl}
          onFileChange={(file, previewUrl) => {
            setAudioFile(file);
            setAudioPreviewUrl(previewUrl);
            if (audioError) setAudioError("");
          }}
          onClear={() => {
            setAudioFile(null);
            setAudioPreviewUrl("");
          }}
          accentColor="#2563eb"
        />
        {audioError && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {audioError}
          </p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          File audio cho phần Listening của đề thi. Hỗ trợ MP3, WAV, M4A, OGG (tối đa 50MB)
        </p>
      </div>

      {/* Excel file */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:border-blue-400 transition">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          File Excel <span className="text-red-500">*</span>
        </label>

        {!excelFile ? (
          <div className="flex flex-col items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <label
              htmlFor="excel-file"
              className="cursor-pointer bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
            >
              Chọn file Excel
            </label>
            <input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-gray-500 text-sm mt-3">
              Chấp nhận file .xlsx, .xls (tối đa 10MB)
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg
                className="w-10 h-10 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-medium text-gray-800">{excelFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(excelFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-red-600 hover:text-red-800 transition"
              title="Xóa file"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {fileError && (
          <p className="text-red-500 text-sm mt-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {fileError}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition duration-200"
        >
          Quay lại
        </button>

        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span>Tạo đề thi</span>
        </button>
      </div>
    </form>
  );
};

export default TestImportForm;
