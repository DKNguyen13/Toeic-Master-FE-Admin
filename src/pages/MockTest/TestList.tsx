import React, { useEffect, useState } from "react";
import api from "../../config/axios";
import TestCard from "./component/TestCard";
import { getAllTest } from "../../service/testService";
import Pagination from "../../components/common/Pagination/Pagination";
import LoadingSkeleton from "../../components/common/LoadingSpinner/LoadingSkeleton";
import { FileText } from "lucide-react";

interface TestListProps {
  limit?: number; // Giới hạn số test mỗi trang
  showPagination?: boolean; // Ẩn/hiện phân trang
  compact?: boolean;
}

interface Test {
  slug: string;
  title: string;
  description?: string;
  statistics?: {
    totalAttempts?: number;
    totalComments?: number;
  };
}

const TestList: React.FC<TestListProps> = ({
  limit = 9,
  showPagination = true,
  compact = false,
}) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalTests, setTotalTests] = useState<number>(0);

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const response = await getAllTest(currentPage, limit);
        if (!response) {
          setError("Không có đề thi nào");
          return;
        }
        setTests(response.tests || []);
        setTotalTests(response.pagination?.totalTests || 0);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, [currentPage, limit]);

  if (loading)
    return <LoadingSkeleton />

  if (error)
    return (
      <div className="flex justify-center items-center mt-12">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );

  const containerClass = compact
  ? "flex flex-row gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent snap-x snap-mandatory"
  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-[1000px] mx-auto justify-center";

  return (
    <section
      className={`flex flex-col items-center ${
        compact ? "" : "justify-center mt-12"
      }`}
    >
      {!compact && (
      <div className="w-full max-w-[1100px] flex flex-col items-center mb-8 text-center">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">
            Danh sách đề thi
          </h2>
        </div>
        <p className="text-gray-600 mt-2 text-base max-w-xl">
          Lựa chọn đề thi TOEIC phù hợp để ôn luyện và kiểm tra trình độ.
        </p>
      </div>
    )}
      <div>
        <div className={containerClass}>
          {tests.map((item, index) => (
            <TestCard
              key={index}
              slug={item.slug}
              title={item.title}
              questions={200}
              time={120}
              attempts={item.statistics?.totalAttempts || 0}
              totalComments={item.statistics?.totalComments || 0}
            />
          ))}
        </div>

        {showPagination && totalTests > limit && (
          <Pagination
            totalItems={totalTests}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={limit}
          />
        )}
      </div>
    </section>
  );
};

export default TestList;
