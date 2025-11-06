import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../../config/axios";
import { getTestDetail } from "../../../../service/testService";
import { toast, ToastContainer } from "react-toastify";
import LoadingSkeleton from "../../../../components/common/LoadingSpinner/LoadingSkeleton";

interface Test {
  slug: string;
  title: string;
}

interface PartData {
  partNumber: number;
  description?: string;
  instructions?: string;
  audioFile?: string;
  totalQuestions: number;
  tags: string[];
}

const questionLimits: Record<number, number> = {
  1: 6,
  2: 25,
  3: 39,
  4: 30,
  5: 30,
  6: 16,
  7: 54,
};

const CreatePartPage: React.FC = () => {
  const navigate = useNavigate();
  const [testDetail, setTestDetail] = useState<Test | null>(null);
  const [loadingTest, setLoadingTest] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PartData>({
    partNumber: 1,
    totalQuestions: questionLimits[1],
    description: "",
    instructions: "",
    audioFile: "",
    tags: [],
  });

  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");

  // Fetch danh sách đề thi
  useEffect(() => {
    const fetchTest = async () => {
      setLoadingTest(true);
      try {
        const res = await getTestDetail(slug);
        setTestDetail(res?.data?.test);
      } catch (err) {
        setError("Không thể tải đề thi");
      } finally {
        setLoadingTest(false);
      }
    };
    fetchTest();
  }, [slug]);

  // Handle input change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "partNumber") {
      const number = Number(value);
      setFormData((prev) => ({
        ...prev,
        partNumber: number,
        totalQuestions: questionLimits[number],
      }));
      return;
    }

    if (name === "tags") {
      const tagsArray = value.split(",").map((t) => t.trim());
      setFormData((prev) => ({ ...prev, tags: tagsArray }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Gắn slug vào partData
      const partDataWithSlug = {
        ...formData,
        slug: slug,
      };

      await api.post(`/part`, {
        partData: partDataWithSlug,
      });
      setSubmitting(true);
      toast.success("Tạo Part thành công!");
      setFormData({
        partNumber: 1,
        totalQuestions: questionLimits[1],
        description: "",
        instructions: "",
        audioFile: "",
        tags: [],
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đã xảy ra lỗi khi tạo Part");
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
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            🧩 Tạo mới Part TOEIC
          </h1>

          {/* Hiển thị đề thi */}
          <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            {loadingTest ? (
              <p>⏳ Đang tải thông tin đề thi...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : testDetail ? (
              <p className="font-semibold text-blue-700">
                📝 Đề thi:
                <span className="text-blue-900 ml-1">{testDetail.title}</span>
              </p>
            ) : null}
          </div>

          {/* Form tạo Part */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Chọn số Part */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số Part
              </label>
              <select
                name="partNumber"
                value={formData.partNumber}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                {Array.from({ length: 7 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    Part {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Số lượng câu hỏi (tự động gán) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng câu hỏi
              </label>
              <input
                type="number"
                name="totalQuestions"
                value={formData.totalQuestions}
                readOnly
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả (tùy chọn)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 h-20"
                placeholder="Nhập mô tả cho Part..."
              />
            </div>

            {/* Hướng dẫn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hướng dẫn (tùy chọn)
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 h-20"
                placeholder="Nhập hướng dẫn làm bài..."
              />
            </div>

            {/* Audio URL
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Audio file (tùy chọn)
            </label>
            <input
              type="text"
              name="audioFile"
              value={formData.audioFile || ""}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="URL file audio nếu có"
            />
          </div> */}

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (phân tách bằng dấu phẩy)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags.join(", ")}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="VD: ETS, Reading"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
              >
                Quay lại
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Tạo Part
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

export default CreatePartPage;
