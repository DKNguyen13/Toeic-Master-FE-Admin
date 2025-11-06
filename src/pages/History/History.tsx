import React, { useState, useEffect } from "react";
import { FaRegClock } from "react-icons/fa";
import LeftSidebarUser from "../../components/LeftSidebarUser";
import HistoryTestCard from "../../components/HistoryTestCard";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ProgressCard from "./components/ProgressCard";
import { useSessionsUser } from "../MockTest/hooks/useTestSession";
import { getUserStatistics } from "../../service/sessionService";

// Đăng ký các thành phần cần thiết của ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HistoryPage: React.FC = () => {
  const [statistics, setStatistics] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setStatsLoading(true);
        const data = await getUserStatistics();
        setStatistics(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStatistics();
  }, []);

  const chartData = {
    labels: ["Listening", "Reading"],
    datasets: [
      {
        label: "Điểm trung bình",
        data: [
          statistics?.averageListeningScore || 0,
          statistics?.averageReadingScore || 0
        ],
        backgroundColor: [
          "rgba(249, 115, 22, 0.8)",
          "rgba(37, 99, 235, 0.8)"
        ],
        borderColor: [
          "rgb(249, 115, 22)",
          "rgb(37, 99, 235)"
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Điểm trung bình theo kỹ năng",
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} điểm`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 495,
        title: {
          display: true,
          text: "Điểm số",
        },
      },
    },
  };

  const { sessions, error, loading, pagination, setPage } = useSessionsUser();

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!sessions) return <p className="text-center">No result found</p>;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Phần trên: LeftSidebar + Biểu đồ */}
      <div className="flex-1 flex pl-8 pr">
        {/* Left Sidebar */}
        <LeftSidebarUser customHeight="h-auto w-64" />

        {/* Khu vực Biểu đồ (Tổng quan) */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Lịch sử làm bài
          </h1>

          <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-6">
            {/* Biểu đồ điểm trung bình */}
            <div className="flex-1 flex flex-col items-center justify-center border-r border-gray-200 pr-6">
              <h2 className="text-xl font-semibold mb-4">Thống kê điểm số</h2>
              {statsLoading ? (
                <div className="w-full h-64 flex items-center justify-center">
                  <p className="text-gray-400">Đang tải...</p>
                </div>
              ) : statistics?.totalSessions === 0 ? (
                <div className="w-full h-64 flex items-center justify-center">
                  <p className="text-gray-400">Chưa có dữ liệu thống kê</p>
                </div>
              ) : (
                <div className="w-full h-64">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              )}
              <div className="flex space-x-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Listening: {statistics?.averageListeningScore || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>Reading: {statistics?.averageReadingScore || 0}</span>
                </div>
              </div>
            </div>

            {/* Thông tin thống kê */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Tổng điểm trung bình</p>
                  <p className="text-4xl font-bold text-gray-800">
                    {statistics?.averageTotalScore || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">/ 990 điểm</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600">Số bài đã làm</p>
                    <p className="text-2xl font-semibold text-gray-800 mt-1">
                      {statistics?.totalSessions || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600">Loại bài thi</p>
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      Full Test
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phần dưới: Danh sách bài test */}
      <div className="bg-white p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((item) => (
            <HistoryTestCard
              key={item._id}
              id={item._id}
              title={item.testId.title}
              totalScore={item?.results?.totalScore}
              result={item.progress.answeredCount}
              totalQuestions={item.progress.totalQuestions}
              accuracy={item?.results?.accuracy}
              time={item.time}
              createdAt={item.createdAt}
              sessionType={item.sessionType}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center bg-white shadow-sm rounded-full px-4 py-2 space-x-2">
            {/* Prev */}
            <button
              disabled={pagination.current === 1}
              onClick={() => setPage(pagination.current - 1)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                pagination.current === 1
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50 active:bg-blue-100"
              }`}
            >
              ← Prev
            </button>

            {/* Page numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: pagination.pages }, (_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200 ${
                      pagination.current === pageNumber
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            {/* Next */}
            <button
              disabled={pagination.current === pagination.pages}
              onClick={() => setPage(pagination.current + 1)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                pagination.current === pagination.pages
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50 active:bg-blue-100"
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
