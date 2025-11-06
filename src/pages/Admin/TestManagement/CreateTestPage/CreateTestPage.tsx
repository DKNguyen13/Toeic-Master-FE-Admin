import React, { useState, ChangeEvent, FormEvent } from "react";
import api from "../../../../config/axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import LoadingSkeleton from "../../../../components/common/LoadingSpinner/LoadingSkeleton";

interface TestData {
  title: string;
  audio?: string;
  testCode: string;
}

const CreateTestPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<TestData>({
    title: "",
    testCode: "",
    audio: "",
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 🔹 Xử lý thay đổi text input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Xử lý chọn file audio
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
      setFormData((prev) => ({ ...prev, audio: "" })); // reset URL nếu có file
    }
  };

  // 🔹 Submit form
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const form = new FormData();

      // Gửi testData dạng JSON string
      form.append("testData", JSON.stringify(formData));

      // Nếu có file audio → append
      if (audioFile) {
        form.append("audio", audioFile);
      }

      await api.post("/test", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitting(true);
      toast.success("Tạo đề thi thành công!");
      setFormData({ title: "", testCode: "", audio: "" });
      setAudioFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tạo đề thi!");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            📝 Tạo mới đề thi TOEIC
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tên đề thi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đề thi
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: 2024 Practice Set TOEIC Test 1"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                required
              />
            </div>

            {/* Mã đề thi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã đề thi
              </label>
              <input
                type="text"
                name="testCode"
                value={formData.testCode}
                onChange={handleChange}
                placeholder="VD: ETS2024T1"
                className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                required
              />
            </div>

            {/* Audio input (file hoặc URL) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                 URL Audio
              </label>

              {/* File upload
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="block w-full border rounded-lg px-3 py-2 mb-2"
              /> */}

              {/* Nếu không upload file thì cho nhập URL */}
              {!audioFile && (
                <input
                  type="url"
                  name="audio"
                  value={formData.audio}
                  onChange={handleChange}
                  placeholder="https://cdn.yourdomain.com/audio/test1.mp3"
                  className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-blue-200"
                />
              )}

              {/* Hiển thị tên file nếu có */}
              {audioFile && (
                <p className="text-sm text-gray-600 mt-1">
                  🎵 File đã chọn: {audioFile.name}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Quay lại
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition duration-200"
              >
                Tạo đề thi
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
};

export default CreateTestPage;
